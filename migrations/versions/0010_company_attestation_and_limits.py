"""Version-bound company confirmation and durable request limits."""
from alembic import op
import sqlalchemy as sa

revision='0010'
down_revision='0009'
branch_labels=None
depends_on=None


def upgrade():
    op.create_table('company_attestations',
        sa.Column('workspace_id',sa.String(32),sa.ForeignKey('workspaces.id'),primary_key=True),
        sa.Column('profile_version',sa.Integer(),nullable=False),
        sa.Column('statement',sa.String(1000),nullable=False),
        sa.Column('confirmed_at',sa.DateTime(),nullable=False))
    op.create_table('request_attempts',
        sa.Column('id',sa.String(32),primary_key=True),
        sa.Column('bucket',sa.String(80),nullable=False),
        sa.Column('created_at',sa.DateTime(),nullable=False))
    op.create_index('ix_request_attempts_bucket_created','request_attempts',['bucket','created_at'])


def downgrade():
    op.drop_table('request_attempts')
    op.drop_table('company_attestations')
