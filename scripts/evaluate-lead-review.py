"""One opt-in live model review of locally captured, source-backed evidence."""
import argparse
import importlib.util
import json
from pathlib import Path
import sys
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('evidence_file', type=Path, help='JSON with input, sources and raw_output')
    parser.add_argument('--live', action='store_true', help='Authorize a real, potentially billable model request')
    args = parser.parse_args()
    if not args.live:
        parser.error('--live is required')
    spec = importlib.util.spec_from_file_location('live_environment', ROOT/'scripts/run-live-dev.py')
    env = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(env)
    env.load_environment()
    from app.config import Settings
    from app.deepseek import DeepSeek
    from app.pipeline import collect_leads
    from app.lead_review import review_leads
    evidence = json.loads(args.evidence_file.read_text(encoding='utf-8'))
    provider = DeepSeek(Settings.from_env())
    calls, result = [], {}
    def call(step, endpoint, invoke, *parameters):
        response = invoke(*parameters)
        calls.append({'step': step, 'model': response.get('model'), 'scenario': response.get('scenario'),
                      'usage': response.get('usage'), 'output': response.get('output')})
        return response
    run = SimpleNamespace(result=result, provider=provider, call=call)
    try:
        before = collect_leads(evidence['raw_output'], evidence['sources'], 30)
        reviewed = review_leads(run, evidence, evidence['raw_output'])
        after = collect_leads(reviewed, evidence['sources'], 30)
        proof = {'mode': 'captured_real_evidence_replay_with_live_model', 'new_search_calls': 0,
            'new_contact_calls': 0, 'body_context_count': sum(bool(s.get('content')) for s in evidence['sources']),
            'before': len(before), 'after': len(after), 'review': result, 'leads': after, 'model_calls': calls}
        output = ROOT/'.local/osint-research-20261121/llm-analysis-replay-result.json'
        output.parent.mkdir(exist_ok=True, parents=True)
        output.write_text(json.dumps(proof, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps({k: v for k, v in proof.items() if k not in ('leads', 'model_calls')}, ensure_ascii=False))
        print('models', [r['model'] for r in calls])
    finally:
        provider.close()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
