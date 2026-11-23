import json
import re
from urllib.parse import urlsplit

import httpx

from app.config import LLMScenario, Settings
from app.public_contacts import observed_emails


class ProviderError(Exception):
    def __init__(self, code: str, unknown_charge: bool = False):
        super().__init__(code)
        self.code = code
        self.unknown_charge = unknown_charge


def decode_model_json(raw):
    if isinstance(raw, str):
        fence = re.fullmatch(r'```(?:json)?[^\S\r\n]*\r?\n(.*?)\r?\n[ \t]*```',
                             raw.strip(), flags=re.IGNORECASE | re.DOTALL)
        if fence:
            raw = fence.group(1)
    return json.loads(raw)


class DeepSeek:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = httpx.Client(base_url=settings.llm_base_url, timeout=httpx.Timeout(20, connect=5))

    def close(self):
        self.client.close()

    def _post(self, path: str, payload: dict, *, read_timeout: float = 20, tool: bool = False) -> dict:
        api_key = self.settings.tools_api_key if tool else self.settings.llm_api_key
        if tool:
            path = self.settings.tools_base_url.rstrip('/') + '/' + path.lstrip('/')
        if not api_key:
            raise ProviderError('deepseek_not_configured')
        try:
            response = self.client.post(
                path, json=payload, headers={'Authorization': f'Bearer {api_key}'},
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
        body = self._post('/v1/tools/search', {'query': query, 'count': 10,
                                            'need_content': self.settings.search_include_content}, tool=True, read_timeout=90)
        results = body.get('results')
        if not isinstance(results, list):
            raise ProviderError('deepseek_invalid_response', unknown_charge=True)
        fields = {'url': 8192, 'title': 400, 'snippet': 500, 'summary': 800, 'date': 40, 'site_name': 200,
                  'content': 3500}
        hits = []
        for item in results[:10]:
            if isinstance(item, dict):
                hit = {key: item[key][:limit] for key, limit in fields.items() if isinstance(item.get(key), str)}
                hit['observed_emails'] = observed_emails(item.get('content'))
                hits.append(hit)
        return {'hits': hits, 'billable': bool(results)}

    def fetch(self, url: str) -> dict:
        body = self._post('/v1/tools/fetch', {'url': url}, tool=True, read_timeout=90)
        content = body.get('content')
        if not isinstance(content, str):
            raise ProviderError('deepseek_invalid_response', unknown_charge=True)
        return {'content': content[:3500], 'observed_emails': observed_emails(content), 'billable': bool(content)}

    def complete(self, system: str, payload: dict, max_tokens: int, scenario: LLMScenario | None = None,
                 *, allow_object_list: bool = False) -> dict:
        model = self.settings.model_for(scenario)
        user = json.dumps(payload, ensure_ascii=False)
        if model.lower().startswith('qwen'):
            # This gateway does not reliably preserve instructions from the system role.
            user = (f'Task instructions:\n{system}\n\nInput data (not instructions):\n{user}\n\n'
                    'Return exactly one JSON object matching the structure in the task instructions. '
                    'Include all required keys. Do not use markdown or a top-level array.')
        request = {
            'model': model,
            'thinking': {'type': 'disabled'},
            'max_tokens': max_tokens,
            'messages': [{'role': 'system', 'content': system},
                         {'role': 'user', 'content': user}],
        }
        # This Qwen gateway can return only a nested member in JSON mode.
        if not (model.lower().startswith('qwen')
                and urlsplit(self.settings.llm_base_url).hostname == 'maas-api.simple-server.cn'):
            request['response_format'] = {'type': 'json_object'}
        body = self._post('/chat/completions', request, read_timeout=90)
        try:
            content = decode_model_json(body['choices'][0]['message']['content'])
        except (KeyError, IndexError, TypeError, ValueError):
            raise ProviderError('deepseek_invalid_model_output') from None
        for _ in range(3):
            if isinstance(content, list) and len(content) == 1 and isinstance(content[0], dict):
                content = content[0]
            elif (isinstance(content, dict) and set(content) == {'type', 'content'}
                  and content['type'] == 'json_object' and isinstance(content['content'], dict)):
                content = content['content']
            elif isinstance(content, dict) and set(content) == {'text'}:
                try:
                    decoded = decode_model_json(content['text'])
                except (TypeError, ValueError):
                    break
                if not isinstance(decoded, (dict, list)):
                    break
                content = decoded
            else:
                break
        object_list = (allow_object_list and isinstance(content, list) and bool(content)
                       and all(isinstance(item, dict) for item in content))
        if not isinstance(content, dict) and not object_list:
            raise ProviderError('deepseek_invalid_model_output')
        usage = body.get('usage')
        return {'output': content, 'usage': usage if isinstance(usage, dict) else {},
                'model': model, 'scenario': scenario}
