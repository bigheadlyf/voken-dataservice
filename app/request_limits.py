"""Small persisted rate gates; no phone numbers or document content in buckets."""
from datetime import timedelta
from hashlib import sha256
from math import ceil
from fastapi import HTTPException
from sqlalchemy import delete, func, select
from app.db import RequestAttempt, utcnow, write_transaction


def consume(sessions, category, identity, count, window_seconds):
    bucket=category+':'+sha256(identity.encode()).hexdigest()
    limited=False
    with write_transaction(sessions) as session:
        now=utcnow()
        # Bound retention for all categories, including attempts that never lead to an account.
        session.execute(delete(RequestAttempt).where(RequestAttempt.created_at < now-timedelta(days=2)))
        used=session.scalar(select(func.count()).select_from(RequestAttempt).where(
            RequestAttempt.bucket==bucket,RequestAttempt.created_at>=now-timedelta(seconds=window_seconds)))
        limited=used>=count
        if limited:
            first=session.scalar(select(func.min(RequestAttempt.created_at)).where(
                RequestAttempt.bucket==bucket,RequestAttempt.created_at>=now-timedelta(seconds=window_seconds)))
            retry_after=max(1,ceil((first+timedelta(seconds=window_seconds)-now).total_seconds()))
        if not limited:session.add(RequestAttempt(bucket=bucket))
    if limited:
        raise HTTPException(429,'request_rate_limit',headers={'Retry-After':str(retry_after)})
