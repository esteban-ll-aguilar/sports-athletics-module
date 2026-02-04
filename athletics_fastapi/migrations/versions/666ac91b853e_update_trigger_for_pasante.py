"""update_trigger_for_pasante

Revision ID: 666ac91b853e
Revises: 6b1f672aa93c
Create Date: 2026-02-03 06:31:07.679263

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '666ac91b853e'
down_revision: Union[str, Sequence[str], None] = '6b1f672aa93c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Trigger function and trigger creation
    op.execute("""
    CREATE OR REPLACE FUNCTION public.sync_user_role()
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
        ELSIF NEW.role = 'PASANTE' THEN
            INSERT INTO pasante (user_id, fecha_inicio, especialidad, institucion_origen, estado)
            SELECT NEW.id, CURRENT_DATE, 'No especificada', 'No especificada', true
            WHERE NOT EXISTS (SELECT 1 FROM pasante WHERE user_id = NEW.id);
        END IF;
        RETURN NEW;
    END;
    $function$;
    """)

    op.execute("DROP TRIGGER IF EXISTS trg_sync_user_role ON users")
    op.execute("""
    CREATE TRIGGER trg_sync_user_role
    AFTER INSERT OR UPDATE OF role ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role();
    """)

    op.execute("""
    CREATE OR REPLACE FUNCTION public.sync_user_delete()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
        DELETE FROM atleta WHERE user_id = OLD.id;
        DELETE FROM entrenador WHERE user_id = OLD.id;
        DELETE FROM representante WHERE user_id = OLD.id;
        DELETE FROM pasante WHERE user_id = OLD.id;
        RETURN OLD;
    END;
    $function$;
    """)

    op.execute("DROP TRIGGER IF EXISTS trg_sync_user_delete ON users")
    op.execute("""
    CREATE TRIGGER trg_sync_user_delete
    BEFORE DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_delete();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS trg_sync_user_role ON users")
    op.execute("DROP FUNCTION IF EXISTS public.sync_user_role()")

    op.execute("DROP TRIGGER IF EXISTS trg_sync_user_delete ON users")
    op.execute("DROP FUNCTION IF EXISTS public.sync_user_delete()")