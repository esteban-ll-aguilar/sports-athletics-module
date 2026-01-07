import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """
    Verifica que el endpoint raiz (o health) responda correctamente.
    """
    # Como la raiz redirige a /docs o devuelve 404 segun config,
    # probaremos un endpoint que sepamos que existe o el comportamiento esperado.
    # En main.py vimos que no hay un @app.get("/") explicito mas alla de docs.
    # Pero fastAPI genera /docs y /openapi.json por defecto.
    
    response = await client.get("/")
    assert response.status_code == 200
