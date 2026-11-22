"""Small, bounded official API lookups. Requests never target a user-provided URL."""
from datetime import date, datetime, timedelta
import json
import re

import httpx

from app.db import utcnow
from app.deepseek import ProviderError
from app.ocds_sources import OCDSSources, UK_OCDS

TED_COUNTRIES = dict(zip(
    'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE GB NO CH IS US CA AU'.split(),
    'AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE GBR NOR CHE ISL USA CAN AUS'.split()))


def strings(value):
    if isinstance(value, str):
        return [value[:2000]]
    if isinstance(value, list):
        return [text for item in value[:30] for text in strings(item)]
    if isinstance(value, dict):
        if 'eng' in value:
            return strings(value['eng'])
        if 'en' in value:
            return strings(value['en'])
        return strings(next(iter(value.values()), []))
    return []


def text(value):
    return '; '.join(dict.fromkeys(strings(value)))[:2000]


class PublicSources(OCDSSources):
    def __init__(self, settings, transport=None):
        self.settings = settings
        self.client = httpx.Client(timeout=httpx.Timeout(25, connect=5), transport=transport,
            headers={'Accept': 'application/json', 'User-Agent': 'VokenDataService/1.0 (public-data-lookup)'},
            follow_redirects=False)

    def close(self):
        self.client.close()

    def request(self, method, url, **kwargs):
        try:
            response = self.client.request(method, url, **kwargs)
            response.raise_for_status()
            body = response.json()
        except httpx.HTTPStatusError as error:
            code = {400:'open_source_invalid_query', 401:'open_source_invalid_credentials',
                403:'open_source_access_denied', 429:'open_source_rate_limited'}.get(error.response.status_code,
                'open_source_request_failed')
            raise ProviderError(code) from None
        except httpx.RequestError:
            raise ProviderError('open_source_connection_unavailable') from None
        except ValueError:
            raise ProviderError('open_source_invalid_response') from None
        if not isinstance(body, dict):
            raise ProviderError('open_source_invalid_response')
        return body

    def search(self, payload):
        source = payload['source_id']
        if source in UK_OCDS:
            return self.uk_ocds(payload)
        if source == 'gleif':
            return self.gleif(payload)
        if source == 'ted':
            return self.ted(payload)
        if source == 'companies_house':
            return self.companies_house(payload)
        if source == 'worldbank_notices':
            return self.worldbank_notices(payload)
        raise ProviderError('open_source_not_supported')

    def worldbank_notices(self, payload):
        """One recent page; never turn project names or awardees into buyers."""
        today = utcnow().date()
        since = today - timedelta(days=payload.get('since_days', 90))
        body = self.request('GET', 'https://search.worldbank.org/api/v2/procnotices', params={
            'format':'json', 'rows':payload['limit'], 'os':0, 'qterm':payload['query'],
            'srt':'noticedate', 'order':'desc', 'notice_type_exact':'Invitation for Bids',
            'submission_strdate':since.isoformat(), 'submission_enddate':today.isoformat()})
        if not isinstance(body.get('procnotices'), list):
            raise ProviderError('open_source_invalid_response')
        records, warnings = [], []
        for row in body['procnotices'][:payload['limit']]:
            if not isinstance(row, dict):
                continue
            identifier = row.get('id')
            if not isinstance(identifier, str) or not re.fullmatch(r'OP\d{6,12}', identifier):
                continue
            if row.get('notice_type') != 'Invitation for Bids' or row.get('notice_status') != 'Published':
                warnings.append('notice_not_published_invitation_for_bids')
                continue
            # submission_date is publication/submission of the notice, not the tender deadline.
            try:
                published = datetime.strptime(row.get('noticedate', ''), '%d-%b-%Y').date()
            except (ValueError, TypeError):
                warnings.append('notice_publication_date_unverified')
                continue
            if not since <= published <= today:
                warnings.append('notice_outside_requested_date_range')
                continue
            deadline = row.get('submission_deadline_date')
            try:
                deadline_date = date.fromisoformat(deadline[:10]) if isinstance(deadline, str) else None
            except ValueError:
                deadline_date = None
            status = ('expired' if deadline_date and deadline_date < today else
                      'requires_deadline_and_eligibility_review')
            if status == 'expired':
                warnings.append('notice_deadline_expired')
            organization = row.get('contact_organization')
            name = organization[:240] if isinstance(organization, str) and organization.strip() else None
            email = row.get('contact_email')
            email = email if isinstance(email, str) and re.fullmatch(r'[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+', email) else None
            records.append({'id':identifier, 'entity_name':name,
                'title':text(row.get('bid_description')) or identifier, 'country':None,
                'evidence_type':'procurement_notice',
                'source_url':'https://projects.worldbank.org/en/projects-operations/procurement-detail/'+identifier,
                'summary':text(row.get('project_name')),
                'details':{'project_id':text(row.get('project_id')), 'project_country':text(row.get('project_ctry_name')),
                    'published_at':published.isoformat(), 'deadline_dates':[deadline_date.isoformat()] if deadline_date else [],
                    'deadline_time':text(row.get('submission_deadline_time')), 'notice_type':'Invitation for Bids',
                    'notice_status':'Published', 'bid_reference':text(row.get('bid_reference_no')),
                    'procurement_method':text(row.get('procurement_method_name')),
                    'contact_organization':name, 'published_procurement_email':email,
                    'attribution':'World Bank — World Bank Procurement Notices, CC BY 4.0'},
                'procurement_status':status})
        total = body.get('total')
        total = int(total) if isinstance(total, (str, int)) and str(total).isdigit() else None
        return self.result('worldbank_notices', records, total, total is not None and total > payload['limit'],
                           list(dict.fromkeys(warnings)))

    def result(self, source, records, total, more, warnings=None):
        return {'source_id': source, 'records': records, 'total_reported': total, 'has_more': more,
            'retrieved_at': utcnow().isoformat()+'Z', 'warnings': warnings or [], 'data_fee_milli_cny': 0,
            'evidence_scope': 'public_records_not_verified_purchase_intent'}

    def gleif(self, payload):
        params = {'filter[entity.legalName]': payload['query'], 'page[size]': payload['limit'], 'page[number]': 1}
        if payload.get('country'):
            params['filter[entity.legalAddress.country]'] = payload['country']
        if payload.get('entity_category', 'GENERAL') != 'ALL':
            params['filter[entity.category]'] = payload.get('entity_category', 'GENERAL')
        body = self.request('GET', 'https://api.gleif.org/api/v1/lei-records', params=params)
        if not isinstance(body.get('data'), list):
            raise ProviderError('open_source_invalid_response')
        records = []
        for row in body['data'][:payload['limit']]:
            if not isinstance(row, dict):
                continue
            attributes = row.get('attributes') if isinstance(row.get('attributes'), dict) else {}
            lei = attributes.get('lei') or row.get('id')
            entity = attributes.get('entity') if isinstance(attributes.get('entity'), dict) else {}
            legal_name = entity.get('legalName') if isinstance(entity.get('legalName'), dict) else {}
            name = legal_name.get('name')
            if not isinstance(lei, str) or not re.fullmatch('[A-Z0-9]{20}', lei) or not isinstance(name, str):
                continue
            address = entity.get('legalAddress') if isinstance(entity.get('legalAddress'), dict) else {}
            registration = attributes.get('registration') if isinstance(attributes.get('registration'), dict) else {}
            records.append({'id': lei, 'entity_name': name[:240], 'title': name[:240], 'country': address.get('country'),
                'evidence_type': 'entity_registration', 'source_url': 'https://api.gleif.org/api/v1/lei-records/'+lei,
                'summary': f'实体状态：{entity.get("status", "unknown")}；LEI 登记状态：{registration.get("status", "unknown")}',
                'details': {'lei':lei, 'entity_status':entity.get('status'), 'registration_status':registration.get('status'),
                    'address': address, 'registered_as':entity.get('registeredAs'), 'entity_category':entity.get('category'),
                    'last_updated_at':registration.get('lastUpdateDate')}, 'procurement_status':'not_applicable'})
        pagination = (body.get('meta') or {}).get('pagination') or {}
        total = pagination.get('total')
        return self.result('gleif', records, total if type(total) is int else None,
                           type(total) is int and total > payload['limit'])

    def companies_house(self, payload):
        if not self.settings.companies_house_api_key:
            raise ProviderError('open_source_not_configured')
        body = self.request('GET', 'https://api.company-information.service.gov.uk/search/companies',
            params={'q':payload['query'], 'items_per_page':payload['limit'], 'start_index':0},
            auth=(self.settings.companies_house_api_key, ''))
        if not isinstance(body.get('items'), list):
            raise ProviderError('open_source_invalid_response')
        records = []
        for row in body['items'][:payload['limit']]:
            if not isinstance(row, dict):
                continue
            number, name = row.get('company_number'), row.get('title')
            if not isinstance(number, str) or not re.fullmatch('[A-Za-z0-9]{1,16}', number) or not isinstance(name, str):
                continue
            records.append({'id':number, 'entity_name':name[:240], 'title':name[:240], 'country':'GB',
                'source_url':'https://find-and-update.company-information.service.gov.uk/company/'+number,
                'evidence_type':'entity_registration', 'summary':f'企业登记状态：{row.get("company_status", "unknown")}',
                'details':{'company_number':number,'company_status':row.get('company_status'),
                    'date_of_creation':row.get('date_of_creation'), 'registered_address':row.get('address', {})},
                'procurement_status':'not_applicable'})
        total = body.get('total_results')
        return self.result('companies_house', records, total if type(total) is int else None,
                           type(total) is int and total > payload['limit'])

    def ted(self, payload):
        since = (utcnow()-timedelta(days=payload['since_days'])).date()
        query = f'FT ~ {json.dumps(payload["query"], ensure_ascii=False)} AND notice-type = cn-standard AND publication-date >= {since:%Y%m%d}'
        country = payload.get('country')
        if country:
            if country not in TED_COUNTRIES:
                raise ProviderError('open_source_country_not_supported')
            query += f' AND buyer-country = {TED_COUNTRIES[country]}'
        query += ' SORT BY publication-date DESC'
        body = self.request('POST', 'https://api.ted.europa.eu/v3/notices/search', json={
            'query':query, 'fields':['publication-number','notice-title','buyer-name','publication-date',
                'deadline-receipt-tender-date-lot','notice-type','buyer-country'],
            'page':1,'limit':payload['limit'],'scope':'ACTIVE','paginationMode':'PAGE_NUMBER','onlyLatestVersions':True})
        if not isinstance(body.get('notices'), list):
            raise ProviderError('open_source_invalid_response')
        records, warnings = [], []
        if body.get('timedOut'):
            warnings.append('open_source_partial_timeout')
        for row in body['notices'][:payload['limit']]:
            if not isinstance(row, dict):
                continue
            number = text(row.get('publication-number'))
            published = text(row.get('publication-date'))
            if not re.fullmatch(r'[0-9]{1,8}-[0-9]{4}', number):
                continue
            # Do not trust scope alone: reject old notices even if the API returns them.
            try:
                published_date = date.fromisoformat(published[:10])
            except ValueError:
                warnings.append('notice_publication_date_unavailable')
                continue
            if published_date < since:
                warnings.append('notice_outside_requested_date_range')
                continue
            buyers = list(dict.fromkeys(strings(row.get('buyer-name'))))
            title = text(row.get('notice-title'))
            records.append({'id':number, 'entity_name':buyers[0][:240] if len(buyers)==1 else None,
                'title':title or 'Procurement notice '+number, 'country':text(row.get('buyer-country')),
                'source_url':f'https://ted.europa.eu/en/notice/{number}/html', 'evidence_type':'procurement_notice',
                'summary':title[:1000], 'details':{'buyer_names':buyers,'published_at':published,
                    'notice_type':text(row.get('notice-type')),
                    'deadline_dates':strings(row.get('deadline-receipt-tender-date-lot'))},
                'procurement_status':'requires_deadline_and_eligibility_review'})
        total = body.get('totalNoticeCount')
        return self.result('ted', records, total if type(total) is int else None,
                           type(total) is int and total > payload['limit'], list(dict.fromkeys(warnings)))
