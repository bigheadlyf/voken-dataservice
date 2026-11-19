"""Persist digital employee conversations and idempotent turns."""
from alembic import op
import sqlalchemy as sa

revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('agent_conversations',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), nullable=False),
        sa.Column('agent_id', sa.String(32), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id', 'agent_id'], ['agents.workspace_id', 'agents.id']))
    op.create_index('ix_agent_conversations_workspace_id', 'agent_conversations', ['workspace_id'])
    op.create_table('agent_turns',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('conversation_id', sa.String(32), sa.ForeignKey('agent_conversations.id'), nullable=False),
        sa.Column('idempotency_key', sa.String(64), nullable=False),
        sa.Column('request_hash', sa.String(64), nullable=False),
        sa.Column('status', sa.String(16), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('response', sa.Text()),
        sa.Column('tool_calls', sa.JSON(), nullable=False),
        sa.Column('error', sa.String(64)),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('workspace_id', 'idempotency_key'))
    op.create_index('ix_agent_turns_conversation_id', 'agent_turns', ['conversation_id'])
    op.create_table('agent_memories',
        sa.Column('workspace_id', sa.String(32), primary_key=True),
        sa.Column('agent_id', sa.String(32), primary_key=True),
        sa.Column('key', sa.String(80), primary_key=True),
        sa.Column('value', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id', 'agent_id'], ['agents.workspace_id', 'agents.id']))
    op.create_table('agent_graph_checkpoints',
        sa.Column('thread_id', sa.String(100), primary_key=True),
        sa.Column('namespace', sa.String(128), primary_key=True),
        sa.Column('checkpoint_id', sa.String(64), primary_key=True),
        sa.Column('parent_id', sa.String(64)),
        sa.Column('checkpoint', sa.JSON(), nullable=False),
        sa.Column('details', sa.JSON(), nullable=False))
    op.create_table('agent_graph_writes',
        sa.Column('thread_id', sa.String(100), primary_key=True),
        sa.Column('namespace', sa.String(128), primary_key=True),
        sa.Column('checkpoint_id', sa.String(64), primary_key=True),
        sa.Column('task_id', sa.String(64), primary_key=True),
        sa.Column('index', sa.Integer(), primary_key=True),
        sa.Column('channel', sa.String(128), nullable=False),
        sa.Column('value', sa.JSON(), nullable=False))


def downgrade():
    op.drop_table('agent_graph_writes')
    op.drop_table('agent_graph_checkpoints')
    op.drop_table('agent_memories')
    op.drop_table('agent_turns')
    op.drop_table('agent_conversations')
