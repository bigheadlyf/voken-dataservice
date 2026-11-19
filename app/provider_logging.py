"""Scoped upstream HTTP logging, shared by adapters and the job worker."""
import json
import logging
from contextlib import contextmanager
from contextvars import ContextVar


logger = logging.getLogger(__name__)
_observer = ContextVar('provider_log_observer', default=None)
SENSITIVE_FIELDS = {'authorization', 'apikey', 'key', 'token', 'accesstoken', 'refreshtoken',
                    'password', 'secret', 'apisecret', 'cookie', 'setcookie'}
MAX_BODY_CHARS = 100_000


def safe_body(value, secrets=()):
    def redact(item):
        if isinstance(item, dict):
            return {key: '[REDACTED]' if key.lower().replace('_', '').replace('-', '') in SENSITIVE_FIELDS
                    else redact(val) for key, val in item.items()}
        if isinstance(item, list):
            return [redact(val) for val in item]
        if isinstance(item, str):
            for secret in secrets:
                if secret:
                    item = item.replace(secret, '[REDACTED]')
        return item

    value = redact(value)
    encoded = json.dumps(value, ensure_ascii=False)
    if len(encoded) > MAX_BODY_CHARS:
        return {'truncated': True, 'original_chars': len(encoded), 'preview': encoded[:MAX_BODY_CHARS]}
    return value


def record_http(event, data):
    logger.info('upkuajing_http_%s %s', event, json.dumps(data, ensure_ascii=False))
    observer = _observer.get()
    if observer is not None:
        observer(event, data)


@contextmanager
def observe_http(observer):
    token = _observer.set(observer)
    try:
        yield
    finally:
        _observer.reset(token)
