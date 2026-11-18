import re
from datetime import timedelta
from hashlib import scrypt, sha256
from hmac import compare_digest
from secrets import token_bytes, token_urlsafe

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field, SecretStr
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db import AccessSession, PointEntry, User, Wallet, Workspace, utcnow, write_transaction
from app.verification import IssuedChallenge, VerificationProvider


router = APIRouter(prefix='/api/v1/auth', tags=['auth'])
bearer = HTTPBearer(auto_error=False)
REGISTRATION_POINTS = 1000


class CodeRequest(BaseModel):
    phone: str


class CodeVerification(CodeRequest):
    challenge_id: str = Field(min_length=1, max_length=128)
    code: str = Field(min_length=1, max_length=32)


class Registration(CodeVerification):
    password: SecretStr = Field(min_length=8, max_length=128)


class Login(CodeRequest):
    password: SecretStr = Field(min_length=8, max_length=128)


def normalize_phone(phone: str) -> str:
    phone = phone.strip()
    if not re.fullmatch(r'(?:\+86)?1[3-9][0-9]{9}', phone):
        raise HTTPException(status_code=422, detail='invalid_mainland_china_mobile')
    return phone if phone.startswith('+86') else f'+86{phone}'


def verification_provider(request: Request) -> VerificationProvider:
    provider = request.app.state.verification_provider
    if provider is None:
        raise HTTPException(status_code=503, detail='verification_provider_unavailable')
    return provider


def session_factory(request: Request):
    sessions = request.app.state.sessions
    if sessions is None:
        raise HTTPException(status_code=503, detail='database_not_configured')
    return sessions


def derive_password(password: str, salt: bytes) -> bytes:
    return scrypt(password.encode('utf-8'), salt=salt, n=2**15, r=8, p=1, maxmem=64 * 1024 * 1024)


def hash_password(password: str) -> str:
    salt = token_bytes(16)
    return f'{salt.hex()}:{derive_password(password, salt).hex()}'


def verify_password(password: str, stored: str | None) -> bool:
    salt, digest = stored.split(':') if stored else ('00' * 16, '00' * 64)
    calculated = derive_password(password, bytes.fromhex(salt))
    return compare_digest(calculated, bytes.fromhex(digest)) and stored is not None


def verify_code(provider: VerificationProvider, phone: str, body: CodeVerification) -> None:
    if not provider.verify(phone, body.challenge_id, body.code):
        raise HTTPException(status_code=400, detail='invalid_or_expired_verification_code')


@router.post('/verification-codes', status_code=201)
def request_code(body: CodeRequest, provider: VerificationProvider = Depends(verification_provider)) -> IssuedChallenge:
    return provider.request(normalize_phone(body.phone))


@router.post('/verification-codes/verify')
def verify_code_endpoint(body: CodeVerification, provider: VerificationProvider = Depends(verification_provider)):
    verify_code(provider, normalize_phone(body.phone), body)
    return {'verified': True}


@router.post('/register', status_code=201)
def register(
    body: Registration,
    provider: VerificationProvider = Depends(verification_provider),
    sessions=Depends(session_factory),
):
    phone = normalize_phone(body.phone)
    with sessions() as session:
        if session.scalar(select(User.id).where(User.phone == phone)):
            raise HTTPException(status_code=409, detail='account_already_exists')
    verify_code(provider, phone, body)
    user = User(phone=phone, password_hash=hash_password(body.password.get_secret_value()))

    try:
        with write_transaction(sessions) as session:
            session.add(user)
            session.flush()
            workspace = Workspace(owner_id=user.id)
            session.add(workspace)
            session.flush()
            session.add(Wallet(workspace_id=workspace.id, available=REGISTRATION_POINTS))
            session.add(PointEntry(workspace_id=workspace.id, reference=user.id, kind='grant', points=REGISTRATION_POINTS))
    except IntegrityError:
        with sessions() as session:
            if session.scalar(select(User.id).where(User.phone == phone)):
                raise HTTPException(status_code=409, detail='account_already_exists') from None
        raise
    return {'user_id': user.id, 'workspace_id': workspace.id, 'granted_points': REGISTRATION_POINTS}


def token_digest(token: str) -> str:
    return sha256(token.encode('utf-8')).hexdigest()


@router.post('/login')
def login(body: Login, sessions=Depends(session_factory)):
    phone = normalize_phone(body.phone)
    with sessions() as session:
        user = session.scalar(select(User).where(User.phone == phone))
        stored = user.password_hash if user else None
        if not verify_password(body.password.get_secret_value(), stored):
            raise HTTPException(status_code=401, detail='invalid_credentials')
        workspace_id = session.scalar(select(Workspace.id).where(Workspace.owner_id == user.id))
        user_id = user.id

    token = token_urlsafe(32)
    expires_at = utcnow() + timedelta(hours=12)
    with write_transaction(sessions) as session:
        session.add(AccessSession(token_hash=token_digest(token), user_id=user_id, expires_at=expires_at))
    return {'access_token': token, 'token_type': 'bearer', 'workspace_id': workspace_id, 'expires_in': 43200}


def active_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    sessions=Depends(session_factory),
) -> AccessSession:
    with sessions() as session:
        access = session.get(AccessSession, token_digest(credentials.credentials)) if credentials else None
        if access is None or access.expires_at <= utcnow():
            raise HTTPException(status_code=401, detail='authentication_required', headers={'WWW-Authenticate': 'Bearer'})
        return access


def workspace_access(
    workspace_id: str,
    access: AccessSession = Depends(active_session),
    sessions=Depends(session_factory),
) -> str:
    with sessions() as session:
        workspace = session.get(Workspace, workspace_id)
        if workspace is None or workspace.owner_id != access.user_id:
            raise HTTPException(status_code=404, detail='workspace_not_found')
        return workspace.id


@router.post('/logout', status_code=204)
def logout(access: AccessSession = Depends(active_session), sessions=Depends(session_factory)):
    with write_transaction(sessions) as session:
        stored = session.get(AccessSession, access.token_hash)
        if stored is not None:
            session.delete(stored)
