"""Optional official procurement candidates, distinct from verified current demand."""
import json

from app.deepseek import ProviderError
from app.public_sources import PublicSources, TED_COUNTRIES


def discover_official_sources(run, plan, payload):
    if 'ted' not in payload.get('public_sources', []):
        return []
    if not plan.buyer_country or plan.buyer_country not in TED_COUNTRIES:
        run.add_warning('official_source_country_unresolved')
        return []
    provider = run.public_sources or PublicSources(run.settings)
    filters = {'source_id':'ted','query':(plan.trade_product or plan.product)[:120],
               'country':plan.buyer_country,'limit':5,'since_days':90}
    try:
        response = run.call('official-ted-discovery','open_ted',provider.search,filters)
    except ProviderError as error:
        run.add_warning(error.code)
        return []
    finally:
        if run.public_sources is None:
            provider.close()
    run.result['official_discovery'] = response
    for warning in response.get('warnings', []):
        run.add_warning(warning)
    return [{'url':record['source_url'], 'title':record['title'], 'provider':'ted',
        'evidence_status':'structured_notice', 'official_record':record,
        'content':json.dumps({'title':record['title'],'entity_name':record['entity_name'],
                             'details':record['details']},ensure_ascii=False),
        'page_retrieved_at':response['retrieved_at'], 'summary':record['summary']}
        for record in response['records'] if record.get('entity_name')]
