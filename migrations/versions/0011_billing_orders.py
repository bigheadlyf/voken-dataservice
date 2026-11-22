"""Server-priced orders and finite, manually claimed membership entitlements."""
from alembic import op
import sqlalchemy as sa
revision='0011'
down_revision='0010'
branch_labels=None
depends_on=None


def upgrade():
    op.create_table('billing_orders',
        sa.Column('id',sa.String(32),primary_key=True),
        sa.Column('workspace_id',sa.String(32),sa.ForeignKey('workspaces.id'),nullable=False),
        sa.Column('idempotency_key',sa.String(64),nullable=False),
        sa.Column('request_hash',sa.String(64),nullable=False),
        sa.Column('plan_id',sa.String(40),nullable=False),
        sa.Column('quote',sa.JSON(),nullable=False),
        sa.Column('total_fen',sa.Integer(),nullable=False),
        sa.Column('status',sa.String(20),nullable=False),
        sa.Column('receipt_hash',sa.String(64)),
        sa.Column('created_at',sa.DateTime(),nullable=False),
        sa.Column('expires_at',sa.DateTime(),nullable=False),
        sa.Column('paid_at',sa.DateTime()),
        sa.UniqueConstraint('workspace_id','idempotency_key'),sa.UniqueConstraint('receipt_hash'))
    op.create_index('ix_billing_orders_workspace_id','billing_orders',['workspace_id'])
    op.create_table('memberships',
        sa.Column('id',sa.String(32),primary_key=True),
        sa.Column('workspace_id',sa.String(32),sa.ForeignKey('workspaces.id'),nullable=False),
        sa.Column('order_id',sa.String(32),sa.ForeignKey('billing_orders.id'),unique=True,nullable=False),
        sa.Column('plan_id',sa.String(40),nullable=False),
        sa.Column('starts_at',sa.DateTime(),nullable=False),sa.Column('ends_at',sa.DateTime(),nullable=False),
        sa.Column('monthly_points',sa.Integer(),nullable=False),sa.Column('periods',sa.Integer(),nullable=False))
    op.create_index('ix_memberships_workspace_id','memberships',['workspace_id'])


def downgrade():
    op.drop_table('memberships')
    op.drop_table('billing_orders')
