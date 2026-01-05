"""Update atleta table with external_id, foto_perfil and timestamps

Revision ID: update_atleta_model
Revises: bdb782b9070a
Create Date: 2025-12-29 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'update_atleta_model'
down_revision: Union[str, Sequence[str], None] = 'bdb782b9070a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Agregar external_id a la tabla atleta
    op.add_column('atleta', sa.Column('external_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')))
    op.add_column('atleta', sa.Column('foto_perfil', sa.String(length=500), nullable=True))
    op.add_column('atleta', sa.Column('fecha_creacion', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.add_column('atleta', sa.Column('fecha_actualizacion', sa.DateTime(timezone=True), nullable=True))
    
    # Crear índice único para external_id
    op.create_index('ix_atleta_external_id', 'atleta', ['external_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_atleta_external_id', table_name='atleta')
    op.drop_column('atleta', 'fecha_actualizacion')
    op.drop_column('atleta', 'fecha_creacion')
    op.drop_column('atleta', 'foto_perfil')
    op.drop_column('atleta', 'external_id')
