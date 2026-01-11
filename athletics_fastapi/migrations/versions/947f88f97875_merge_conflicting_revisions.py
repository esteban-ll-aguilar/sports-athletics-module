"""merge_conflicting_revisions

Revision ID: 947f88f97875
Revises: add_competencia_tables, e4f134b7006e
Create Date: 2026-01-06 22:21:23.145990

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '947f88f97875'
down_revision: Union[str, Sequence[str], None] = ('add_competencia_tables', 'e4f134b7006e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass