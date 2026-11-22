"""Add append-only CRM workbench; no updates/backfills of existing business tables."""
from alembic import op
import sqlalchemy as sa

revision = '0015'
down_revision = '0014'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('crm_workspace_records',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('prospect_id', sa.String(32), sa.ForeignKey('crm_prospects.id')),
        sa.Column('kind', sa.String(32), nullable=False),
        sa.Column('record_key', sa.String(160), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('workspace_id', 'kind', 'record_key'))
    op.create_index('ix_crm_workspace_kind', 'crm_workspace_records', ['workspace_id', 'kind'])
    op.create_index('ix_crm_workspace_records_prospect_id', 'crm_workspace_records', ['prospect_id'])


def downgrade():
    op.drop_table('crm_workspace_records')
