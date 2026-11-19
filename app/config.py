import json
import os
from dataclasses import dataclass, field
from urllib.parse import urlsplit


BUYER_OPERATIONS = {'search': 'buyer_search', 'profile': 'buyer_profile', 'contacts': 'buyer_contacts'}
BILLABLE_OPERATIONS = frozenset({'prospecting', 'public_search', 'report', 'customs_verification', *BUYER_OPERATIONS.values()})


@dataclass(frozen=True)
class Settings:
    environment: str = 'production'
    web_prefix: str = ''
    cors_allow_origins: tuple[str, ...] = ('*',)
    database_url: str | None = None
    llm_api_key: str | None = field(default=None, repr=False)
    llm_model: str = 'deepseek-flash'
    llm_base_url: str = 'https://api.deepseek.com'
    upkuajing_api_key: str | None = field(default=None, repr=False)
    upkuajing_daily_call_limit: int = 5
    default_point_cost: int = 1
    point_cost_overrides: dict[str, int] = field(default_factory=dict)
    max_pending_jobs: int = 10
    max_agent_instances: int | None = None
    search_calls_per_job: int = 8
    fetch_calls_per_job: int = 5

    def __post_init__(self) -> None:
        if self.web_prefix and (not self.web_prefix.startswith('/') or self.web_prefix.endswith('/') or any(char not in '/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-' for char in self.web_prefix)):
            raise ValueError('WEB_PREFIX must be an absolute URL path without a trailing slash')
        if self.database_url and not self.database_url.startswith('mysql+pymysql://'):
            if self.environment != 'test' or not self.database_url.startswith('sqlite'):
                raise ValueError('DATABASE_URL must use mysql+pymysql outside SQLite tests')
        if type(self.default_point_cost) is not int or self.default_point_cost < 0:
            raise ValueError('POINTS_DEFAULT_COST must be a non-negative integer')
        if not isinstance(self.point_cost_overrides, dict) or any(
            key not in BILLABLE_OPERATIONS or type(value) is not int or value < 0
            for key, value in self.point_cost_overrides.items()
        ):
            raise ValueError('POINTS_OPERATION_COSTS must map supported operations to non-negative integers')
        if min(self.max_pending_jobs, self.search_calls_per_job) < 1 or self.fetch_calls_per_job < 0:
            raise ValueError('Job and search limits must be positive and fetch limit non-negative')
        if self.upkuajing_daily_call_limit < 0:
            raise ValueError('UPKUAJING_DAILY_CALL_LIMIT must be non-negative')
        if self.max_agent_instances is not None and self.max_agent_instances < 1:
            raise ValueError('MAX_AGENT_INSTANCES must be positive when set')
        endpoint = urlsplit(self.llm_base_url)
        if endpoint.scheme != 'https' or not endpoint.hostname or endpoint.username or endpoint.password:
            raise ValueError('LLM_BASE_URL must be an HTTPS URL without embedded credentials')

    @classmethod
    def from_env(cls) -> 'Settings':
        max_agents = os.getenv('MAX_AGENT_INSTANCES')
        return cls(
            environment=os.getenv('APP_ENV', 'production'),
            web_prefix=os.getenv('WEB_PREFIX', ''),
            cors_allow_origins=tuple(
                origin.strip() for origin in os.getenv('CORS_ALLOW_ORIGINS', '*').split(',')
                if origin.strip()
            ),
            database_url=os.getenv('DATABASE_URL'),
            llm_api_key=os.getenv('LLM_API_KEY'),
            llm_model=os.getenv('LLM_MODEL', 'deepseek-flash'),
            llm_base_url=os.getenv('LLM_BASE_URL', 'https://api.deepseek.com'),
            upkuajing_api_key=os.getenv('UPKUAJING_API_KEY'),
            upkuajing_daily_call_limit=int(os.getenv('UPKUAJING_DAILY_CALL_LIMIT', '5')),
            default_point_cost=int(os.getenv('POINTS_DEFAULT_COST', '1')),
            point_cost_overrides=json.loads(os.getenv('POINTS_OPERATION_COSTS', '{}')),
            max_pending_jobs=int(os.getenv('MAX_PENDING_JOBS', '10')),
            max_agent_instances=int(max_agents) if max_agents else None,
            search_calls_per_job=int(os.getenv('SEARCH_CALLS_PER_JOB', '8')),
            fetch_calls_per_job=int(os.getenv('FETCH_CALLS_PER_JOB', '5')),
        )

    def point_cost(self, operation: str) -> int:
        if operation not in BILLABLE_OPERATIONS:
            raise ValueError(f'Unsupported operation: {operation}')
        return self.point_cost_overrides.get(operation, self.default_point_cost)
