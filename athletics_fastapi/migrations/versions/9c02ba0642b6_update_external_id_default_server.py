"""Update external ID default server

Revision ID: 9c02ba0642b6
Revises: 74c7f6e8eacc
Create Date: 2026-01-15 09:20:24.957880

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c02ba0642b6'
down_revision: Union[str, Sequence[str], None] = '74c7f6e8eacc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    tables = [
        "atleta",
        "auth_users_sessions",
        "users",
        "baremo",
        "competencia",
        "prueba",
        "registro_prueba_competencia",
        "resultado_competencia",
        "tipo_disciplina",
        "asistencia",
        "entrenamiento",
        "horario",
        "registro_asistencias"
    ]
    
    for table_name in tables:
        op.alter_column(
            table_name,
            'external_id',
            server_default=sa.text('gen_random_uuid()'),
            existing_type=sa.UUID()
        )


def downgrade() -> None:
    """Downgrade schema."""
    tables = [
        "atleta",
        "auth_users_sessions",
        "users",
        "baremo",
        "competencia",
        "prueba",
        "registro_prueba_competencia",
        "resultado_competencia",
        "tipo_disciplina",
        "asistencia",
        "entrenamiento",
        "horario",
        "registro_asistencias"
    ]
    
    for table_name in tables:
        op.alter_column(
            table_name,
            'external_id',
            server_default=None,
            existing_type=sa.UUID()
        )