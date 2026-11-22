"""Shared, documented shapes for official-source catalog entries and normalized records."""
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SourceDescriptor(BaseModel):
    id: str
    name: str
    category: str
    coverage: str
    url: str
    documentation: str
    access: Literal['direct_api', 'site_scoped_web_search']
    authentication: str
    license_note: str
    limitations: str
    configured: bool = Field(description='配置是否齐备，不是连通性或数据质量保证。')
    status: Literal['configured', 'not_configured', 'disabled']
    per_call_data_fee: str
    platform_points_apply: bool
    domains: list[str] = Field(default_factory=list)


class OfficialRecord(BaseModel):
    id: str = Field(description='原生来源记录标识，例如 LEI、英国企业编号或 TED 公告号。')
    entity_name: str | None = Field(description='明确的单一主体名；多买方且未消歧时为 null。')
    title: str
    country: str | None = Field(description='原来源地区编码；GLEIF/英国通常为二字码，TED 可能为三字码。')
    evidence_type: Literal['entity_registration', 'procurement_notice']
    source_url: str
    summary: str
    details: dict = Field(description='保留来源特有的规范化字段；登记状态和采购期限不能混用。')
    procurement_status: str


class SourceLookup(BaseModel):
    model_config = ConfigDict(extra='allow')
    source_id: str
    records: list[OfficialRecord]
    total_reported: int | None = Field(description='上游报告总数，不是本系统已获取或验收通过的记录数。')
    has_more: bool
    retrieved_at: str
    warnings: list[str] = Field(default_factory=list)
    data_fee_milli_cny: int = Field(description='原生来源数据接口费，千分之一人民币元；不含平台点数与基础设施。')
    evidence_scope: str
    cache_hit: bool | None = None
    cache_expires_at: str | None = None
    scanned_count: int | None = Field(default=None, description='英国OCDS来源本页实际扫描数，上限100；不是全库总数。')
    scan_limit: int | None = None
    matched_in_page: int | None = None
    search_scope: str | None = None
    date_filter: dict | None = None
