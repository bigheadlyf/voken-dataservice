"""Synchronous LangGraph checkpointer backed by the existing SQLAlchemy database.

The graph state contains only JSON data; no pickle or arbitrary class loading.
This application invokes the graph synchronously from FastAPI's thread pool.
"""
from langgraph.checkpoint.base import BaseCheckpointSaver, CheckpointTuple, WRITES_IDX_MAP
from sqlalchemy import delete, select

from app.db import GraphCheckpoint, GraphWrite, write_transaction


def checkpoint_config(thread, namespace, checkpoint_id):
    return {'configurable': {'thread_id': thread, 'checkpoint_ns': namespace, 'checkpoint_id': checkpoint_id}}


class SQLAlchemySaver(BaseCheckpointSaver):
    def __init__(self, sessions):
        super().__init__()
        self.sessions = sessions

    def get_tuple(self, config):
        settings = config['configurable']
        thread, namespace = settings['thread_id'], settings.get('checkpoint_ns', '')
        with self.sessions() as session:
            query = select(GraphCheckpoint).where(GraphCheckpoint.thread_id == thread,
                                                   GraphCheckpoint.namespace == namespace)
            if settings.get('checkpoint_id'):
                query = query.where(GraphCheckpoint.checkpoint_id == settings['checkpoint_id'])
            row = session.scalar(query.order_by(GraphCheckpoint.checkpoint_id.desc()).limit(1))
            if row is None:
                return None
            writes = session.scalars(select(GraphWrite).where(GraphWrite.thread_id == thread,
                GraphWrite.namespace == namespace, GraphWrite.checkpoint_id == row.checkpoint_id,
            ).order_by(GraphWrite.task_id, GraphWrite.index))
            return CheckpointTuple(
                config=checkpoint_config(thread, namespace, row.checkpoint_id),
                checkpoint=row.checkpoint, metadata=row.details,
                parent_config=checkpoint_config(thread, namespace, row.parent_id) if row.parent_id else None,
                pending_writes=[(item.task_id, item.channel, item.value) for item in writes])

    def put(self, config, checkpoint, metadata, new_versions):
        settings = config['configurable']
        thread, namespace = settings['thread_id'], settings.get('checkpoint_ns', '')
        with write_transaction(self.sessions) as session:
            session.merge(GraphCheckpoint(thread_id=thread, namespace=namespace,
                checkpoint_id=checkpoint['id'], parent_id=settings.get('checkpoint_id'),
                checkpoint=checkpoint, details=metadata))
        return checkpoint_config(thread, namespace, checkpoint['id'])

    def put_writes(self, config, writes, task_id, task_path=''):
        settings = config['configurable']
        with write_transaction(self.sessions) as session:
            for index, (channel, value) in enumerate(writes):
                position = WRITES_IDX_MAP.get(channel, index)
                key = (settings['thread_id'], settings.get('checkpoint_ns', ''),
                       settings['checkpoint_id'], task_id, position)
                if position >= 0 and session.get(GraphWrite, key) is not None:
                    continue
                session.merge(GraphWrite(thread_id=key[0], namespace=key[1], checkpoint_id=key[2],
                    task_id=task_id, index=position, channel=channel, value=value))

    def list(self, config, *, filter=None, before=None, limit=None):
        with self.sessions() as session:
            query = select(GraphCheckpoint)
            if config:
                settings = config['configurable']
                query = query.where(GraphCheckpoint.thread_id == settings['thread_id'])
                if 'checkpoint_ns' in settings:
                    query = query.where(GraphCheckpoint.namespace == settings['checkpoint_ns'])
                if settings.get('checkpoint_id'):
                    query = query.where(GraphCheckpoint.checkpoint_id == settings['checkpoint_id'])
            if before:
                query = query.where(GraphCheckpoint.checkpoint_id < before['configurable']['checkpoint_id'])
            rows = list(session.scalars(query.order_by(GraphCheckpoint.checkpoint_id.desc())))
        remaining = limit
        for row in rows:
            if filter and any(row.details.get(k) != v for k, v in filter.items()):
                continue
            if remaining is not None and remaining <= 0:
                break
            yield self.get_tuple(checkpoint_config(row.thread_id, row.namespace, row.checkpoint_id))
            if remaining is not None:
                remaining -= 1

    def delete_thread(self, thread_id):
        with write_transaction(self.sessions) as session:
            session.execute(delete(GraphWrite).where(GraphWrite.thread_id == thread_id))
            session.execute(delete(GraphCheckpoint).where(GraphCheckpoint.thread_id == thread_id))
