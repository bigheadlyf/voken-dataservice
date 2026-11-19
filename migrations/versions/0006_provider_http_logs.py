"""Retain sanitized upstream requests and responses for job diagnostics."""
from alembic import op
import sqlalchemy as sa

revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('provider_calls', sa.Column('http_request', sa.JSON(), nullable=True))
    op.add_column('provider_calls', sa.Column('http_response', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('provider_calls', 'http_response')
    op.drop_column('provider_calls', 'http_request')
