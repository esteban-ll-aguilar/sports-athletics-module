"""Add competencia and resultado_competencia tables

Revision ID: add_competencia_tables
Revises: update_atleta_model
Create Date: 2025-12-29 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'add_competencia_tables'
down_revision: Union[str, Sequence[str], None] = 'update_atleta_model'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create competencia table
    op.create_table('competencia',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('external_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('nombre', sa.String(length=255), nullable=False),
    sa.Column('descripcion', sa.Text(), nullable=True),
    sa.Column('fecha', sa.Date(), nullable=False),
    sa.Column('lugar', sa.String(length=255), nullable=False),
    sa.Column('estado', sa.Boolean(), nullable=False),
    sa.Column('entrenador_id', sa.Integer(), nullable=False),
    sa.Column('fecha_creacion', sa.DateTime(timezone=True), nullable=False),
    sa.Column('fecha_actualizacion', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['entrenador_id'], ['auth_users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_competencia_external_id'), 'competencia', ['external_id'], unique=True)
    op.create_index(op.f('ix_competencia_id'), 'competencia', ['id'], unique=False)
    op.create_index(op.f('ix_competencia_nombre'), 'competencia', ['nombre'], unique=False)
    op.create_index(op.f('ix_competencia_fecha'), 'competencia', ['fecha'], unique=False)
    op.create_index(op.f('ix_competencia_estado'), 'competencia', ['estado'], unique=False)

    # Create resultado_competencia table
    op.create_table('resultado_competencia',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('external_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('competencia_id', sa.Integer(), nullable=False),
    sa.Column('atleta_id', sa.Integer(), nullable=False),
    sa.Column('prueba_id', sa.Integer(), nullable=False),
    sa.Column('entrenador_id', sa.Integer(), nullable=False),
    sa.Column('resultado', sa.Float(), nullable=False),
    sa.Column('unidad_medida', sa.String(length=50), nullable=False),
    sa.Column('posicion_final', sa.String(length=50), nullable=False),
    sa.Column('puesto_obtenido', sa.Integer(), nullable=True),
    sa.Column('observaciones', sa.Text(), nullable=True),
    sa.Column('estado', sa.Boolean(), nullable=False),
    sa.Column('fecha_registro', sa.Date(), nullable=False),
    sa.Column('fecha_creacion', sa.DateTime(timezone=True), nullable=False),
    sa.Column('fecha_actualizacion', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['atleta_id'], ['atleta.id'], ),
    sa.ForeignKeyConstraint(['competencia_id'], ['competencia.id'], ),
    sa.ForeignKeyConstraint(['entrenador_id'], ['auth_users.id'], ),
    sa.ForeignKeyConstraint(['prueba_id'], ['prueba.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resultado_competencia_external_id'), 'resultado_competencia', ['external_id'], unique=True)
    op.create_index(op.f('ix_resultado_competencia_id'), 'resultado_competencia', ['id'], unique=False)
    op.create_index(op.f('ix_resultado_competencia_competencia_id'), 'resultado_competencia', ['competencia_id'], unique=False)
    op.create_index(op.f('ix_resultado_competencia_atleta_id'), 'resultado_competencia', ['atleta_id'], unique=False)
    op.create_index(op.f('ix_resultado_competencia_entrenador_id'), 'resultado_competencia', ['entrenador_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_resultado_competencia_entrenador_id'), table_name='resultado_competencia')
    op.drop_index(op.f('ix_resultado_competencia_atleta_id'), table_name='resultado_competencia')
    op.drop_index(op.f('ix_resultado_competencia_competencia_id'), table_name='resultado_competencia')
    op.drop_index(op.f('ix_resultado_competencia_id'), table_name='resultado_competencia')
    op.drop_index(op.f('ix_resultado_competencia_external_id'), table_name='resultado_competencia')
    op.drop_table('resultado_competencia')
    
    op.drop_index(op.f('ix_competencia_estado'), table_name='competencia')
    op.drop_index(op.f('ix_competencia_fecha'), table_name='competencia')
    op.drop_index(op.f('ix_competencia_nombre'), table_name='competencia')
    op.drop_index(op.f('ix_competencia_id'), table_name='competencia')
    op.drop_index(op.f('ix_competencia_external_id'), table_name='competencia')
    op.drop_table('competencia')
