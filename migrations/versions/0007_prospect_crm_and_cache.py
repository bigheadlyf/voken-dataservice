"""Durable sales pipeline and workspace-scoped public source cache."""
from alembic import op
import sqlalchemy as sa

revision = '0007'
down_revision = '0006'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('crm_prospects',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('identity_key', sa.String(64), nullable=False),
        sa.Column('name', sa.String(240), nullable=False),
        sa.Column('location', sa.String(350), nullable=False),
        sa.Column('website', sa.String(500), nullable=False),
        sa.Column('contact', sa.String(500), nullable=False),
        sa.Column('stage', sa.String(24), nullable=False),
        sa.Column('tags', sa.JSON(), nullable=False),
        sa.Column('evidence', sa.JSON(), nullable=False),
        sa.Column('do_not_contact', sa.Boolean(), nullable=False),
        sa.Column('next_followup_at', sa.DateTime()),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('workspace_id', 'identity_key'))
    op.create_index('ix_crm_prospects_workspace_stage', 'crm_prospects', ['workspace_id', 'stage'])
    op.create_table('crm_activities',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('prospect_id', sa.String(32), sa.ForeignKey('crm_prospects.id'), nullable=False),
        sa.Column('kind', sa.String(24), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False))
    op.create_index('ix_crm_activities_prospect_id', 'crm_activities', ['prospect_id'])
    op.create_table('public_source_cache',
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), primary_key=True),
        sa.Column('cache_key', sa.String(64), primary_key=True),
        sa.Column('result', sa.JSON(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False))
    op.create_index('ix_public_source_cache_expires_at', 'public_source_cache', ['expires_at'])


def downgrade():
    op.drop_table('public_source_cache')
    op.drop_table('crm_activities')
    op.drop_table('crm_prospects')
