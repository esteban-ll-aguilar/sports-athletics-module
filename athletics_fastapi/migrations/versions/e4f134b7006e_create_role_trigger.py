"""create_role_trigger

Revision ID: e4f134b7006e
Revises: 6783f4dcd9f7
Create Date: 2026-01-04 21:13:46.870599

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4f134b7006e'
down_revision: Union[str, Sequence[str], None] = '6783f4dcd9f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Trigger function and trigger creation
    op.execute("""
    CREATE OR REPLACE FUNCTION public.sync_auth_user_role()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$

    BEGIN
        IF NEW.role = 'REPRESENTANTE' THEN
            INSERT INTO representante (user_id)
            SELECT NEW.id
            WHERE NOT EXISTS (SELECT 1 FROM representante WHERE user_id = NEW.id);
        ELSIF NEW.role = 'ENTRENADOR' THEN
            INSERT INTO entrenador (user_id, anios_experiencia, is_pasante)
            SELECT NEW.id, 0, false
            WHERE NOT EXISTS (SELECT 1 FROM entrenador WHERE user_id = NEW.id);
        ELSIF NEW.role = 'ATLETA' THEN
            INSERT INTO atleta (user_id, anios_experiencia)
            SELECT NEW.id, 0
            WHERE NOT EXISTS (SELECT 1 FROM atleta WHERE user_id = NEW.id);
        END IF;
        RETURN NEW;
    END;
    $function$;
    """)

    op.execute("DROP TRIGGER IF EXISTS trg_sync_auth_user_role ON auth_users")
    op.execute("""
    CREATE TRIGGER trg_sync_auth_user_role
    AFTER INSERT OR UPDATE OF role ON auth_users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_role();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS trg_sync_auth_user_role ON auth_users")
    op.execute("DROP FUNCTION IF EXISTS public.sync_auth_user_role()")