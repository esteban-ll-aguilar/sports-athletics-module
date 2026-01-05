import sys
from unittest.mock import MagicMock, patch
import pytest


# -------------------------------------------------------------------
# MOCK GLOBAL DEL MÓDULO DE BD ANTES DE CUALQUIER IMPORT
# -------------------------------------------------------------------

mock_sync_session = MagicMock()
mock_sync_session.SessionLocal = MagicMock()

sys.modules["app.core.db.sync_session"] = mock_sync_session


# -------------------------------------------------------------------
# AHORA SÍ SE PUEDE IMPORTAR EL SERVICE SIN EXPLOTAR SETTINGS
# -------------------------------------------------------------------

from app.modules.admin.services.export_user_data_service import (
    export_users_to_pdf,
)


def test_export_users_to_pdf_ok():
    # ---- Usuarios mock ----
    user1 = MagicMock(id=1, email="user1@test.com", role="ADMIN")
    user2 = MagicMock(id=2, email="user2@test.com", role="USER")

    users = [user1, user2]

    # ---- Mock DB ----
    mock_db = MagicMock()
    mock_db.query.return_value.all.return_value = users
    mock_sync_session.SessionLocal.return_value = mock_db

    # ---- Mock Canvas ----
    mock_canvas = MagicMock()

    with patch(
        "app.modules.admin.services.export_user_data_service.canvas.Canvas",
        return_value=mock_canvas,
    ):
        export_users_to_pdf("test.pdf")

    # ---- Assertions ----
    mock_db.query.assert_called_once()
    mock_canvas.drawString.assert_called()
    mock_canvas.save.assert_called_once()
    mock_db.close.assert_called_once()


def test_export_users_to_pdf_no_users(capsys):
    # ---- Mock DB sin usuarios ----
    mock_db = MagicMock()
    mock_db.query.return_value.all.return_value = []
    mock_sync_session.SessionLocal.return_value = mock_db

    export_users_to_pdf("test.pdf")

    captured = capsys.readouterr()
    assert "No hay usuarios en la base de datos." in captured.out
    mock_db.close.assert_called_once()
