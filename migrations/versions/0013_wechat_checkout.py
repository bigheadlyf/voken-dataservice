"""Separate merchant checkout state from immutable price/entitlement quote."""
from alembic import op
import sqlalchemy as sa
revision='0013'
down_revision='0012'
branch_labels=None
depends_on=None


def upgrade():op.add_column('billing_orders',sa.Column('payment',sa.JSON(),nullable=True))
def downgrade():op.drop_column('billing_orders','payment')
