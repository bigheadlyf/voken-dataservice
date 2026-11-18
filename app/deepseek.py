import json

import httpx

from app.config import Settings


class ProviderError(Exception):
    def __init__(self, code: str, unknown_charge: bool = False):
        super().__init__(code)
        self.code = code
        self.unknown_charge = unknown_charge


class DeepSeek:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = httpx.Client(base_url=settings.llm_base_url, timeout=httpx.Timeout(20, connect=5))

    def close(self):
        self.client.close()

    def _post(self, path: str, payload: dict, *, read_timeout: float = 20) -> dict:
        if not self.settings.llm_api_key:
            raise ProviderError('deepseek_not_configured')
        try:
            response = self.client.post(
                path, json=payload, headers={'Authorization': f'Bearer {self.settings.llm_api_key}'},
                timeout=httpx.Timeout(20, connect=5, read=read_timeout),
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            codes = {401: 'deepseek_invalid_credentials', 402: 'deepseek_balance_low',
                     404: 'source_unavailable', 429: 'deepseek_rate_limited'}
            raise ProviderError(codes.get(error.response.status_code, 'deepseek_request_failed')) from None
        except httpx.ReadTimeout:
            raise ProviderError('deepseek_read_timeout', unknown_charge=True) from None
        except (httpx.ConnectTimeout, httpx.ConnectError):
            raise ProviderError('deepseek_connection_unavailable') from None
        except httpx.RequestError:
            raise ProviderError('deepseek_response_unknown', unknown_charge=True) from None
        try:
            result = response.json()
        except ValueError:
            raise ProviderError('deepseek_invalid_response', unknown_charge=True) from None
        if not isinstance(result, dict):
            raise ProviderError('deepseek_invalid_response', unknown_charge=True)
        return result

    def search(self, query: str) -> dict:
        body = self._post('/v1/tools/search', {'query': query, 'count': 10, 'need_content': False})
        results = body.get('results')
        if not isinstance(results, list):
            raise ProviderError('deepseek_invalid_response', unknown_charge=True)
        fields = {'url': 8192, 'title': 400, 'snippet': 500, 'summary': 800, 'date': 40, 'site_name': 200}
        hits = []
        for item in results[:10]:
            if isinstance(item, dict):
                hits.append({key: item[key][:limit] for key, limit in fields.items() if isinstance(item.get(key), str)})
        return {'hits': hits, 'billable': bool(results)}

    def fetch(self, url: str) -> dict:
        body = self._post('/v1/tools/fetch', {'url': url})
        content = body.get('content')
        if not isinstance(content, str):
            raise ProviderError('deepseek_invalid_response', unknown_charge=True)
        return {'content': content[:3500], 'billable': bool(content)}

    def complete(self, system: str, payload: dict, max_tokens: int) -> dict:
        body = self._post('/chat/completions', {
            'model': self.settings.llm_model,
            'thinking': {'type': 'disabled'},
            'response_format': {'type': 'json_object'},
            'max_tokens': max_tokens,
            'messages': [{'role': 'system', 'content': system},
                         {'role': 'user', 'content': json.dumps(payload, ensure_ascii=False)}],
        }, read_timeout=90)
        try:
            content = json.loads(body['choices'][0]['message']['content'])
        except (KeyError, IndexError, TypeError, ValueError):
            raise ProviderError('deepseek_invalid_model_output') from None
        if not isinstance(content, dict):
            raise ProviderError('deepseek_invalid_model_output')
        usage = body.get('usage')
        return {'output': content, 'usage': usage if isinstance(usage, dict) else {}}
