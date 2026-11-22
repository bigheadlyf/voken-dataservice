"""Aliyun mainland SMS RPC adapter. No live messages are sent unless explicitly configured."""
import base64
from datetime import timedelta
from hashlib import sha1,sha256
import hmac
import json
from secrets import randbelow,token_urlsafe
from urllib.parse import quote
import httpx
from fastapi import HTTPException
from sqlalchemy import delete,or_
from app.db import SmsChallenge,utcnow,write_transaction
from app.verification import IssuedChallenge


def signature(parameters,secret):
    canonical='&'.join(quote(str(key),safe='~')+'='+quote(str(parameters[key]),safe='~') for key in sorted(parameters))
    message='GET&%2F&'+quote(canonical,safe='~')
    return base64.b64encode(hmac.new((secret+'&').encode(),message.encode(),sha1).digest()).decode()


class AliyunVerificationProvider:
    def __init__(self,settings,sessions,transport=None):
        self.settings,self.sessions=settings,sessions
        self.client=httpx.Client(timeout=httpx.Timeout(10,connect=5),transport=transport,follow_redirects=False)

    def close(self):self.client.close()

    def digest(self,phone,challenge,code):
        return hmac.new(self.settings.sms_code_secret.encode(),
            json.dumps([phone,challenge,code],ensure_ascii=True).encode(),sha256).hexdigest()

    def request(self,phone):
        challenge=token_urlsafe(24);code=f'{randbelow(1000000):06d}'
        parameters={'Action':'SendSms','Version':'2017-05-25','RegionId':'cn-hangzhou',
            'Format':'JSON','AccessKeyId':self.settings.sms_access_key_id,'SignatureMethod':'HMAC-SHA1',
            'SignatureVersion':'1.0','SignatureNonce':token_urlsafe(24),'Timestamp':utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
            'PhoneNumbers':phone.removeprefix('+86'),'SignName':self.settings.sms_sign_name,
            'TemplateCode':self.settings.sms_template_code,'TemplateParam':json.dumps({'code':code},separators=(',',':'))}
        parameters['Signature']=signature(parameters,self.settings.sms_access_key_secret)
        try:
            response=self.client.get('https://dysmsapi.aliyuncs.com/',params=parameters)
            response.raise_for_status();result=response.json()
            if not isinstance(result,dict) or result.get('Code')!='OK':raise ValueError()
        except (httpx.HTTPError,ValueError):
            raise HTTPException(503,'verification_delivery_unavailable') from None
        phone_hash=sha256(phone.encode()).hexdigest()
        with write_transaction(self.sessions) as session:
            session.execute(delete(SmsChallenge).where(or_(SmsChallenge.phone_hash==phone_hash,SmsChallenge.expires_at<=utcnow())))
            session.add(SmsChallenge(id=challenge,phone_hash=phone_hash,code_hash=self.digest(phone,challenge,code),
                expires_at=utcnow()+timedelta(seconds=300),attempts_left=5))
        return IssuedChallenge(challenge,300)

    def verify(self,phone,challenge_id,code):
        with write_transaction(self.sessions) as session:
            row=session.get(SmsChallenge,challenge_id,with_for_update=True)
            if row is None or row.phone_hash!=sha256(phone.encode()).hexdigest():return False
            if row.expires_at<=utcnow() or row.attempts_left<=0:
                session.delete(row);return False
            valid=code.isascii() and len(code)==6 and code.isdigit() and hmac.compare_digest(row.code_hash,self.digest(phone,challenge_id,code))
            row.attempts_left-=1
            if valid or row.attempts_left<=0:session.delete(row)
            return valid
