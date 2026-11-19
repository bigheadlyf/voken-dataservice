from contextlib import contextmanager
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    JSON, BigInteger, Boolean, ForeignKey, ForeignKeyConstraint, Index, Integer,
    String, Text, UniqueConstraint, create_engine, event, text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


def new_id() -> str:
    return uuid4().hex


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    phone: Mapped[str] = mapped_column(String(14), unique=True)
    password_hash: Mapped[str] = mapped_column(String(161))
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class Workspace(Base):
    __tablename__ = 'workspaces'
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(ForeignKey('users.id'), unique=True)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class CompanyProfile(Base):
    __tablename__ = 'company_profiles'
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    version: Mapped[int] = mapped_column(Integer, default=1)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow)


class CompanyMemory(Base):
    __tablename__ = 'company_memories'
    __table_args__ = (UniqueConstraint('workspace_id', 'key'),)
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    key: Mapped[str] = mapped_column(String(80))
    title: Mapped[str] = mapped_column(String(120))
    content: Mapped[str] = mapped_column(Text)
    verification_status: Mapped[str] = mapped_column(String(16), default='unverified')
    source: Mapped[dict] = mapped_column(JSON, default=dict)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow)


class CompanyDocumentAnalysis(Base):
    __tablename__ = 'company_document_analyses'
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    proposal: Mapped[dict] = mapped_column(JSON)
    applied_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class AccessSession(Base):
    __tablename__ = 'access_sessions'
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    expires_at: Mapped[datetime] = mapped_column(index=True)


class Wallet(Base):
    __tablename__ = 'point_wallets'
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), primary_key=True)
    available: Mapped[int] = mapped_column(BigInteger)
    reserved: Mapped[int] = mapped_column(BigInteger, default=0)


class PointEntry(Base):
    __tablename__ = 'point_ledger'
    __table_args__ = (UniqueConstraint('workspace_id', 'reference', 'kind'),)
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    reference: Mapped[str] = mapped_column(String(32))
    kind: Mapped[str] = mapped_column(String(20))
    points: Mapped[int] = mapped_column(BigInteger)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class Agent(Base):
    __tablename__ = 'agents'
    __table_args__ = (UniqueConstraint('workspace_id', 'id'),)
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    status: Mapped[str] = mapped_column(String(16), default='paused')
    config_version: Mapped[int] = mapped_column(Integer, default=1)
    deleted_at: Mapped[datetime | None]


class AgentVersion(Base):
    __tablename__ = 'agent_versions'
    __table_args__ = (ForeignKeyConstraint(['workspace_id', 'agent_id'], ['agents.workspace_id', 'agents.id']),)
    workspace_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    config: Mapped[dict] = mapped_column(JSON)


class AgentConversation(Base):
    __tablename__ = 'agent_conversations'
    __table_args__ = (ForeignKeyConstraint(['workspace_id', 'agent_id'], ['agents.workspace_id', 'agents.id']),)
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(String(32), index=True)
    agent_id: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class AgentTurn(Base):
    __tablename__ = 'agent_turns'
    __table_args__ = (UniqueConstraint('workspace_id', 'idempotency_key'),)
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'))
    conversation_id: Mapped[str] = mapped_column(ForeignKey('agent_conversations.id'), index=True)
    idempotency_key: Mapped[str] = mapped_column(String(64))
    request_hash: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(16), default='running')
    content: Mapped[str] = mapped_column(Text)
    response: Mapped[str | None] = mapped_column(Text)
    tool_calls: Mapped[list] = mapped_column(JSON, default=list)
    error: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class AgentMemory(Base):
    __tablename__ = 'agent_memories'
    __table_args__ = (ForeignKeyConstraint(['workspace_id', 'agent_id'], ['agents.workspace_id', 'agents.id']),)
    workspace_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[str] = mapped_column(Text)


class GraphCheckpoint(Base):
    __tablename__ = 'agent_graph_checkpoints'
    thread_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    namespace: Mapped[str] = mapped_column(String(128), primary_key=True)
    checkpoint_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    parent_id: Mapped[str | None] = mapped_column(String(64))
    checkpoint: Mapped[dict] = mapped_column(JSON)
    details: Mapped[dict] = mapped_column(JSON)


class GraphWrite(Base):
    __tablename__ = 'agent_graph_writes'
    thread_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    namespace: Mapped[str] = mapped_column(String(128), primary_key=True)
    checkpoint_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    task_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    index: Mapped[int] = mapped_column(Integer, primary_key=True)
    channel: Mapped[str] = mapped_column(String(128))
    value: Mapped[dict | list | str | int | None] = mapped_column(JSON, nullable=False)


class Job(Base):
    __tablename__ = 'jobs'
    __table_args__ = (
        ForeignKeyConstraint(
            ['workspace_id', 'agent_id', 'config_version'],
            ['agent_versions.workspace_id', 'agent_versions.agent_id', 'agent_versions.version'],
        ),
        UniqueConstraint('workspace_id', 'idempotency_key'),
        Index('ix_jobs_pending', 'status', 'created_at', 'id'),
    )
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    agent_id: Mapped[str | None] = mapped_column(String(32))
    config_version: Mapped[int | None]
    operation: Mapped[str] = mapped_column(String(24))
    status: Mapped[str] = mapped_column(String(16), default='queued')
    payload: Mapped[dict] = mapped_column(JSON)
    result: Mapped[dict | None] = mapped_column(JSON(none_as_null=True))
    point_cost: Mapped[int] = mapped_column(BigInteger)
    points_charged: Mapped[int] = mapped_column(BigInteger, default=0)
    cancel_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    idempotency_key: Mapped[str | None] = mapped_column(String(64))
    request_hash: Mapped[str] = mapped_column(String(64))
    error: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
    finished_at: Mapped[datetime | None]


class ProviderCall(Base):
    __tablename__ = 'provider_calls'
    __table_args__ = (UniqueConstraint('job_id', 'step'), Index('ix_provider_calls_endpoint_started_at', 'endpoint', 'started_at'))
    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    job_id: Mapped[str] = mapped_column(ForeignKey('jobs.id'), index=True)
    step: Mapped[str] = mapped_column(String(80))
    endpoint: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(24))
    error: Mapped[str | None] = mapped_column(String(64))
    result: Mapped[dict | None] = mapped_column(JSON(none_as_null=True))
    http_request: Mapped[dict | None] = mapped_column(JSON(none_as_null=True))
    http_response: Mapped[dict | None] = mapped_column(JSON(none_as_null=True))
    estimated_milli_cny: Mapped[int | None] = mapped_column(Integer)
    started_at: Mapped[datetime | None] = mapped_column(default=utcnow)


def create_session_factory(url: str):
    options = {'isolation_level': 'READ COMMITTED'} if url.startswith('mysql') else {}
    engine = create_engine(url, pool_pre_ping=True, **options)
    if engine.dialect.name == 'sqlite':
        @event.listens_for(engine, 'connect')
        def enable_foreign_keys(connection, _record):
            connection.execute('PRAGMA foreign_keys = ON')

    return sessionmaker(engine, expire_on_commit=False)


@contextmanager
def write_transaction(sessions):
    with sessions.begin() as session:
        if session.bind.dialect.name == 'sqlite':
            session.execute(text('BEGIN IMMEDIATE'))
        yield session
