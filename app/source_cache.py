"""Bounded, tenant-scoped cache for public data only; never caches models or paid data."""
from copy import deepcopy
from datetime import timedelta
from hashlib import sha256
import json

from sqlalchemy import delete, func, select

from app.db import PublicSourceCache, utcnow, write_transaction


def cached_public_call(sessions, workspace, ttl, endpoint, invoke, args):
    if endpoint not in ('search', 'fetch') and not endpoint.startswith('open_'):
        return invoke(*args)
    if not ttl:
        return {**invoke(*args), 'cache_hit': False, 'retrieved_at': utcnow().isoformat() + 'Z'}
    key = sha256(json.dumps([endpoint, args], ensure_ascii=True, sort_keys=True).encode()).hexdigest()
    with sessions() as session:
        entry = session.get(PublicSourceCache, (workspace, key))
        if entry and entry.expires_at > utcnow():
            return {**deepcopy(entry.result), 'billable': False, 'cache_hit': True,
                    'cache_expires_at': entry.expires_at.isoformat() + 'Z'}
    result = {**invoke(*args), 'retrieved_at': utcnow().isoformat() + 'Z'}
    # Empty/failing sources must not conceal an upstream recovery for the whole TTL.
    if not result.get('hits') and not result.get('content') and not result.get('records'):
        return result
    with write_transaction(sessions) as session:
        session.execute(delete(PublicSourceCache).where(PublicSourceCache.workspace_id == workspace,
                                                       PublicSourceCache.expires_at <= utcnow()))
        entry = session.get(PublicSourceCache, (workspace, key))
        if entry is None:
            count = session.scalar(select(func.count()).select_from(PublicSourceCache).where(
                PublicSourceCache.workspace_id == workspace))
            if count >= 1000:
                oldest = session.scalar(select(PublicSourceCache).where(
                    PublicSourceCache.workspace_id == workspace).order_by(PublicSourceCache.expires_at).limit(1))
                session.delete(oldest)
            entry = PublicSourceCache(workspace_id=workspace, cache_key=key)
            session.add(entry)
        entry.result = result
        entry.expires_at = utcnow() + timedelta(seconds=ttl)
    return {**result, 'cache_hit': False}
