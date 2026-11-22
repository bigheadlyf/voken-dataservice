"""Run the real application locally, without fixture providers or SMTP capture."""
import argparse
from dataclasses import replace
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def load_environment():
    for path in (ROOT / '.env', ROOT / '.local/app.env'):
        if not path.exists():
            continue
        for line in path.read_text(encoding='utf-8-sig').splitlines():
            match = re.fullmatch(r'\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*', line)
            if not match:
                continue
            key, value = match.groups()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
                value = value[1:-1]
            else:
                value = re.sub(r'\s+#.*$', '', value)
            os.environ[key] = value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=18084)
    parser.add_argument('--database-file', type=Path,
                        help='Existing SQLite development database; accounts and records are retained.')
    args = parser.parse_args()
    load_environment()
    from app.config import Settings
    from app.main import create_app
    import uvicorn

    settings = Settings.from_env()
    if args.database_file:
        database = args.database_file.resolve()
        if not database.is_file():
            parser.error('The existing database file is required; no sample database will be seeded.')
        settings = replace(settings, environment='test', web_prefix='',
                           database_url='sqlite:///' + database.as_posix())
        from app.db import Base, create_session_factory
        sessions = create_session_factory(settings.database_url)
        try:
            Base.metadata.create_all(sessions.kw['bind'])
        finally:
            sessions.kw['bind'].dispose()
    if not settings.database_url or not settings.llm_api_key or not settings.tools_api_key:
        parser.error('DATABASE_URL, LLM_API_KEY and TOOLS_API_KEY are required for the live service.')
    if settings.smtp_enabled and settings.smtp_mode == 'test_plain':
        parser.error('The live launcher requires encrypted real SMTP; test_plain capture is not allowed.')
    # The old QA database contains cached fixture responses. Never reuse them in live mode.
    settings = replace(settings, public_cache_ttl_seconds=0)
    print('Providers: real model, real search/fetch, real configured data APIs. '
          'SMTP: ' + ('configured' if settings.smtp_enabled else 'unconfigured (sending disabled)'), flush=True)
    uvicorn.run(create_app(settings=settings), host='127.0.0.1', port=args.port)


if __name__ == '__main__':
    main()
