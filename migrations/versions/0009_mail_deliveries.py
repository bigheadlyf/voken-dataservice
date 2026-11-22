"""Human-reviewed mail queue; uncertain deliveries are never automatically retried."""
from alembic import op
import sqlalchemy as sa

revision = '0009'
down_revision = '0008'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('mail_deliveries',
        sa.Column('id',sa.String(32),primary_key=True),
        sa.Column('workspace_id',sa.String(32),sa.ForeignKey('workspaces.id'),nullable=False),
        sa.Column('prospect_id',sa.String(32),sa.ForeignKey('crm_prospects.id'),nullable=False),
        sa.Column('draft_job_id',sa.String(32),sa.ForeignKey('jobs.id'),nullable=False),
        sa.Column('idempotency_key',sa.String(64),nullable=False),
        sa.Column('request_hash',sa.String(64),nullable=False),
        sa.Column('recipient',sa.String(254),nullable=False),
        sa.Column('sender',sa.String(254),nullable=False),
        sa.Column('subject',sa.String(200),nullable=False),
        sa.Column('body',sa.Text(),nullable=False),
        sa.Column('message_id',sa.String(350),nullable=False),
        sa.Column('status',sa.String(16),nullable=False),
        sa.Column('error',sa.String(64)),
        sa.Column('created_at',sa.DateTime(),nullable=False),
        sa.Column('started_at',sa.DateTime()),
        sa.Column('finished_at',sa.DateTime()),
        sa.UniqueConstraint('workspace_id','idempotency_key'),
        sa.UniqueConstraint('workspace_id','draft_job_id'))
    op.create_index('ix_mail_deliveries_workspace_id','mail_deliveries',['workspace_id'])
    op.create_index('ix_mail_deliveries_status_created','mail_deliveries',['status','created_at'])


def downgrade():
    op.drop_table('mail_deliveries')
