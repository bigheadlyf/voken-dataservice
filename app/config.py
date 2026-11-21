import json
import os
from dataclasses import dataclass, field
from typing import Literal
from urllib.parse import urlsplit


BUYER_OPERATIONS = {'search': 'buyer_search', 'profile': 'buyer_profile', 'contacts': 'buyer_contacts'}
BILLABLE_OPERATIONS = frozenset({'trade_search', 'directory_companies', 'directory_people', 'directory_contacts', 'prospecting', 'public_search', 'report', 'outreach_draft', 'source_lookup', 'customs_verification', *BUYER_OPERATIONS.values()})
LLMScenario = Literal['chat', 'judgment', 'analysis']


@dataclass(frozen=True)
class Settings:
    environment: str = 'production'
    web_prefix: str = ''
    cors_allow_origins: tuple[str, ...] = ('*',)
    database_url: str | None = None
    llm_api_key: str | None = field(default=None, repr=False)
    llm_model: str = 'deepseek-flash'
    llm_advanced_model: str = 'deepseek-v4-pro'
    llm_chat_model: str | None = None
    llm_judgment_model: str | None = None
    llm_analysis_model: str | None = None
    llm_base_url: str = 'https://api.deepseek.com'
    tools_api_key: str | None = field(default=None, repr=False)
    tools_base_url: str = field(default='https://api.deepseek.com', init=False)
    upkuajing_api_key: str | None = field(default=None, repr=False)
    upkuajing_daily_call_limit: int = 5
    hunter_api_key: str | None = field(default=None, repr=False)
    hunter_daily_call_limit: int = 20
    hunter_contact_estimate_milli_cny: int = 170
    default_point_cost: int = 1
    point_cost_overrides: dict[str, int] = field(default_factory=dict)
    max_pending_jobs: int = 10
    max_agent_instances: int | None = None
    search_calls_per_job: int = 8
    fetch_calls_per_job: int = 5
    public_cache_ttl_seconds: int = 21600
    search_include_content: bool = True
    companies_house_api_key: str | None = field(default=None, repr=False)
    public_source_daily_call_limit: int = 100
    public_tool_estimate_milli_cny: int = 6
    smtp_enabled: bool = False
    smtp_workspace_id: str | None = None
    smtp_host: str = ''
    smtp_port: int = 587
    smtp_mode: str = 'starttls'
    smtp_username: str = ''
    smtp_password: str = field(default='', repr=False)
    smtp_from: str = ''
    smtp_footer: str = ''
    smtp_daily_limit: int = 20
    email_validation_api_key: str = field(default='', repr=False)
    email_validation_workspace_id: str = ''
    email_validation_daily_limit: int = 20
    imap_host: str = ''
    imap_username: str = ''
    imap_password: str = field(default='', repr=False)
    imap_workspace_id: str = ''
    sms_access_key_id: str = field(default='',repr=False)
    sms_access_key_secret: str = field(default='',repr=False)
    sms_sign_name: str = ''
    sms_template_code: str = ''
    sms_code_secret: str = field(default='',repr=False)
    wechat_enabled: bool = False
    wechat_mch_id: str = ''
    wechat_app_id: str = ''
    wechat_merchant_serial: str = ''
    wechat_private_key_path: str = field(default='',repr=False)
    wechat_platform_key_id: str = ''
    wechat_platform_public_key_path: str = field(default='',repr=False)
    wechat_api_v3_key: str = field(default='',repr=False)
    wechat_notify_url: str = ''

    @property
    def company_intake_daily_limit(self) -> int:
        return 2_147_483_647 if self.environment == 'test' else 20

    def __post_init__(self) -> None:
        for name in ('llm_model', 'llm_advanced_model', 'llm_chat_model', 'llm_judgment_model', 'llm_analysis_model'):
            value = getattr(self, name)
            if (value is None and name in ('llm_model', 'llm_advanced_model')) or (value is not None and (not isinstance(value, str) or not value.strip())):
                raise ValueError(f'{name.upper()} must be a non-empty model name')
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
        if not 0 <= self.hunter_daily_call_limit <= 10000:
            raise ValueError('HUNTER_DAILY_CALL_LIMIT must be between 0 and 10000')
        if not 0 <= self.hunter_contact_estimate_milli_cny <= 10000:
            raise ValueError('HUNTER_CONTACT_ESTIMATE_MILLI_CNY must be between 0 and 10000')
        if not 0 <= self.public_cache_ttl_seconds <= 86400:
            raise ValueError('PUBLIC_CACHE_TTL_SECONDS must be between 0 and 86400')
        if self.public_source_daily_call_limit < 0:
            raise ValueError('PUBLIC_SOURCE_DAILY_CALL_LIMIT must be non-negative')
        if not 0 <= self.public_tool_estimate_milli_cny <= 10000:
            raise ValueError('PUBLIC_TOOL_ESTIMATE_MILLI_CNY must be between 0 and 10000')
        if self.max_agent_instances is not None and self.max_agent_instances < 1:
            raise ValueError('MAX_AGENT_INSTANCES must be positive when set')
        if self.smtp_mode not in ('starttls', 'ssl', 'test_plain') or not 1 <= self.smtp_port <= 65535:
            raise ValueError('Invalid SMTP mode or port')
        if self.smtp_daily_limit < 0 or self.smtp_daily_limit > 1000:
            raise ValueError('SMTP_DAILY_LIMIT must be between 0 and 1000')
        if not 0 <= self.email_validation_daily_limit <= 1000:
            raise ValueError('EMAIL_VALIDATION_DAILY_LIMIT must be between 0 and 1000')
        import re
        for enabled, workspace in ((self.email_validation_api_key, self.email_validation_workspace_id),
                                   (self.imap_host, self.imap_workspace_id)):
            if enabled and not re.fullmatch(r'[0-9a-f]{32}', workspace):
                raise ValueError('External mail tools require an explicit workspace ID')
        if self.imap_host and (not re.fullmatch(r'[A-Za-z0-9.-]+', self.imap_host)
                               or not self.imap_username or not self.imap_password):
            raise ValueError('IMAP requires hostname, username and password; TLS port 993 only')
        if self.smtp_mode == 'test_plain' and (self.environment != 'test' or self.smtp_host not in ('localhost', '127.0.0.1', '::1')):
            raise ValueError('Plain SMTP is only supported for a loopback test receiver')
        if self.smtp_enabled:
            import re
            if not self.smtp_workspace_id or not re.fullmatch(r'[0-9a-f]{32}', self.smtp_workspace_id):
                raise ValueError('SMTP_WORKSPACE_ID is required when enabling SMTP')
            if not self.smtp_host or any(c.isspace() for c in self.smtp_host):
                raise ValueError('SMTP_HOST is required')
            if not re.fullmatch(r'[A-Za-z0-9.!#$%&\x27*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}', self.smtp_from):
                raise ValueError('SMTP_FROM must be a single ASCII mailbox')
            if not self.smtp_footer.strip() or len(self.smtp_footer) > 2000:
                raise ValueError('SMTP_FOOTER must contain sender identity and a reply-to-opt-out instruction')
            if self.smtp_mode != 'test_plain' and not (self.smtp_username and self.smtp_password):
                raise ValueError('SMTP credentials are required for the encrypted sender')
        sms_fields=(self.sms_access_key_id,self.sms_access_key_secret,self.sms_sign_name,self.sms_template_code,self.sms_code_secret)
        if any(sms_fields) and (not all(sms_fields) or len(self.sms_code_secret)<32):
            raise ValueError('SMS configuration requires access key, sign, template and a code secret of at least 32 characters')
        if self.wechat_enabled:
            import re
            values=(self.wechat_mch_id,self.wechat_app_id,self.wechat_merchant_serial,self.wechat_private_key_path,
                self.wechat_platform_key_id,self.wechat_platform_public_key_path,self.wechat_api_v3_key,self.wechat_notify_url)
            if not all(values) or len(self.wechat_api_v3_key.encode())!=32:
                raise ValueError('Complete WeChat merchant configuration and a 32-byte APIv3 key are required')
            if not re.fullmatch(r'[0-9]{6,20}',self.wechat_mch_id) or not re.fullmatch(r'[A-Za-z0-9_]{6,64}',self.wechat_app_id):
                raise ValueError('Invalid WeChat merchant identifiers')
            if any('"' in value or '\n' in value or '\r' in value for value in (self.wechat_merchant_serial,self.wechat_platform_key_id)):
                raise ValueError('Invalid WeChat key identifier')
            notify=urlsplit(self.wechat_notify_url)
            if notify.scheme!='https' or not notify.hostname or notify.query or notify.fragment or notify.username or notify.password:
                raise ValueError('WECHAT_NOTIFY_URL must be a public HTTPS callback without query parameters')
        for name, value in [('LLM_BASE_URL', self.llm_base_url), ('TOOLS_BASE_URL', self.tools_base_url)]:
            if value is None:
                continue
            endpoint = urlsplit(value)
            if endpoint.scheme != 'https' or not endpoint.hostname or endpoint.username or endpoint.password:
                raise ValueError(f'{name} must be an HTTPS URL without embedded credentials')

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
            llm_advanced_model=os.getenv('LLM_ADVANCED_MODEL', 'deepseek-v4-pro'),
            llm_chat_model=os.getenv('LLM_CHAT_MODEL') or None,
            llm_judgment_model=os.getenv('LLM_JUDGMENT_MODEL') or None,
            llm_analysis_model=os.getenv('LLM_ANALYSIS_MODEL') or None,
            llm_base_url=os.getenv('LLM_BASE_URL', 'https://api.deepseek.com'),
            tools_api_key=os.getenv('TOOLS_API_KEY'),
            upkuajing_api_key=os.getenv('UPKUAJING_API_KEY'),
            upkuajing_daily_call_limit=int(os.getenv('UPKUAJING_DAILY_CALL_LIMIT', '5')),
            hunter_api_key=os.getenv('HUNTER_API_KEY') or None,
            hunter_daily_call_limit=int(os.getenv('HUNTER_DAILY_CALL_LIMIT', '20')),
            hunter_contact_estimate_milli_cny=int(os.getenv('HUNTER_CONTACT_ESTIMATE_MILLI_CNY', '170')),
            default_point_cost=int(os.getenv('POINTS_DEFAULT_COST', '1')),
            point_cost_overrides=json.loads(os.getenv('POINTS_OPERATION_COSTS', '{}')),
            max_pending_jobs=int(os.getenv('MAX_PENDING_JOBS', '10')),
            max_agent_instances=int(max_agents) if max_agents else None,
            search_calls_per_job=int(os.getenv('SEARCH_CALLS_PER_JOB', '8')),
            fetch_calls_per_job=int(os.getenv('FETCH_CALLS_PER_JOB', '5')),
            public_cache_ttl_seconds=int(os.getenv('PUBLIC_CACHE_TTL_SECONDS', '21600')),
            search_include_content=os.getenv('SEARCH_INCLUDE_CONTENT', 'true').lower() in ('1', 'true', 'yes'),
            companies_house_api_key=os.getenv('COMPANIES_HOUSE_API_KEY'),
            public_source_daily_call_limit=int(os.getenv('PUBLIC_SOURCE_DAILY_CALL_LIMIT', '100')),
            public_tool_estimate_milli_cny=int(os.getenv('PUBLIC_TOOL_ESTIMATE_MILLI_CNY', '6')),
            smtp_enabled=os.getenv('SMTP_ENABLED', 'false').lower() in ('1','true','yes'),
            smtp_workspace_id=os.getenv('SMTP_WORKSPACE_ID'),
            smtp_host=os.getenv('SMTP_HOST', ''), smtp_port=int(os.getenv('SMTP_PORT', '587')),
            smtp_mode=os.getenv('SMTP_MODE', 'starttls'), smtp_username=os.getenv('SMTP_USERNAME', ''),
            smtp_password=os.getenv('SMTP_PASSWORD', ''), smtp_from=os.getenv('SMTP_FROM', ''),
            smtp_footer=os.getenv('SMTP_FOOTER', '').replace('\\n', '\n'),
            smtp_daily_limit=int(os.getenv('SMTP_DAILY_LIMIT', '20')),
            email_validation_api_key=os.getenv('EMAIL_VALIDATION_API_KEY', ''),
            email_validation_workspace_id=os.getenv('EMAIL_VALIDATION_WORKSPACE_ID', ''),
            email_validation_daily_limit=int(os.getenv('EMAIL_VALIDATION_DAILY_LIMIT', '20')),
            imap_host=os.getenv('IMAP_HOST', ''), imap_username=os.getenv('IMAP_USERNAME', ''),
            imap_password=os.getenv('IMAP_PASSWORD', ''), imap_workspace_id=os.getenv('IMAP_WORKSPACE_ID', ''),
            sms_access_key_id=os.getenv('SMS_ACCESS_KEY_ID',''),
            sms_access_key_secret=os.getenv('SMS_ACCESS_KEY_SECRET',''),
            sms_sign_name=os.getenv('SMS_SIGN_NAME',''),sms_template_code=os.getenv('SMS_TEMPLATE_CODE',''),
            sms_code_secret=os.getenv('SMS_CODE_SECRET',''),
            wechat_enabled=os.getenv('WECHAT_ENABLED','false').lower() in ('1','true','yes'),
            wechat_mch_id=os.getenv('WECHAT_MCH_ID',''),wechat_app_id=os.getenv('WECHAT_APP_ID',''),
            wechat_merchant_serial=os.getenv('WECHAT_MERCHANT_SERIAL',''),
            wechat_private_key_path=os.getenv('WECHAT_PRIVATE_KEY_PATH',''),
            wechat_platform_key_id=os.getenv('WECHAT_PLATFORM_KEY_ID',''),
            wechat_platform_public_key_path=os.getenv('WECHAT_PLATFORM_PUBLIC_KEY_PATH',''),
            wechat_api_v3_key=os.getenv('WECHAT_API_V3_KEY',''),wechat_notify_url=os.getenv('WECHAT_NOTIFY_URL',''),
        )

    def model_for(self, scenario: LLMScenario | None = None) -> str:
        if scenario is None:
            return self.llm_model
        if scenario not in ('chat', 'judgment', 'analysis'):
            raise ValueError(f'Unsupported LLM scenario: {scenario}')
        override = getattr(self, f'llm_{scenario}_model')
        return override or (self.llm_advanced_model if scenario == 'analysis' else self.llm_model)

    def point_cost(self, operation: str) -> int:
        if operation not in BILLABLE_OPERATIONS:
            raise ValueError(f'Unsupported operation: {operation}')
        return self.point_cost_overrides.get(operation, self.default_point_cost)
