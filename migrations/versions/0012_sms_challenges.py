"""Persist short-lived, server-keyed SMS code hashes; never store codes or SMS payloads."""
from alembic import op
import sqlalchemy as sa
revision='0012'
down_revision='0011'
branch_labels=None
depends_on=None


def upgrade():
    op.create_table('sms_challenges',
        sa.Column('id',sa.String(64),primary_key=True),
        sa.Column('phone_hash',sa.String(64),nullable=False),
        sa.Column('code_hash',sa.String(64),nullable=False),
        sa.Column('expires_at',sa.DateTime(),nullable=False),
        sa.Column('attempts_left',sa.Integer(),nullable=False))
    op.create_index('ix_sms_challenges_phone_hash','sms_challenges',['phone_hash'])
    op.create_index('ix_sms_challenges_expires_at','sms_challenges',['expires_at'])


def downgrade():op.drop_table('sms_challenges')
