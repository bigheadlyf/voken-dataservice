"""One bounded official UK procurement page; keyword matching happens locally."""
from datetime import datetime, timedelta, timezone
import re

from app.db import utcnow
from app.deepseek import ProviderError


UK_OCDS = {
    'find_tender': ('https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages', 'updated'),
    'contracts_finder': ('https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search', 'published'),
}


class OCDSSources:
    def uk_ocds(self, payload):
        source = payload['source_id']
        endpoint, date_field = UK_OCDS[source]
        now = utcnow()
        since = now - timedelta(days=payload.get('since_days', 90))
        params = {date_field+'From': since.strftime('%Y-%m-%dT%H:%M:%S'),
                  date_field+'To': now.strftime('%Y-%m-%dT%H:%M:%S'), 'limit': 100}
        stage = payload.get('procurement_stage', 'tender')
        if stage != 'all':
            params['stages'] = stage
        body = self.request('GET', endpoint, params=params)
        releases = body.get('releases')
        if not isinstance(releases, list):
            raise ProviderError('open_source_invalid_response')
        records, seen = [], set()
        terms = payload['query'].casefold().split()
        matched = 0
        for release in releases[:100]:
            if not isinstance(release, dict):
                continue
            identifier, ocid = release.get('id'), release.get('ocid')
            if not isinstance(identifier, str) or not isinstance(ocid, str):
                continue
            if not re.fullmatch(r'[A-Za-z0-9_-]{1,180}', identifier) or not re.fullmatch(r'[A-Za-z0-9_-]{1,180}', ocid):
                continue
            if (ocid, identifier) in seen:
                continue
            seen.add((ocid, identifier))
            tender = release.get('tender') if isinstance(release.get('tender'), dict) else {}
            tags = release.get('tag') if isinstance(release.get('tag'), list) else []
            awarded = any(tag in ('award', 'awardUpdate', 'contract', 'contractUpdate', 'implementation') for tag in tags)
            if stage == 'tender' and (awarded or not any(tag in ('tender', 'tenderUpdate', 'tenderAmendment') for tag in tags)):
                continue
            if stage == 'award' and not awarded:
                continue
            title = tender.get('title') if isinstance(tender.get('title'), str) else ''
            description = tender.get('description') if isinstance(tender.get('description'), str) else ''
            haystack = (title+' '+description).casefold()
            if not terms or not all(term in haystack for term in terms):
                continue
            matched += 1
            if len(records) >= payload['limit']:
                continue
            buyer = release.get('buyer') if isinstance(release.get('buyer'), dict) else {}
            parties = release.get('parties') if isinstance(release.get('parties'), list) else []
            buyer_parties = [party for party in parties if isinstance(party, dict) and
                            'buyer' in (party.get('roles') or []) and
                            (not buyer.get('id') or party.get('id') == buyer.get('id'))]
            # Never adopt a supplier, tenderer or procurement agent's email as the buyer's.
            party = buyer_parties[0] if len(buyer_parties) == 1 else {}
            name = (party.get('name') or buyer.get('name')) if len(buyer_parties) <= 1 else None
            name = name[:240] if isinstance(name, str) and name.strip() else None
            contact = party.get('contactPoint') if isinstance(party.get('contactPoint'), dict) else {}
            email = contact.get('email')
            email = email if isinstance(email, str) and re.fullmatch(r'[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+', email) else None
            period = tender.get('tenderPeriod') if isinstance(tender.get('tenderPeriod'), dict) else {}
            deadline = period.get('endDate')
            try:
                deadline_at = datetime.fromisoformat(deadline.replace('Z', '+00:00')) if isinstance(deadline, str) else None
            except ValueError:
                deadline_at = None
            expired = bool(deadline_at and deadline_at.tzinfo and deadline_at < now.replace(tzinfo=timezone.utc))
            status = ('historical_award' if awarded else 'closed_or_cancelled' if tender.get('status') in
                      ('complete', 'cancelled', 'unsuccessful', 'withdrawn') else 'expired' if expired else
                      'requires_deadline_and_eligibility_review')
            url = ('https://www.find-tender.service.gov.uk/Notice/'+identifier if source == 'find_tender' else
                   'https://www.contractsfinder.service.gov.uk/Published/Notice/releases/'+identifier+'.json')
            value = tender.get('value') if isinstance(tender.get('value'), dict) else {}
            address = party.get('address') if isinstance(party.get('address'), dict) else {}
            country = address.get('country')
            country = country.upper() if isinstance(country, str) and re.fullmatch('[A-Za-z]{2}', country) else None
            if not country and address.get('countryName') == 'United Kingdom':
                country = 'GB'
            records.append({'id': identifier, 'entity_name': name, 'title': title[:500] or identifier,
                'country': country, 'evidence_type': 'procurement_notice', 'source_url': url,
                'summary': re.sub(r'<[^>]+>', ' ', description)[:2000], 'procurement_status': status,
                'details': {'ocid': ocid, 'release_id': identifier, 'published_at': release.get('date'),
                    'release_tags': tags, 'tender_status': tender.get('status'), 'buyer_id': buyer.get('id'), 'publication_country': 'GB',
                    'address': address, 'published_procurement_email': email,
                    'deadline_dates': [deadline_at.date().isoformat()] if deadline_at else [],
                    'deadline_at': deadline, 'value': {k: value[k] for k in ('amount', 'currency') if k in value},
                    'attribution': 'Contains public sector information licensed under the Open Government Licence v3.0.',
                    'license_url': 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'}})
        more = bool(isinstance(body.get('links'), dict) and body['links'].get('next'))
        result = self.result(source, records, None, more or matched > len(records), ['bounded_page_local_keyword_filter'])
        result.update(scanned_count=min(len(releases), 100), scan_limit=100, matched_in_page=matched,
            search_scope='one_upstream_page_not_global_keyword_search',
            date_filter={'field': date_field, 'from': params[date_field+'From'], 'to': params[date_field+'To']})
        return result
