"""Bounded Hunter contact fallback; credentials are sent only in a header."""
from decimal import Decimal, InvalidOperation
from time import monotonic
from urllib.parse import urlsplit

import httpx

from app.deepseek import ProviderError
from app.provider_logging import record_http, safe_body
from app.public_contacts import observed_emails


def domain_name(value):
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = urlsplit(value if '://' in value else 'https://' + value)
        host = (parsed.hostname or '').lower().removeprefix('www.')
        if parsed.scheme not in ('http', 'https') or parsed.username or parsed.password:
            return None
        return host if '.' in host and not any(c.isspace() for c in host) else None
    except ValueError:
        return None


def has_direct_contact(records):
    for row in records:
        value = row.get('value') or ''
        if row.get('validity') == 2 or '*' in value:
            continue
        if row.get('channel') == 'emails' and observed_emails(value):
            return True
        if row.get('channel') == 'phones' and sum(c.isdigit() for c in value) >= 7:
            return True
    return False


class Hunter:
    def __init__(self, key, transport=None):
        self.key = key
        self.client = httpx.Client(base_url='https://api.hunter.io/v2/',
            timeout=httpx.Timeout(35, connect=5), transport=transport)

    def close(self):
        self.client.close()

    def _get(self, path, params):
        started = monotonic()
        record_http('request', {'provider': 'hunter', 'method': 'GET',
            'url': str(self.client.base_url.join(path)), 'body': safe_body(params, (self.key,))})
        try:
            response = self.client.get(path, params=params, headers={'X-API-KEY': self.key})
        except httpx.RequestError as error:
            record_http('response', {'provider': 'hunter', 'status_code': None,
                'duration_ms': round((monotonic()-started)*1000), 'error': type(error).__name__})
            raise ProviderError('hunter_response_unknown', unknown_charge=True) from None
        try:
            body = response.json()
        except ValueError:
            body = {'non_json': True, 'bytes': len(response.content)}
        record_http('response', {'provider': 'hunter', 'status_code': response.status_code,
            'duration_ms': round((monotonic()-started)*1000), 'body': safe_body(body, (self.key,))})
        if response.is_error:
            codes = {401: 'hunter_invalid_credentials', 403: 'hunter_access_denied',
                     429: 'hunter_quota_exhausted'}
            raise ProviderError(codes.get(response.status_code, 'hunter_request_failed'),
                unknown_charge=response.status_code >= 500)
        if not isinstance(body, dict) or 'data' not in body or body.get('errors'):
            raise ProviderError('hunter_invalid_response', unknown_charge=True)
        return response, body

    def resolve_company(self, selected):
        _, body = self._get('domain-finder', {'company': selected['name'], 'perfect_match': 'true', 'limit': 2})
        data = body.get('data') or []
        if not isinstance(data, list):
            raise ProviderError('hunter_invalid_response')
        rows = [row for row in data if isinstance(row, dict) and domain_name(row.get('domain'))]
        return {'source': 'hunter', 'records': rows, 'reported_milli_cny': None, 'credits_used': 0, 'credits_unit': 'credit'}

    def contacts(self, selected):
        return self._contacts(selected)

    def targeted_contacts(self, selected):
        return self._contacts(selected, selected['hunter_filters'])

    def _contacts(self, selected, filters=None):
        namespace = selected.get('namespace', 'customs_company')
        identifier = str(selected.get('record_id') or selected.get('company_id') or '')
        person = namespace == 'directory_person'
        domain = domain_name(selected.get('website'))
        company = selected.get('company_name') or (None if person else selected.get('name'))
        if not domain and not company:
            raise ProviderError('hunter_identity_missing')
        params = {'domain': domain} if domain else {'company': company}
        path = 'email-finder' if person else 'domain-search'
        if person:
            if not selected.get('name'):
                raise ProviderError('hunter_identity_missing')
            params.update(full_name=selected['name'], max_duration=20)
        else:
            params['limit'] = 10
            if filters:
                params.update(filters)
        response, body = self._get(path, params)
        data = body['data'] or {}
        if not isinstance(data, dict):
            raise ProviderError('hunter_invalid_response', unknown_charge=True)
        returned_domain = domain_name(data.get('domain'))
        if domain and returned_domain and returned_domain != domain:
            raise ProviderError('hunter_domain_mismatch')
        emails = [data] if person else data.get('emails', [])
        if not isinstance(emails, list):
            raise ProviderError('hunter_invalid_response', unknown_charge=True)
        records, seen = [], set()
        for email in emails[:10]:
            if not isinstance(email, dict):
                continue
            value = email.get('email' if person else 'value')
            if not isinstance(value, str) or value.casefold() in seen or value not in observed_emails(value):
                continue
            if domain and domain_name(value.rsplit('@', 1)[-1]) != domain:
                continue
            seen.add(value.casefold())
            verification = email.get('verification') or {}
            verification = verification if isinstance(verification, dict) else {}
            status = verification.get('status')
            sources = email.get('sources')
            sources = sources[:20] if isinstance(sources, list) else []
            source_url = next((s['uri'] for s in sources if isinstance(s, dict)
                and isinstance(s.get('uri'), str) and domain_name(s['uri'])), '')
            records.append({'channel': 'emails', 'value': value, 'namespace': namespace,
                'subject_id': identifier, 'source': 'hunter', 'verification_source': 'hunter',
                'validity': {'valid': 1, 'invalid': 2, 'accept_all': 3, 'unknown': 3}.get(status, 0),
                'verification_status': status, 'verified_at': verification.get('date'),
                'name': ' '.join(str(email.get(k) or '') for k in ('first_name', 'last_name')).strip(),
                'position': email.get('position'), 'confidence': email.get('confidence', email.get('score')),
                'department': email.get('department'), 'seniority': email.get('seniority'),
                'decision_maker': email.get('decision_maker'),
                'provenance': email.get('provenance'), 'sources': sources, 'source_url': source_url,
                'company_match': 'domain_match_requires_review' if domain else 'provider_name_match_requires_review'})
        try:
            credits = Decimal(response.headers.get('X-Credits-Used', ''))
            credits = float(credits) if credits.is_finite() and credits >= 0 else None
        except InvalidOperation:
            credits = None
        return {'source': 'hunter', 'records': records, 'reported_milli_cny': None,
            'credits_used': credits, 'credits_unit': response.headers.get('X-Credits-Unit'),
            'domain': data.get('domain'), 'organization': data.get('organization', data.get('company')),
            'identity_status': 'requires_review',
            'scope': 'provider_reported_contact_values_and_validity_not_independent_verification'}
