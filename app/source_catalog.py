"""Official sources and honest access modes. No claim of whole-dataset ingestion."""
DIRECT_SOURCES = {
    'find_tender': {'name':'Find a Tender 英国采购 OCDS API', 'category':'procurement',
        'coverage':'英国 Find a Tender 公开采购发布记录，单页最多扫描100条后本地筛关键词',
        'url':'https://www.find-tender.service.gov.uk/',
        'documentation':'https://www.find-tender.service.gov.uk/apidocumentation/1.0/GET-ocdsReleasePackages',
        'access':'direct_api', 'authentication':'none',
        'license_note':'Open Government Licence v3.0；保留来源、公告链接及归属说明。',
        'limitations':'按更新时间窗口取一页，不是全库关键词搜索；0条只代表本页未匹配。区分招标、中标与完成状态；买方邮箱仅取明确买方，公告不等于已验证仍开放需求。'},
    'contracts_finder': {'name':'Contracts Finder 英国合同 OCDS API', 'category':'procurement',
        'coverage':'英国 Contracts Finder 公开采购记录，单页最多扫描100条后本地筛关键词',
        'url':'https://www.contractsfinder.service.gov.uk/',
        'documentation':'https://www.gov.uk/government/publications/open-contracting',
        'access':'direct_api', 'authentication':'none',
        'license_note':'Open Government Licence v3.0；保留来源、公告链接及归属说明。',
        'limitations':'按发布时间窗口取一页，不是全库关键词搜索；不能把中标/合同期截止当开放需求/投标截止，不将供应商邮箱归给买方。'},
    'worldbank_notices': {'name':'世界银行采购公告 API', 'category':'procurement',
        'coverage':'世界银行融资项目的公开投标邀请，全球；当前关键词查询不支持国家过滤',
        'url':'https://projects.worldbank.org/en/projects-operations/procurement',
        'documentation':'https://datacatalog.worldbank.org/search/dataset/0037795/world-bank-procurement-notices',
        'access':'direct_api', 'authentication':'none', 'license_note':'World Bank Procurement Notices，CC BY 4.0；保留归属和原公告链接。',
        'limitations':'近 90 天 Published 投标邀请，单页；仍需核对期限、采购范围与资格。项目关键词匹配不等于产品匹配，联系机构不自动保证为最终采购法律主体。'},
    'gleif': {'name': 'GLEIF 全球 LEI 企业身份', 'category': 'entity_identity', 'coverage': '全球持有 LEI 的法律实体，非全部中小企业',
        'url': 'https://www.gleif.org/en/lei-data/gleif-api/', 'documentation': 'https://api.gleif.org/docs',
        'access': 'direct_api', 'authentication': 'none', 'license_note': 'LEI/LE-RD 为 CC0；不可暗示 GLEIF 为本产品背书。',
        'limitations': '默认查一般企业，排除基金；支持切换实体类别。只提供登记参考信息，不提供采购意向、商务联系人或信用保证。'},
    'ted': {'name': 'TED 欧盟公开招标', 'category': 'procurement', 'coverage': 'TED 发布的欧洲公共采购公告',
        'url': 'https://ted.europa.eu/', 'documentation': 'https://docs.ted.europa.eu/api/latest/search.html',
        'access': 'direct_api', 'authentication': 'none', 'license_note': '官方支持商业重用；保留公告出处并遵守公平使用和法律声明。',
        'limitations': '默认近 90 天标准竞争公告；多 lot 截止日期和投标资格须查看原公告。ACTIVE 不作为需求有效性的充分证据。'},
    'companies_house': {'name': 'Companies House 英国企业登记', 'category': 'entity_identity', 'coverage': '英国 Companies House 登记企业',
        'url': 'https://find-and-update.company-information.service.gov.uk/',
        'documentation': 'https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference/search/search-companies',
        'access': 'direct_api', 'authentication': 'server_api_key', 'license_note': '按官方数据重用和 OGL 适用范围处理，保留来源。',
        'limitations': '需配置 COMPANIES_HOUSE_API_KEY；仅查询企业公开档案，不查询董事个人资料。登记信息不是采购或信用保证。'},
}

# These are source-scoped searches over public pages, not integrations with undisclosed APIs.
SITE_SOURCES = {
    'sec': ('SEC 美国上市公司披露', 'company_filings', ['sec.gov'], 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces', '上市公司及申报主体；不能覆盖一般中小企业。'),
    'sam': ('SAM.gov 美国政府采购', 'procurement', ['sam.gov'], 'https://open.gsa.gov/api/get-opportunities-public-api/', '当前接入公开页面检索；原生 Opportunities API 需要单独密钥，尚未接入。'),
    'worldbank': ('世界银行项目与采购', 'development_projects', ['worldbank.org'], 'https://projects.worldbank.org/en/projects-operations/procurement', '项目、采购计划、公告和合同结果要区分；项目总额不等于产品采购额。'),
    'ungm': ('UNGM 联合国采购', 'procurement', ['ungm.org'], 'https://www.ungm.org/Public/Notice', '部分采购需要供应商注册与资质；当前只检索公开公告。'),
    'canada_buys': ('CanadaBuys 加拿大采购', 'procurement', ['canadabuys.canada.ca'], 'https://canadabuys.canada.ca/en/tender-opportunities', '公共采购机会，须核对时间、文件和准入条件。'),
    'austender': ('AusTender 澳大利亚采购', 'procurement', ['tenders.gov.au'], 'https://www.tenders.gov.au/', '采购、计划和合同披露不同；当前不自动报名或下载受限材料。'),
    'eu_safety_gate': ('EU Safety Gate 产品风险', 'product_risk', ['ec.europa.eu', 'webgate.ec.europa.eu'], 'https://ec.europa.eu/safety-gate/', '产品召回/风险事实，不是买家需求或自动法律结论。'),
    'cpsc': ('CPSC 美国产品召回', 'product_risk', ['cpsc.gov'], 'https://www.cpsc.gov/Recalls', '产品、品牌与召回情报，需核对具体型号和公告时间。'),
    'comtrade': ('UN Comtrade 贸易统计', 'market_statistics', ['comtrade.un.org', 'comtradeplus.un.org'], 'https://comtradeplus.un.org/', '国家/商品贸易统计，不是逐企业买家或提单名单；原生 API 尚未接入。'),
    'wto': ('WTO 市场与关税情报', 'market_statistics', ['wto.org'], 'https://www.wto.org/', '宏观市场与规则信息，不提供单个企业当前采购需求。'),
    'hktdc': ('HKTDC 展会与企业信息', 'exhibitions', ['hktdc.com'], 'https://www.hktdc.com/', '参展商通常是卖方；仅把公开目录作为候选，不自动认作采购商。'),
    'thomasnet': ('Thomasnet 北美工业企业目录', 'business_directory', ['thomasnet.com'], 'https://www.thomasnet.com/', '限定公开页面检索，不是目录API或全库。供应商/分销商可用于画像核对，不能自动认定当前采购。'),
    'kompass': ('Kompass 企业目录', 'business_directory', ['kompass.com'], 'https://www.kompass.com/', '限定公开页面检索；库存、付费联系人和完整数据库未接入。公司角色及联系方式归属须交叉核对。'),
    'europages': ('Europages 欧洲企业目录', 'business_directory', ['europages.com', 'europages.co.uk'], 'https://www.europages.com/', '限定公开页面检索；大多为供应商资料，不把目录自身或参展/销售产品当作当前采购意向。'),
    'opencorporates': ('OpenCorporates 企业身份参考', 'entity_identity', ['opencorporates.com'], 'https://api.opencorporates.com/documentation/API-Reference', '当前仅限站搜索；原生API需密钥与适用许可，未接入。公开可读不等于商业产品可免费重售；不能替代官方登记。'),
    'industry_members': ('MSCI / NAW 工业渠道与协会', 'industry_associations', ['msci.org', 'naw.org'], 'https://www.msci.org/', '仅检索公开协会及会员页面，成员关系不证明当前采购；应回到企业官网核对角色和公开商务联系入口。'),
}


def catalog(settings):
    records = []
    for source_id, item in DIRECT_SOURCES.items():
        if source_id == 'companies_house' and not settings.companies_house_api_key and settings.llm_api_key and settings.tools_api_key:
            records.append({'id': source_id, **item, 'configured': True, 'status': 'configured',
                'access': 'site_scoped_web_search', 'authentication': 'existing_ai_search_keys',
                'domains': ['find-and-update.company-information.service.gov.uk'],
                'limitations': '未配置 Companies House 原生 API 密钥；当前真实检索官方公开档案网页，'
                              '覆盖范围受搜索索引限制，不是原生 API 查询。登记信息不是采购或信用保证。',
                'per_call_data_fee': 'existing_search_and_model_costs_apply', 'platform_points_apply': True})
            continue
        configured = source_id != 'companies_house' or bool(settings.companies_house_api_key)
        records.append({'id': source_id, **item, 'configured': configured,
            'status': ('not_configured' if not configured else
                       'configured' if settings.public_source_daily_call_limit else 'disabled'),
            'per_call_data_fee': 'no_usage_fee_documented', 'platform_points_apply': True})
    for source_id, (name, category, domains, url, limitation) in SITE_SOURCES.items():
        configured = bool(settings.llm_api_key and settings.tools_api_key)
        records.append({'id': source_id, 'name': name, 'category': category, 'coverage': '该站点公开且搜索引擎可索引的页面',
            'url': url, 'documentation': url, 'access': 'site_scoped_web_search', 'domains': domains,
            'authentication': 'existing_ai_search_keys', 'license_note': '保留原始链接；公开可读不自动等于可重售整个数据库。',
            'limitations': limitation, 'configured': configured,
            'status': 'configured' if configured else 'not_configured',
            'per_call_data_fee': 'existing_search_and_model_costs_apply', 'platform_points_apply': True})
    return records
