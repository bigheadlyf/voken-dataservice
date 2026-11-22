"""Bounded, opt-in live comparison; raw responses stay in the private .local folder."""
import argparse
import importlib.util
import json
from pathlib import Path
import sys
from time import monotonic

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true', help='Authorize up to six potentially billable requests')
    args = parser.parse_args()
    if not args.live:
        parser.error('--live is required; this makes real contact requests')
    spec = importlib.util.spec_from_file_location('live_environment', ROOT/'scripts/run-live-dev.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.load_environment()
    from app.config import Settings
    from app.upkuajing import Upkuajing, quota_usage
    settings = Settings.from_env()
    folder = ROOT/'.local/upkuajing-unified-docs'
    output = ROOT/'.local/contact-endpoint-comparison-20261121'
    output.mkdir(exist_ok=True)
    people = json.loads((folder/'benchmark-marmetal-people.response.json').read_text(encoding='utf-8'))['response']['data']['list']
    subjects = [('Marmetal Industries LLC', 1, 'us5d6bc45e86fb966ab3a4bcc7342e1da0')]
    subjects += [(p['human_name'], 2, p['hid']) for p in people if p['human_name'] in ('william tomaszewski', 'candice stover')]
    client = Upkuajing(settings.upkuajing_api_key)
    summary = []
    try:
        for index, (name, kind, identifier) in enumerate(subjects):
            pair = {'subject': name, 'subject_type': kind, 'endpoints': []}
            values = []
            for mode, endpoint, payload in [
                ('single', '/search/contact', {'bus_id': identifier, 'bus_type': kind}),
                ('batch', '/agent/search/contact/batch', {'bus_ids': [identifier], 'bus_type': kind}),
            ]:
                started = monotonic()
                try:
                    response = client.client.post(endpoint, json=payload, headers={'Authorization': 'Bearer '+client.key})
                    try:
                        body = response.json()
                    except ValueError:
                        body = {'non_json': True, 'bytes': len(response.content)}
                    (output/f'{index}-{mode}.json').write_text(json.dumps(body, ensure_ascii=False, indent=2), encoding='utf-8')
                    data = body.get('data')
                    if mode == 'batch' and isinstance(data, dict):
                        data = next((row.get('contact_data') for row in data.get('list', [])
                                     if row.get('bus_id') == identifier and row.get('bus_type') == kind), {})
                    data = data if isinstance(data, dict) else {}
                    channels = {channel: data.get(channel, []) for channel in ('emails', 'phones', 'websites', 'socials')}
                    valid = response.status_code == 200 and body.get('code') == 0
                    values.append({(channel, row.get('val')) for channel, rows in channels.items() if isinstance(rows, list)
                                   for row in rows if isinstance(row, dict) and row.get('val')} if valid else None)
                    pair['endpoints'].append({'mode': mode, 'endpoint': endpoint, 'http_status': response.status_code,
                        'code': body.get('code'), 'message': body.get('msg'), 'top_level_keys': sorted(body),
                        'data_keys': sorted(data), 'counts': {k: len(v) if isinstance(v, list) else None for k, v in channels.items()},
                        'fee': {'apiCost': body['fee'].get('apiCost')} if isinstance(body.get('fee'), dict) else None,
                        'quota_usage': quota_usage(body.get('usage')),
                        'duration_ms': round((monotonic()-started)*1000)})
                except Exception as error:
                    values.append(None)
                    pair['endpoints'].append({'mode': mode, 'error_type': type(error).__name__})
            pair['same_contact_values'] = values[0] == values[1] if all(v is not None for v in values) else None
            summary.append(pair)
            print(json.dumps(pair, ensure_ascii=False), flush=True)
    finally:
        client.close()
        (output/'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
