"""Add cedula field to auth_users

Revision ID: add_cedula_field
Revises: 
Create Date: 2025-12-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_cedula_field'
down_revision = 'f57340d194e3'  # Última migración conocida
branch_labels = None
depends_on = None


def upgrade():
    # Agregar columna cedula a auth_users
    op.add_column('auth_users', 
        sa.Column('cedula', sa.String(length=20), nullable=True)
    )
    op.create_index(op.f('ix_auth_users_cedula'), 'auth_users', ['cedula'], unique=True)


def downgrade():
    # Eliminar índice y columna
    op.drop_index(op.f('ix_auth_users_cedula'), table_name='auth_users')
    op.drop_column('auth_users', 'cedula')
