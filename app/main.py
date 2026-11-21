import asyncio
from contextlib import asynccontextmanager
from hashlib import sha256
from pathlib import Path
from secrets import token_urlsafe

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from app import auth, billing, chat, company, company_intake, crm, customers, directory, discovery_planning, discovery_review, mail_delivery, payments, schedules, sources, workspaces
from app.config import Settings
from app.db import AgentTurn, create_session_factory, write_transaction
from sqlalchemy import update
from app.deepseek import DeepSeek
from app.openapi import install_openapi
from app.upkuajing import Upkuajing
from app.hunter import Hunter
from app.verification import FixedCodeVerificationProvider, VerificationProvider
from app.sms_verification import AliyunVerificationProvider
from app import crm_workbench
from app.worker import Worker


def create_app(
    provider: VerificationProvider | None = None,
    *,
    settings: Settings | None = None,
    deepseek=None,
    customs=None,
    run_worker: bool = True,
) -> FastAPI:
    settings = settings or Settings.from_env()
    sessions = create_session_factory(settings.database_url) if settings.database_url else None
    chat_provider = deepseek or DeepSeek(settings)
    managed_verification=None
    if provider is None and settings.sms_access_key_id and sessions is not None:
        managed_verification=AliyunVerificationProvider(settings,sessions)

    @asynccontextmanager
    async def lifespan(_application: FastAPI):
        worker_task = None
        stop = asyncio.Event()
        upstream = chat_provider
        trade_provider = customs
        hunter_provider = None
        try:
            if sessions is not None:
                await asyncio.to_thread(payments.recover_checkouts,sessions)
                with write_transaction(sessions) as session:
                    session.execute(update(AgentTurn).where(AgentTurn.status == 'running').values(
                        status='failed', error='agent_chat_interrupted'))
            if sessions is not None and run_worker:
                upstream = upstream or DeepSeek(settings)
                if trade_provider is None and settings.upkuajing_api_key:
                    trade_provider = Upkuajing(settings.upkuajing_api_key)
                if settings.hunter_api_key:
                    hunter_provider = Hunter(settings.hunter_api_key)
                worker = Worker(sessions, settings, upstream, trade_provider, hunter=hunter_provider)
                await asyncio.to_thread(worker.recover)
                worker_task = asyncio.create_task(worker.run(stop))
            yield
        finally:
            stop.set()
            try:
                if worker_task is not None:
                    worker.shutdown.set()
                    await worker_task
            finally:
                if upstream is not None and deepseek is None:
                    upstream.close()
                if trade_provider is not None and customs is None:
                    trade_provider.close()
                if hunter_provider is not None:
                    hunter_provider.close()
                if sessions is not None:
                    sessions.kw['bind'].dispose()
                if managed_verification is not None:
                    managed_verification.close()

    prefix = settings.web_prefix
    application = FastAPI(
        title='微元 1.0 服务端', lifespan=lifespan,
        docs_url=f'{prefix}/docs', redoc_url=f'{prefix}/redoc',
        openapi_url=f'{prefix}/openapi.json',
        swagger_ui_oauth2_redirect_url=f'{prefix}/docs/oauth2-redirect',
    )
    application.state.settings = settings
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=False,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    application.state.sessions = sessions
    application.state.chat_provider = chat_provider
    application.state.agent_tools = chat.builtin_tools()
    application.state.customs_configured = bool(settings.upkuajing_api_key or customs is not None)
    application.state.verification_provider = provider or managed_verification
    if application.state.verification_provider is None and settings.environment == 'test':
        application.state.verification_provider = FixedCodeVerificationProvider()
    application.include_router(auth.router)
    application.include_router(workspaces.router)
    application.include_router(chat.router)
    application.include_router(discovery_planning.router)
    application.include_router(discovery_review.router)
    application.include_router(directory.router)
    application.include_router(company.router)
    application.include_router(company_intake.router)
    application.include_router(customers.router)
    application.include_router(crm.router)
    application.include_router(crm_workbench.router)
    application.include_router(schedules.router)
    application.include_router(sources.router)
    application.include_router(mail_delivery.router)
    application.include_router(billing.router)
    application.include_router(payments.router)

    product_assets = Path(__file__).with_name('web_ui')
    application.mount(f'{prefix}/app-assets', StaticFiles(directory=product_assets), name='app-assets')

    @application.get(f'{prefix}/app', include_in_schema=False)
    def product_console(legacy: bool = False):
        html = (product_assets / ('legacy.html' if legacy else 'index.html')).read_text(encoding='utf-8')
        nonce = token_urlsafe(24)
        ui_files = sorted([*product_assets.glob('*.js'), *product_assets.glob('react/*.js'),
                           *product_assets.glob('react/*.css')])
        version = sha256(b''.join(path.read_bytes() for path in ui_files)).hexdigest()[:16]
        html = html.replace('__ASSET_PREFIX__', prefix).replace('__STYLE_NONCE__', nonce).replace('__UI_VERSION__', version)
        return HTMLResponse(html, headers={
            'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; "
                f"style-src 'self' 'nonce-{nonce}'; style-src-attr 'unsafe-inline'; "
                "connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        })

    @application.get(f'{prefix}/health')
    def health():
        return {
            'status': 'ok',
            'service': 'voken-dataservice',
            'database_configured': sessions is not None,
            'deepseek_configured': bool(settings.llm_api_key or deepseek is not None),
            'model_mode': 'injected' if deepseek is not None else 'live' if settings.llm_api_key else 'unconfigured',
            'search_mode': 'injected' if deepseek is not None else 'live' if settings.tools_api_key else 'unconfigured',
            'smtp_mode': ('local_capture' if settings.smtp_mode == 'test_plain' else 'live') if settings.smtp_enabled else 'unconfigured',
            'customs_configured': application.state.customs_configured and settings.upkuajing_daily_call_limit > 0,
            'self_registration_available': application.state.verification_provider is not None,
            'verification_mode':('test_fixed' if isinstance(application.state.verification_provider,FixedCodeVerificationProvider)
                else 'aliyun' if managed_verification is not None else 'external' if provider is not None else 'unavailable'),
        }

    if settings.environment == 'test':
        assets = Path(__file__).with_name('test_ui')
        application.mount(f'{prefix}/test-assets', StaticFiles(directory=assets), name='test-assets')

        @application.get(f'{prefix}/', include_in_schema=False)
        def test_console():
            html = (assets / 'index.html').read_text(encoding='utf-8')
            for filename, placeholder in (('console.js', '__CONSOLE_VERSION__'), ('styles.css', '__STYLES_VERSION__')):
                version = sha256((assets / filename).read_bytes()).hexdigest()[:16]
                html = html.replace(placeholder, version)
            return HTMLResponse(html, headers={'Cache-Control': 'no-store'})
    else:
        @application.get(f'{prefix}/', include_in_schema=False)
        def product_index():
            return RedirectResponse(url=f'{prefix}/app')

    install_openapi(application, routers=(auth.router, workspaces.router, chat.router))
    return application


app = create_app()
