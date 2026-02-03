"""Add emergency contact

Revision ID: 98794c6b1c28
Revises: 613ccae55690
Create Date: 2026-02-02 16:40:37.184784
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '98794c6b1c28'
down_revision: Union[str, Sequence[str], None] = '613ccae55690'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'historial_medico',
        sa.Column('contacto_emergencia_nombre', sa.String(), nullable=True)
    )
    op.add_column(
        'historial_medico',
        sa.Column('contacto_emergencia_telefono', sa.String(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('historial_medico', 'contacto_emergencia_telefono')
    op.drop_column('historial_medico', 'contacto_emergencia_nombre')
