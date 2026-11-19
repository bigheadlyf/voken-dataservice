"""Workspace company profiles, shared memories and document proposals."""
from alembic import op
import sqlalchemy as sa

revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('company_profiles',
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), primary_key=True),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False))
    op.create_table('company_memories',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('key', sa.String(80), nullable=False),
        sa.Column('title', sa.String(120), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('verification_status', sa.String(16), nullable=False),
        sa.Column('source', sa.JSON(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('workspace_id', 'key'))
    op.create_index('ix_company_memories_workspace_id', 'company_memories', ['workspace_id'])
    op.create_table('company_document_analyses',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('proposal', sa.JSON(), nullable=False),
        sa.Column('applied_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), nullable=False))
    op.create_index('ix_company_document_analyses_workspace_id', 'company_document_analyses', ['workspace_id'])


def downgrade():
    op.drop_table('company_document_analyses')
    op.drop_table('company_memories')
    op.drop_table('company_profiles')
