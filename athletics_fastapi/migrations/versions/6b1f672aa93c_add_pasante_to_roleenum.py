"""add_pasante_to_roleenum

Revision ID: 6b1f672aa93c
Revises: 991788a96de1
Create Date: 2026-02-02 23:11:59.300878

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b1f672aa93c'
down_revision: Union[str, Sequence[str], None] = '991788a96de1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("COMMIT")
    op.execute("ALTER TYPE roleenum ADD VALUE 'PASANTE'")


def downgrade() -> None:
    """Downgrade schema."""
    pass