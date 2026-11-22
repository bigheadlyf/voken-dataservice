"""WeChat Native APIv3: signed requests, pinned public-key verification and AEAD notifications."""
import base64
from datetime import datetime,timezone
from pathlib import Path
import json
import re
import time
from secrets import token_hex
from urllib.parse import urlencode,urlsplit
import httpx
from cryptography.exceptions import InvalidSignature,InvalidTag
from cryptography.hazmat.primitives import hashes,serialization
from cryptography.hazmat.primitives.asymmetric import padding,rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class PaymentError(Exception):
    def __init__(self,code):self.code=code;super().__init__(code)


class NativePay:
    def __init__(self,settings,transport=None):
        self.settings=settings
        try:
            self.private=serialization.load_pem_private_key(Path(settings.wechat_private_key_path).read_bytes(),password=None)
            self.platform=serialization.load_pem_public_key(Path(settings.wechat_platform_public_key_path).read_bytes())
            if not isinstance(self.private,rsa.RSAPrivateKey) or not isinstance(self.platform,rsa.RSAPublicKey):raise ValueError()
            if self.private.key_size<2048 or self.platform.key_size<2048:raise ValueError()
        except (ValueError,TypeError,OSError):raise PaymentError('wechat_key_configuration_invalid') from None
        self.client=httpx.Client(timeout=httpx.Timeout(15,connect=5),transport=transport,follow_redirects=False)

    def close(self):self.client.close()

    def verify(self,headers,body):
        values={key.lower():value for key,value in headers.items()}
        try:
            timestamp=values['wechatpay-timestamp'];nonce=values['wechatpay-nonce']
            if abs(time.time()-int(timestamp))>300 or len(nonce)>128:raise ValueError()
            if values['wechatpay-serial']!=self.settings.wechat_platform_key_id:raise ValueError()
            signed=timestamp.encode()+b'\n'+nonce.encode()+b'\n'+body+b'\n'
            signature=base64.b64decode(values['wechatpay-signature'],validate=True)
            self.platform.verify(signature,signed,padding.PKCS1v15(),hashes.SHA256())
        except (KeyError,ValueError,TypeError,InvalidSignature):
            raise PaymentError('wechat_signature_invalid') from None

    def request(self,method,path,payload=None):
        body=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode() if payload is not None else b''
        timestamp=str(int(time.time()));nonce=token_hex(16)
        canonical=method+'\n'+path+'\n'+timestamp+'\n'+nonce+'\n'
        signed=canonical.encode()+body+b'\n'
        signature=base64.b64encode(self.private.sign(signed,padding.PKCS1v15(),hashes.SHA256())).decode()
        authorization=('WECHATPAY2-SHA256-RSA2048 '+
            f'mchid="{self.settings.wechat_mch_id}",nonce_str="{nonce}",timestamp="{timestamp}",'+
            f'serial_no="{self.settings.wechat_merchant_serial}",signature="{signature}"')
        try:
            response=self.client.request(method,'https://api.mch.weixin.qq.com'+path,content=body,
                headers={'Authorization':authorization,'Accept':'application/json','Content-Type':'application/json',
                    'Wechatpay-Serial':self.settings.wechat_platform_key_id,'User-Agent':'VokenDataService/1.0'})
        except httpx.RequestError:raise PaymentError('wechat_request_unavailable') from None
        if len(response.content)>65536:raise PaymentError('wechat_invalid_response')
        self.verify(response.headers,response.content)
        if not 200<=response.status_code<300:
            try:code=response.json().get('code')
            except (ValueError,AttributeError):code=None
            raise PaymentError('wechat_order_not_exist' if code=='ORDER_NOT_EXIST' else 'wechat_request_rejected')
        if response.status_code==204:return {}
        try:
            result=response.json()
            if not isinstance(result,dict):raise ValueError()
        except ValueError:raise PaymentError('wechat_invalid_response') from None
        return result

    def create(self,row):
        result=self.request('POST','/v3/pay/transactions/native',{
            'mchid':self.settings.wechat_mch_id,'appid':self.settings.wechat_app_id,
            'description':row.quote['name'][:127],'out_trade_no':row.id,
            'notify_url':self.settings.wechat_notify_url,
            'time_expire':row.expires_at.replace(tzinfo=timezone.utc).isoformat(),
            'amount':{'total':row.total_fen,'currency':'CNY'}})
        code=result.get('code_url','')
        parts=urlsplit(code) if isinstance(code,str) else None
        if not parts or parts.scheme!='weixin' or parts.netloc!='wxpay' or len(code)>2048:
            raise PaymentError('wechat_invalid_response')
        return code

    def query(self,order_id):
        if not re.fullmatch('[0-9a-f]{32}',order_id):raise PaymentError('wechat_invalid_order')
        return self.request('GET','/v3/pay/transactions/out-trade-no/'+order_id+'?'+urlencode({'mchid':self.settings.wechat_mch_id}))

    def close_order(self,order_id):
        if not re.fullmatch('[0-9a-f]{32}',order_id):raise PaymentError('wechat_invalid_order')
        return self.request('POST','/v3/pay/transactions/out-trade-no/'+order_id+'/close',{'mchid':self.settings.wechat_mch_id})

    def notification(self,headers,raw):
        self.verify(headers,raw)
        try:
            envelope=json.loads(raw)
            if envelope.get('event_type')!='TRANSACTION.SUCCESS':raise ValueError()
            resource=envelope['resource']
            if resource['algorithm']!='AEAD_AES_256_GCM' or resource.get('original_type')!='transaction':raise ValueError()
            decoded=AESGCM(self.settings.wechat_api_v3_key.encode()).decrypt(resource['nonce'].encode(),
                base64.b64decode(resource['ciphertext'],validate=True),resource.get('associated_data','').encode())
            result=json.loads(decoded)
            if not isinstance(result,dict):raise ValueError()
            return result
        except (KeyError,ValueError,TypeError,InvalidTag):
            raise PaymentError('wechat_notification_invalid') from None

    def validate_payment(self,result,row):
        try:
            if result['mchid']!=self.settings.wechat_mch_id or result['appid']!=self.settings.wechat_app_id:raise ValueError()
            if result['out_trade_no']!=row.id or result['trade_state']!='SUCCESS':raise ValueError()
            amount=result['amount']
            if type(amount['total']) is not int or amount['total']!=row.total_fen or amount['currency']!='CNY':raise ValueError()
            transaction=result['transaction_id']
            if not isinstance(transaction,str) or not re.fullmatch(r'[0-9]{10,64}',transaction):raise ValueError()
            paid=datetime.fromisoformat(result['success_time'].replace('Z','+00:00'))
            if paid.tzinfo is None:raise ValueError()
            paid=paid.astimezone(timezone.utc).replace(tzinfo=None)
            if paid>datetime.now(timezone.utc).replace(tzinfo=None):raise ValueError()
            return transaction,paid
        except (KeyError,ValueError,TypeError,AttributeError):raise PaymentError('wechat_payment_mismatch') from None
