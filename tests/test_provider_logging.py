from unittest import TestCase

import httpx

from app.deepseek import ProviderError
from app.provider_logging import MAX_BODY_CHARS, observe_http, safe_body
from app.upkuajing import Upkuajing


class ProviderLoggingTest(TestCase):
    def test_errors_retain_sanitized_http_response(self):
        for status, body, code in [
            (403, {'token': 'hidden', 'message': 'secret-value'}, 'upkuajing_access_denied'),
            (200, {'code': 95, 'data': {}}, 'upkuajing_balance_low'),
            (200, ['invalid'], 'upkuajing_invalid_response'),
        ]:
            with self.subTest(status=status, body=body):
                events = []
                with UpstreamFixture(status, body) as adapter:
                    with observe_http(lambda event, data: events.append((event, data))):
                        with self.assertRaises(ProviderError) as raised:
                            adapter.check_account()
                self.assertEqual(raised.exception.code, code)
                self.assertEqual([event for event, _ in events], ['request', 'response'])
                self.assertEqual(events[1][1]['status_code'], status)
                self.assertNotIn('secret-value', str(events))
                self.assertNotIn('hidden', str(events))

    def test_timeout_and_non_json(self):
        events = []

        def timeout(request):
            raise httpx.ReadTimeout('secret-value', request=request)

        adapter = Upkuajing('secret-value', transport=httpx.MockTransport(timeout))
        self.addCleanup(adapter.close)
        with observe_http(lambda event, data: events.append((event, data))):
            with self.assertRaises(ProviderError):
                adapter.check_account()
        self.assertEqual(events[-1][1]['error'], 'ReadTimeout')
        self.assertIsNone(events[-1][1]['status_code'])
        self.assertNotIn('secret-value', str(events))
        adapter = Upkuajing('secret-value', transport=httpx.MockTransport(
            lambda _: httpx.Response(502, text='secret-value')))
        self.addCleanup(adapter.close)
        with observe_http(lambda event, data: events.append((event, data))):
            with self.assertRaises(ProviderError):
                adapter.check_account()
        self.assertTrue(events[-1][1]['body']['non_json'])
        self.assertNotIn('secret-value', str(events))

    def test_nested_redaction_and_size_limit(self):
        self.assertEqual(safe_body({'data': [{'api_key': 'private', 'name': 'secret-value'}]},
                                   ('secret-value',)),
                         {'data': [{'api_key': '[REDACTED]', 'name': '[REDACTED]'}]})
        result = safe_body({'text': 'x' * (MAX_BODY_CHARS + 1)})
        self.assertTrue(result['truncated'])
        self.assertEqual(len(result['preview']), MAX_BODY_CHARS)


class UpstreamFixture:
    def __init__(self, status, body):
        self.adapter = Upkuajing('secret-value', transport=httpx.MockTransport(
            lambda _: httpx.Response(status, json=body)))

    def __enter__(self):
        return self.adapter

    def __exit__(self, *_):
        self.adapter.close()
