"""Persist workspace assistant conversations and user-confirmed operations."""
from alembic import op
import sqlalchemy as sa

revision = '0016'
down_revision = '0015'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'assistant_turns',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('conversation_id', sa.String(32), nullable=False),
        sa.Column('idempotency_key', sa.String(64), nullable=False),
        sa.Column('request_hash', sa.String(64), nullable=False),
        sa.Column('status', sa.String(16), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('workspace_id', 'idempotency_key'),
    )
    op.create_index('ix_assistant_turns_conversation', 'assistant_turns',
                    ['workspace_id', 'conversation_id', 'created_at', 'id'])


def downgrade():
    op.drop_table('assistant_turns')
