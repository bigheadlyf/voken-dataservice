"""Allow full upstream endpoint identifiers in the call ledger."""

from alembic import op
import sqlalchemy as sa

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('provider_calls') as table:
        table.alter_column('endpoint', existing_type=sa.String(16), type_=sa.String(64), existing_nullable=False)


def downgrade():
    with op.batch_alter_table('provider_calls') as table:
        table.alter_column('endpoint', existing_type=sa.String(64), type_=sa.String(16), existing_nullable=False)
