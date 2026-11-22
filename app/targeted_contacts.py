"""User-selected roles, bounded Hunter searches, and explicit match evidence."""
from copy import deepcopy
from hashlib import sha256
import re
from typing import Literal

from fastapi import HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app import workspaces as ws
from app.db import write_transaction
from app.deepseek import ProviderError
from app.hunter import domain_name


ContactTarget = Literal['procurement', 'leadership', 'sales', 'engineering']
TARGETS = {
    'procurement': ('procurement', 'Purchasing,Procurement,Sourcing,Supply Chain', r'procure|purchas|sourc|supply chain|buyer'),
    'leadership': ('executive', 'CEO,President,Founder,Owner,Managing Director', r'chief executive|ceo|president|founder|owner|managing director'),
    'sales': ('sales', 'Sales,Business Development', r'sales|business development'),
    'engineering': ('research,product', 'Engineer,Engineering,Technical Director', r'engineer|technical|research|product'),
}


class TargetCriteria(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    contact_target: ContactTarget = 'procurement'
    contact_titles: list[str] = Field(default_factory=list, max_length=6)

    @model_validator(mode='after')
    def titles_valid(self):
        if any(not value or len(value) > 80 or ',' in value for value in self.contact_titles):
            raise ValueError('Each title must contain 1 to 80 characters without commas')
        return self


class TargetedContactRequest(TargetCriteria):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, json_schema_extra={'examples': [{
        'company_name': 'Buyer Ltd', 'website': 'https://buyer.example', 'contact_target': 'procurement',
        'confirm_company_match': True, 'confirm_paid': True}]})
    prospect_id: str | None = Field(default=None, pattern=r'^[0-9a-f]{32}$')
    company_name: str | None = Field(default=None, min_length=1, max_length=240)
    website: str | None = Field(default=None, max_length=500)
    confirm_company_match: Literal[True]
    confirm_paid: Literal[True]

    @model_validator(mode='after')
    def identity(self):
        if self.prospect_id:
            if self.company_name or self.website:
                raise ValueError('Use a saved prospect or an explicit company and website')
        elif not self.company_name or not self.website or not domain_name(self.website):
            raise ValueError('A company name and confirmed website are required')
        return self


def budget(settings):
    return 2 * settings.hunter_contact_estimate_milli_cny


def enqueue_targeted(body: TargetedContactRequest, request: Request, workspace, sessions, key):
    if not key:
        raise HTTPException(422, 'idempotency_key_required')
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        if body.prospect_id:
            from app.crm import get_prospect
            prospect = get_prospect(session, workspace, body.prospect_id)
            name, website = prospect.name, prospect.website
            if not website:
                website = (prospect.evidence or {}).get('directory_record', {}).get('website')
        else:
            name, website = body.company_name, body.website
        domain = domain_name(website)
        if not domain:
            raise HTTPException(422, 'targeted_contacts_website_required')
        selected = {'namespace': 'hunter_company', 'record_id': sha256(domain.encode()).hexdigest()[:24],
                    'name': name, 'website': 'https://' + domain}
        payload = {**selected, 'contact_target': body.contact_target, 'contact_titles': body.contact_titles,
                   'prospect_id': body.prospect_id, 'paid_budget_milli_cny': budget(request.app.state.settings)}
        fingerprint = ws.request_fingerprint('targeted_contacts', payload)
        replay = ws.replay_job(session, workspace, key, fingerprint)
        if replay:
            return ws.job_view(replay)
        if not request.app.state.settings.hunter_api_key or request.app.state.settings.hunter_daily_call_limit <= 0:
            raise HTTPException(503, 'hunter_not_configured')
        # Reuse the existing 24-hour, workspace-scoped directory job cache.
        from app.directory import enqueue
        return enqueue(session, workspace, request, 'targeted_contacts', payload, key)


def search(run, step, selected, target='procurement', titles=None):
    if run.hunter is None:
        raise ProviderError('hunter_not_configured')
    domain = domain_name(selected.get('website'))
    if not domain:
        raise ProviderError('targeted_contacts_website_required')
    department, default_titles, pattern = TARGETS[target]
    titles = titles or []
    filters = ([{'job_titles': ','.join(titles)}] if titles else
               [{'department': department}, {'job_titles': default_titles}])
    records, queries, seen = [], [], set()
    for index, query in enumerate(filters):
        anchor = {**selected, 'website': 'https://' + domain,
                  'hunter_filters': {'type': 'personal', 'required_field': 'full_name,position', **query}}
        try:
            result = run.call(f'{step}-{index}', 'hunter_contacts', run.hunter.targeted_contacts, anchor)
        except ProviderError as error:
            if not queries:
                raise
            run.add_warning(error.code)
            queries.append({'error': error.code})
            break
        queries.append({k: result.get(k) for k in ('credits_used', 'credits_unit', 'domain', 'identity_status')})
        for row in result['records']:
            row = deepcopy(row)
            position = row.get('position') if isinstance(row.get('position'), str) else ''
            match = (any(t.casefold() in position.casefold() for t in titles) if titles else
                     row.get('department') in department.split(',') or bool(re.search(pattern, position, re.I)))
            row.update(target_role=target, role_match='keyword_or_department_match' if match else 'needs_review',
                       role_match_basis={'position': position, 'department': row.get('department')})
            if row['value'].casefold() not in seen:
                records.append(row)
                seen.add(row['value'].casefold())
            elif match:
                for old in records:
                    if old['value'].casefold() == row['value'].casefold():
                        old.update(row)
        if any(r['role_match'] == 'keyword_or_department_match' and r.get('validity') != 2 for r in records):
            break
    records.sort(key=lambda r: (r['role_match'] != 'keyword_or_department_match', r.get('validity') != 1))
    return {'source': 'hunter', 'kind': 'contacts', 'subject': selected, 'records': records,
            'matched_contact_count': sum(r['role_match'] == 'keyword_or_department_match' and r.get('validity') != 2 for r in records),
            'search_target': target, 'search_titles': titles, 'queries': queries,
            'credits_used': None if any(q.get('credits_used') is None for q in queries) else sum(q['credits_used'] for q in queries),
            'known_credits_used': sum(q.get('credits_used') or 0 for q in queries),
            'has_unconfirmed_credits': any(q.get('credits_used') is None for q in queries),
            'reported_milli_cny': None, 'identity_status': 'user_confirmed_domain_requires_person_review',
            'scope': 'role_candidates_not_verified_buying_authority'}


def enrich(run, leads, payload):
    """At most two enterprises, regardless of existing generic emails or phones."""
    for index, lead in enumerate(leads[:2]):
        selected = {'namespace': 'hunter_company', 'record_id': sha256(lead['name'].encode()).hexdigest()[:24],
                    'name': lead['name'], 'website': lead.get('website')}
        if not domain_name(selected['website']):
            for row in (lead.get('business_contacts') or {}).get('records', []):
                if row.get('channel') == 'websites' and row.get('validity') != 2 and domain_name(row.get('value')):
                    selected['website'] = row['value']
                    break
        try:
            if not domain_name(selected['website']):
                if run.hunter is None:
                    raise ProviderError('hunter_not_configured')
                resolved = run.call(f'targeted-domain-{index}', 'hunter_domain', run.hunter.resolve_company, selected)
                candidates = resolved['records']
                if len(candidates) == 1:
                    def normalize(value):
                        return re.sub(r'\b(?:incorporated|inc|llc|ltd|limited|corp|corporation)\b|[^a-z0-9]', '', value.casefold())
                    if normalize(candidates[0].get('company_name') or '') == normalize(lead['name']):
                        selected['website'] = 'https://' + domain_name(candidates[0]['domain'])
                        lead['website'] = selected['website']
                        lead['website_status'] = 'hunter_exact_name_requires_review'
            result = search(run, f'targeted-{index}', selected, payload.get('contact_target', 'procurement'),
                            payload.get('contact_titles'))
        except ProviderError as error:
            run.add_warning(error.code)
            lead['targeted_contact_status'] = error.code
            run.checkpoint()
            if error.code != 'targeted_contacts_website_required':
                break
            continue
        lead['targeted_contacts'] = result
        business = lead.setdefault('business_contacts', {'source': 'hunter', 'records': []})
        seen = {(r.get('channel'), str(r.get('value', '')).casefold()) for r in business['records']}
        business['records'].extend(r for r in result['records'] if (r['channel'], r['value'].casefold()) not in seen)
        business['source'] = 'upkuajing+hunter' if business.get('source') == 'upkuajing' else business.get('source', 'hunter')
        lead['targeted_contact_status'] = 'matches' if any(r['role_match'] == 'keyword_or_department_match'
            and r.get('validity') != 2 for r in result['records']) else 'no_target_matches'
        run.checkpoint()
