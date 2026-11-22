"""Budgeted trade discovery and selective enrichment for prospecting runs."""
from app.deepseek import ProviderError
from hashlib import sha256
import unicodedata
import re


def enrich_directory_leads(run, leads, plan):
    """At most two public candidates; ambiguous names are never auto-unlocked."""
    if run.customs is None:
        run.add_warning('customs_provider_unavailable')
        return
    country = plan.buyer_country
    if not country:
        run.add_warning('enhancement_criteria_incomplete')
        return
    def normalize(value):
        return ' '.join(re.sub(r'[^\w]+', ' ', unicodedata.normalize('NFKC', value).casefold()).split())
    for lead in leads[:2]:
        from app.public_contacts import observed_emails
        if observed_emails(lead.get('contact') or ''):
            continue
        key = sha256(lead['name'].encode()).hexdigest()[:20]
        try:
            result = run.call(f'directory-match-{key}', 'upkuajing_directory', run.customs.directory_search,
                {'kind': 'company', 'company_name': lead['name'], 'country': country})
            lead['directory_candidates'] = result
            matches = [record for record in result['records'] if normalize(record['name']) == normalize(lead['name']) and record.get('country') == country]
            if len(matches) != 1:
                lead['enrichment_status'] = 'ambiguous_company' if len(matches) > 1 else 'no_exact_company'
                run.checkpoint()
                continue
            contact_key = sha256(matches[0]['record_id'].encode()).hexdigest()[:24]
            selected = {**matches[0]}
            if lead.get('website'):
                selected['website'] = lead['website']
            contact = run.contact_call(f'directory-contact-{contact_key}', 'upkuajing_directory_contacts',
                                       run.customs.directory_contacts, selected)
            lead['business_contacts'] = contact
            lead['contact_company_match'] = 'exact_name_and_country_requires_review'
            lead['enrichment_status'] = 'contacts_returned' if contact['records'] else 'contacts_empty'
        except ProviderError as error:
            run.add_warning(error.code)
            run.checkpoint()
            break
        run.checkpoint()


def discover_buyers(run, plan, payload):
    if run.customs is None:
        run.add_warning('customs_provider_unavailable')
        return []
    if not plan.buyer_country or not (plan.trade_product or payload.get('hs_code') or plan.hs_code):
        run.add_warning('enhancement_criteria_incomplete')
        return []
    filters = {
        'buyer_country': plan.buyer_country, 'product': plan.trade_product,
        'hs_code': payload.get('hs_code') or plan.hs_code,
        'date_start': payload['trade_date_start'], 'date_end': payload['trade_date_end'],
    }
    run.result['enhancement_filters'] = filters
    try:
        result = run.call('enhanced-discovery', 'upkuajing_buyers', run.customs.search_buyers, filters)
    except ProviderError as error:
        run.add_warning(error.code)
        return []
    run.result['buyer_discovery'] = result
    candidates = result['records'][:20]
    candidate_queries = [f'{item["name"]} {plan.trade_product} procurement suppliers'[:128]
                         for item in candidates[:5]]
    plan.queries = candidate_queries + plan.queries
    run.checkpoint()
    return candidates


def candidate_sources(candidates, discovery):
    return [{
        'url': None, 'title': item['name'], 'provider': 'upkuajing',
        'evidence_status': 'trade_summary', 'company_id': item['company_id'],
        'candidate': item, 'request_id': discovery.get('request_id'),
        'summary': f'采购商候选，贸易概览待逐条核验。{item}',
    } for item in candidates]


def enrich_leads(run, leads):
    trade_calls = contact_calls = 0
    for lead in leads:
        if not lead.get('company_id'):
            continue
        filters = {**run.result['enhancement_filters'], 'company_id': lead['company_id'], 'buyer': lead['name']}
        try:
            if trade_calls < 2:
                trade_calls += 1
                evidence = run.call(f'enhanced-trade-{lead["company_id"]}', 'upkuajing_trade',
                                    run.customs.verify_trades, filters)
                lead['trade_evidence'] = evidence
            from app.public_contacts import observed_emails
            if not observed_emails(lead.get('contact') or '') and contact_calls < 3:
                contact_calls += 1
                selected = {key: lead[key] for key in ('company_id', 'name', 'website') if lead.get(key)}
                contacts = run.contact_call(f'enhanced-contact-{lead["company_id"]}', 'upkuajing_contacts',
                                           run.customs.get_buyer_contacts, selected)
                lead['business_contacts'] = contacts
        except ProviderError as error:
            run.add_warning(error.code)
            run.checkpoint()
            # Preserve public results and stop further paid calls after any provider failure.
            break
        run.checkpoint()
