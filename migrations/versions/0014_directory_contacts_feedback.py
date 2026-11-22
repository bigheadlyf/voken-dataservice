"""Unified directory request bindings, saved contact groups and discovery feedback."""
from alembic import op
import sqlalchemy as sa

revision = '0014'
down_revision = '0013'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('directory_requests',
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), primary_key=True),
        sa.Column('idempotency_key', sa.String(64), primary_key=True),
        sa.Column('request_hash', sa.String(64), nullable=False),
        sa.Column('job_id', sa.String(32), sa.ForeignKey('jobs.id'), nullable=False))
    op.create_table('crm_contacts',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('prospect_id', sa.String(32), sa.ForeignKey('crm_prospects.id'), nullable=False),
        sa.Column('namespace', sa.String(32), nullable=False),
        sa.Column('subject_id', sa.String(160), nullable=False),
        sa.Column('name', sa.String(240), nullable=False),
        sa.Column('company_name', sa.String(240), nullable=False),
        sa.Column('titles', sa.JSON(), nullable=False),
        sa.Column('channels', sa.JSON(), nullable=False),
        sa.Column('source_job_id', sa.String(32), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('observed_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('prospect_id', 'namespace', 'subject_id'))
    op.create_index('ix_crm_contacts_workspace_id', 'crm_contacts', ['workspace_id'])
    op.create_index('ix_crm_contacts_prospect_id', 'crm_contacts', ['prospect_id'])
    op.create_table('discovery_feedback',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('profile_key', sa.String(64), nullable=False),
        sa.Column('entity_key', sa.String(64), nullable=False),
        sa.Column('job_id', sa.String(32), sa.ForeignKey('jobs.id'), nullable=False),
        sa.Column('lead_index', sa.Integer(), nullable=False),
        sa.Column('verdict', sa.String(16), nullable=False),
        sa.Column('reason', sa.String(500), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('workspace_id', 'profile_key', 'entity_key'))
    op.create_index('ix_discovery_feedback_workspace_id', 'discovery_feedback', ['workspace_id'])


def downgrade():
    op.drop_table('discovery_feedback')
    op.drop_table('crm_contacts')
    op.drop_table('directory_requests')
