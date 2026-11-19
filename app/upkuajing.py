from datetime import datetime, time, timedelta, timezone
from time import monotonic

import httpx

from app.deepseek import ProviderError
from app.provider_logging import record_http, safe_body


ACCOUNT_ENDPOINT = '/agent/auth/info'
TRADE_ENDPOINT = '/agent/customs/trade/list'
BUYER_SEARCH_ENDPOINT = '/agent/customs/company/list'
BUYER_PROFILE_ENDPOINT = '/agent/customs/company/detail/batch'
BUYER_CONTACT_ENDPOINT = '/agent/customs/company/contact/batch'


def company_id(value) -> int | None:
    if isinstance(value, str) and value.isascii() and value.isdigit() and len(value) <= 16:
        value = int(value)
    return value if type(value) is int and 0 < value <= 2**53 - 1 else None


def short_text_fields(row: dict, fields: tuple[str, ...]) -> dict:
    return {field: row[field].strip()[:1400] for field in fields if isinstance(row.get(field), str) and row[field].strip()}


def response_rows(body: dict, *, batch: bool = False) -> list:
    data = body.get('data')
    if isinstance(data, dict):
        if batch and 'companyId' in data:
            return [data]
        data = data.get('list')
    elif not batch:
        raise ProviderError('upkuajing_invalid_response', unknown_charge=True)
    if data is None:
        return []
    if not isinstance(data, list):
        raise ProviderError('upkuajing_invalid_response', unknown_charge=True)
    return data


def evidence_result(body: dict, records: list[dict]) -> dict:
    fee = body.get('fee')
    cost_in_fen = fee.get('apiCost') if isinstance(fee, dict) else None
    request_id = body.get('requestId')
    return {
        'source': 'upkuajing', 'records': records,
        'request_id': request_id[:128] if isinstance(request_id, str) else None,
        'reported_milli_cny': cost_in_fen * 10 if type(cost_in_fen) is int and 0 <= cost_in_fen <= 214748364 else None,
    }


class Upkuajing:
    def __init__(self, key: str, transport: httpx.BaseTransport | None = None):
        self.key = key
        self.client = httpx.Client(
            base_url='https://openapi.upkuajing.com', timeout=httpx.Timeout(45, connect=5), transport=transport,
        )

    def close(self) -> None:
        self.client.close()

    def _post(self, endpoint: str, payload: dict) -> dict:
        started = monotonic()
        record_http('request', {'method': 'POST', 'url': str(self.client.base_url.join(endpoint)),
                                'body': safe_body(payload, (self.key,))})
        try:
            response = self.client.post(endpoint, json=payload, headers={'Authorization': f'Bearer {self.key}'})
            try:
                body = response.json()
            except ValueError:
                # Arbitrary HTML/text can echo credentials; only structured JSON is retained.
                body = {'non_json': True, 'bytes': len(response.content)}
            record_http('response', {'status_code': response.status_code,
                                     'duration_ms': round((monotonic() - started) * 1000),
                                     'body': safe_body(body, (self.key,))})
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            status = error.response.status_code
            codes = {401: 'upkuajing_invalid_credentials', 402: 'upkuajing_balance_low',
                     403: 'upkuajing_access_denied', 429: 'upkuajing_rate_limited'}
            raise ProviderError(codes.get(status, 'upkuajing_request_failed'), unknown_charge=status >= 500) from None
        except httpx.RequestError as error:
            record_http('response', {'status_code': None,
                                     'duration_ms': round((monotonic() - started) * 1000),
                                     'error': type(error).__name__})
            raise ProviderError('upkuajing_response_unknown', unknown_charge=True) from None
        try:
            result = response.json()
        except ValueError:
            raise ProviderError('upkuajing_invalid_response', unknown_charge=True) from None
        if not isinstance(result, dict) or type(result.get('code')) is not int:
            raise ProviderError('upkuajing_invalid_response', unknown_charge=True)
        if result['code'] != 0:
            codes = {95: 'upkuajing_balance_low', 96: 'upkuajing_invalid_credentials',
                     97: 'upkuajing_request_failed', 98: 'upkuajing_invalid_filters'}
            raise ProviderError(codes.get(result['code'], 'upkuajing_request_failed'), unknown_charge=result['code'] == 99)
        return result

    def check_account(self) -> None:
        """Confirm authentication without issuing a trade query."""
        self._post(ACCOUNT_ENDPOINT, {})

    def search_buyers(self, filters: dict) -> dict:
        body = self._post(BUYER_SEARCH_ENDPOINT, {
            'companyType': 2, 'buyer': filters['buyer'], 'buyerCountryCodes': [filters['buyer_country']],
            'isExact': False,
        })
        matches = {}
        for row in response_rows(body)[:20]:
            if not isinstance(row, dict):
                continue
            identifier = company_id(row.get('companyId'))
            fields = short_text_fields(row, ('name', 'scope', 'address'))
            if identifier is None or not fields.get('name'):
                continue
            country_info = row.get('countryInfo')
            country = country_info.get('code_iso2') if isinstance(country_info, dict) else None
            if isinstance(country, str) and country.upper() != filters['buyer_country']:
                continue
            matches.setdefault(identifier, {**fields, 'company_id': identifier, 'buyer_country': filters['buyer_country']})
        return {**evidence_result(body, list(matches.values())), 'has_more': bool(body['data'].get('cursor'))}

    def get_buyer_profile(self, selected: dict) -> dict:
        identifier = selected['company_id']
        body = self._post(BUYER_PROFILE_ENDPOINT, {'companyIds': [identifier]})
        records = []
        for row in response_rows(body, batch=True):
            if isinstance(row, dict) and company_id(row.get('companyId')) == identifier:
                fields = short_text_fields(row, ('name', 'introduce', 'industry', 'scope', 'address',
                                                 'postcode', 'registerNumber', 'registerType', 'registerState'))
                records.append({'company_id': identifier, **fields})
                break
        return evidence_result(body, records)

    def get_buyer_contacts(self, selected: dict) -> dict:
        identifier = selected['company_id']
        body = self._post(BUYER_CONTACT_ENDPOINT, {'companyIds': [identifier]})
        contacts = []
        for row in response_rows(body, batch=True):
            if not isinstance(row, dict) or company_id(row.get('companyId')) != identifier:
                continue
            for channel in ('emails', 'phones', 'websites', 'socials'):
                items = row.get(channel)
                if not isinstance(items, list):
                    continue
                for item in items[:20]:
                    if not isinstance(item, dict) or not short_text_fields(item, ('val',)):
                        continue
                    contact = {'channel': channel, 'value': item['val'].strip()[:300]}
                    if type(item.get('is_valid')) is int and item['is_valid'] in (0, 1, 2, 3):
                        contact['validity'] = item['is_valid']
                    contacts.append(contact)
        return evidence_result(body, contacts)

    def verify_trades(self, filters: dict) -> dict:
        start = datetime.combine(datetime.fromisoformat(filters['date_start']).date(), time.min, tzinfo=timezone.utc)
        end = datetime.combine(datetime.fromisoformat(filters['date_end']).date(), time.min, tzinfo=timezone.utc)
        buyer = {'buyerId': filters['company_id']} if filters.get('company_id') else {'buyer': filters['buyer']}
        payload = {
            **buyer, 'buyerCountryCodes': [filters['buyer_country']],
            'isExact': True,
            'dateStart': int(start.timestamp() * 1000), 'dateEnd': int((end + timedelta(days=1)).timestamp() * 1000) - 1,
        }
        if filters.get('hs_code'):
            payload['hscodes'] = [filters['hs_code']]
        if filters.get('product'):
            payload['products'] = [filters['product']]
        if filters.get('arrival_country'):
            payload['arrivalCountryCodes'] = [filters['arrival_country']]

        body = self._post(TRADE_ENDPOINT, payload)
        records = []
        seen = set()
        for item in response_rows(body)[:20]:
            if not isinstance(item, dict) or not isinstance(item.get('uuid'), str):
                continue
            record_id = item['uuid'].strip()
            if not record_id or record_id in seen:
                continue
            seen.add(record_id)
            record = {'trade_id': record_id[:256]}
            for result_key, vendor_key in (('buyer', 'buyer'), ('seller', 'seller'), ('product_description', 'productDesc')):
                if isinstance(item.get(vendor_key), str):
                    record[result_key] = item[vendor_key][:600]
            if type(item.get('tradeDate')) is int:
                record['trade_date_ms'] = item['tradeDate']
            codes = item.get('productHscodes6')
            if isinstance(codes, list):
                record['hs_codes'] = [code for code in codes[:20] if isinstance(code, str) and code.isascii() and code.isdigit()]
            records.append(record)

        return {**evidence_result(body, records), 'has_more': bool(body['data'].get('cursor'))}
