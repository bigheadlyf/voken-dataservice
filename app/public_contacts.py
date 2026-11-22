"""Literal public email extraction, without guessing addresses or testing inboxes."""
import re
from urllib.parse import urlsplit

EMAIL = re.compile(r'(?<![\w.+-])[A-Za-z0-9.!#$%&\'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,24}')


def is_email_pattern(value):
    """Address-format examples in enrichment directories are not contacts."""
    return value.partition('@')[0].casefold() in {
        'flast', 'f.last', 'first.last', 'firstlast', 'first_last',
        'firstname.lastname', 'firstname', 'lastname', 'firstl', 'yourname',
    }


def observed_emails(content):
    if not isinstance(content, str):
        return []
    values = []
    seen = set()
    for match in EMAIL.finditer(content[:100000]):
        value = match.group().strip('.')
        # Directories often publish redacted addresses such as n**@company.com.
        # These are observed text but cannot be offered as usable contact addresses.
        if len(value) <= 254 and '*' not in value and not is_email_pattern(value) and value.casefold() not in seen:
            values.append(value)
            seen.add(value.casefold())
        if len(values) == 10:
            break
    return values


def candidates(sources):
    result, seen = [], set()
    for source in sources:
        if source.get('evidence_status') in {'summary_only', 'link_only', 'fetch_failed'}:
            continue
        parsed = urlsplit(source.get('url') or '')
        # Search results may include court documents and job pages mentioning the
        # target company. Their clerks/recruiters are not sales contact candidates.
        host = (parsed.hostname or '').lower()
        path = parsed.path.casefold()
        if host == 'courtlistener.com' or host.endswith('.courtlistener.com'):
            continue
        if re.search(r'/(?:careers?|jobs?|recruitment)(?:/|\.|$)', path):
            continue
        for value in source.get('observed_emails', []):
            if '*' in value or is_email_pattern(value):
                continue
            local = value.partition('@')[0].casefold()
            if local in {'employment', 'careers', 'career', 'jobs', 'recruiting', 'recruitment',
                         'hr', 'privacy', 'abuse', 'noreply', 'no-reply', 'postmaster', 'webmaster'}:
                continue
            if value.casefold() in seen:
                continue
            seen.add(value.casefold())
            role = ('general_business' if local in {'sales', 'info', 'contact', 'hello', 'office', 'ventas'}
                    else 'procurement_role_unverified' if local in {'purchasing', 'procurement', 'sourcing', 'buyer'}
                    else 'quality_support' if local in {'quality', 'qa', 'support', 'service'}
                    else 'unknown')
            result.append({'value': value, 'source_url': source.get('url'), 'source_id': source['source_id'],
                'observed_at': source.get('page_retrieved_at') or source.get('search_retrieved_at'),
                'verification_status': 'public_page_unverified', 'company_match': 'requires_review',
                'contact_role': role, 'deliverability': 'not_checked'})
    return result
