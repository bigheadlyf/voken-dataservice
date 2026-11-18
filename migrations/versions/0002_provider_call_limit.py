"""Store provider call start time for daily limits."""

from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('provider_calls', sa.Column('started_at', sa.DateTime(), nullable=True))
    op.create_index('ix_provider_calls_endpoint_started_at', 'provider_calls', ['endpoint', 'started_at'])


def downgrade():
    op.drop_index('ix_provider_calls_endpoint_started_at', table_name='provider_calls')
    op.drop_column('provider_calls', 'started_at')
