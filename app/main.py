import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from app import auth, chat, company, customers, workspaces
from app.config import Settings
from app.db import AgentTurn, create_session_factory, write_transaction
from sqlalchemy import update
from app.deepseek import DeepSeek
from app.openapi import install_openapi
from app.upkuajing import Upkuajing
from app.verification import FixedCodeVerificationProvider, VerificationProvider
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

    @asynccontextmanager
    async def lifespan(_application: FastAPI):
        worker_task = None
        stop = asyncio.Event()
        upstream = chat_provider
        trade_provider = customs
        try:
            if sessions is not None:
                with write_transaction(sessions) as session:
                    session.execute(update(AgentTurn).where(AgentTurn.status == 'running').values(
                        status='failed', error='agent_chat_interrupted'))
            if sessions is not None and run_worker:
                upstream = upstream or DeepSeek(settings)
                if trade_provider is None and settings.upkuajing_api_key:
                    trade_provider = Upkuajing(settings.upkuajing_api_key)
                worker = Worker(sessions, settings, upstream, trade_provider)
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
                if sessions is not None:
                    sessions.kw['bind'].dispose()

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
    application.state.verification_provider = provider
    if provider is None and settings.environment == 'test':
        application.state.verification_provider = FixedCodeVerificationProvider()
    application.include_router(auth.router)
    application.include_router(workspaces.router)
    application.include_router(chat.router)
    application.include_router(company.router)
    application.include_router(customers.router)

    @application.get(f'{prefix}/health')
    def health():
        return {
            'status': 'ok',
            'service': 'voken-dataservice',
            'database_configured': sessions is not None,
            'deepseek_configured': bool(settings.llm_api_key or deepseek is not None),
            'customs_configured': application.state.customs_configured and settings.upkuajing_daily_call_limit > 0,
        }

    if settings.environment == 'test':
        assets = Path(__file__).with_name('test_ui')
        application.mount(f'{prefix}/test-assets', StaticFiles(directory=assets), name='test-assets')

        @application.get(f'{prefix}/', include_in_schema=False)
        def test_console():
            return FileResponse(assets / 'index.html', headers={'Cache-Control': 'no-store'})
    else:
        @application.get(f'{prefix}/', include_in_schema=False)
        def documentation_index():
            return RedirectResponse(url=f'{prefix}/docs')

    install_openapi(application, routers=(auth.router, workspaces.router, chat.router))
    return application


app = create_app()
