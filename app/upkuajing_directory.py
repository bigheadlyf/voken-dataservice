"""Unified directory IDs (pid/hid) are independent from customs company IDs."""
from app.deepseek import ProviderError
from app.public_contacts import is_email_pattern


def text(value, limit=500):
    return value.strip()[:limit] if isinstance(value, str) else ''


def strings(value, limit=30):
    return [text(item) for item in value[:limit] if isinstance(item, str) and item.strip()] if isinstance(value, list) else []


def rows(body):
    data = body.get('data')
    result = data.get('list', []) if isinstance(data, dict) else data
    if not isinstance(result, list):
        raise ProviderError('upkuajing_invalid_response', unknown_charge=True)
    return result


def contacts(data, namespace, subject_id):
    result, seen = [], set()
    for channel in ('emails', 'phones', 'websites', 'socials'):
        for item in (data.get(channel) or [])[:20]:
            if not isinstance(item, dict):
                continue
            value = text(item.get('val'), 300)
            if not value or '*' in value or (channel == 'emails' and is_email_pattern(value)):
                continue
            key = (channel, value.casefold())
            if key in seen:
                continue
            seen.add(key)
            row = {'channel': channel, 'value': value, 'namespace': namespace, 'subject_id': subject_id,
                   'verification_source': 'upkuajing', 'validity': item.get('is_valid') if type(item.get('is_valid')) is int and item['is_valid'] in (0, 1, 2, 3) else 0}
            for field in ('reason', 'social_type', 'international_number', 'country_code'):
                if isinstance(item.get(field), str):
                    row[field] = text(item[field])
            for field in ('is_ws', 'phone_type'):
                if type(item.get(field)) is int and item[field] in (0, 1, 2, 3):
                    row[field] = item[field]
            result.append(row)
    return result


class DirectoryMethods:
    def directory_search(self, filters):
        kind = filters['kind']
        params = {'sort': 0, 'isExact': True}
        if filters.get('company_name'):
            params['companyNames'] = [filters['company_name']]
        if filters.get('website'):
            params['companyUrls'] = [filters['website']]
        if filters.get('product'):
            params['products' if kind == 'company' else 'keywords'] = [filters['product']]
        if filters.get('country'):
            params['countryCodes'] = [filters['country']]
        if filters.get('company_pid'):
            params['pids'] = [filters['company_pid']]
        if kind == 'people' and filters.get('titles'):
            params['titleNames'] = filters['titles']
        if filters.get('require_email'):
            params['existEmail'] = 1
        if filters.get('cursor'):
            params['cursor'] = filters['cursor']
        body = self._post('/agent/search/company/list' if kind == 'company' else '/agent/search/person/list', params)
        from app.upkuajing import evidence_result
        result, seen = [], set()
        for row in rows(body)[:20]:
            if not isinstance(row, dict):
                continue
            identifier = text(row.get('pid' if kind == 'company' else 'hid'), 160)
            name = text(row.get('company_name' if kind == 'company' else 'human_name'), 240)
            if not identifier or not name or identifier in seen:
                continue
            seen.add(identifier)
            # A person's country is distinct from their employer's country.
            country = text(row.get('country_code'), 20).upper()
            if len(country) != 2 or not country.isascii() or not country.isalpha():
                country = None
            entry = {'namespace': 'directory_company' if kind == 'company' else 'directory_person',
                     'record_id': identifier, 'name': name, 'country': country,
                     'company_pid': text(row.get('pid'), 160), 'company_name': text(row.get('company_name'), 240),
                     'titles': strings(row.get('title_names')), 'industries': strings(row.get('industries') or row.get('company_industries')),
                     'products': strings(row.get('products')), 'employee_range': text(row.get('employee'), 50),
                     'addresses': [text(x.get('address')) for x in (row.get('addresses') or [])[:8] if isinstance(x, dict)],
                     'contact_inventory': {key: row[key] for key in ('email_num', 'phone_num', 'website_num', 'social_num', 'ws_num') if type(row.get(key)) is int and row[key] >= 0},
                     'source_name': text(row.get('source_name')), 'identity_status': 'requires_review'}
            if filters.get('website'):
                entry['website'] = filters['website']
            elif kind == 'people' and (filters.get('selected_company') or {}).get('website'):
                entry['website'] = filters['selected_company']['website']
            if kind == 'people':
                entry['human_type'] = row.get('human_type') if type(row.get('human_type')) is int else 0
            entry['title_match'] = (any(term.casefold() in ' '.join(entry['titles']).casefold() for term in filters.get('titles', []))
                                    if kind == 'people' and filters.get('titles') else None)
            result.append(entry)
        cursor = text((body.get('data') or {}).get('cursor'), 12000) or None
        return {**evidence_result(body, result), 'kind': kind, 'next_cursor': cursor, 'has_more': bool(cursor),
                'scope': 'provider_directory_records_not_verified_procurement_intent'}

    def directory_contacts(self, selected):
        namespace, identifier = selected['namespace'], selected['record_id']
        body = self._post('/agent/search/contact/batch', {
            'bus_type': 1 if namespace == 'directory_company' else 2, 'bus_ids': [identifier]})
        result = []
        for row in rows(body):
            if not isinstance(row, dict) or str(row.get('bus_id')) != identifier:
                continue
            if row.get('bus_type') != (1 if namespace == 'directory_company' else 2):
                continue
            data = row.get('contact_data')
            if isinstance(data, dict):
                result.extend(contacts(data, namespace, identifier))
        from app.upkuajing import evidence_result
        return {**evidence_result(body, result), 'kind': 'contacts', 'subject': selected,
                'scope': 'provider_reported_contact_values_and_validity_not_independent_verification'}
