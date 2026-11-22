"""Bounded recurring public discovery, executed by the existing single worker."""
from alembic import op
import sqlalchemy as sa

revision = '0008'
down_revision = '0007'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('agent_schedules',
        sa.Column('agent_id', sa.String(32), primary_key=True),
        sa.Column('workspace_id', sa.String(32), sa.ForeignKey('workspaces.id'), nullable=False),
        sa.Column('interval_days', sa.Integer(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False),
        sa.Column('next_run_at', sa.DateTime(), nullable=False),
        sa.Column('remaining_runs', sa.Integer(), nullable=False),
        sa.Column('last_job_id', sa.String(32)),
        sa.Column('last_error', sa.String(64)),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id', 'agent_id'], ['agents.workspace_id', 'agents.id']))
    op.create_index('ix_agent_schedules_workspace_id', 'agent_schedules', ['workspace_id'])
    op.create_index('ix_agent_schedules_next_run_at', 'agent_schedules', ['next_run_at'])


def downgrade():
    op.drop_table('agent_schedules')
