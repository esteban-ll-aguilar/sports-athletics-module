# Módulo de Tests - Sin Rate Limiting

## 📋 Descripción General

Este módulo proporciona endpoints de prueba **sin limitación de rate limiting** para facilitar el testing automatizado y manual de toda la aplicación. Los endpoints están disponibles bajo el prefijo `/api/v1/tests` y reflejan la funcionalidad completa de todos los módulos de la aplicación.

## 🎯 Características Principales

### ✅ Sin Rate Limiting
- **Todos los endpoints** en `/api/v1/tests/*` no tienen limitadores de tasa
- Permite pruebas de carga y stress testing sin restricciones
- Ideal para CI/CD y pruebas automatizadas

### ✅ Usuarios Activos por Defecto
- El endpoint de registro crea usuarios con `is_active=True` automáticamente
- **No requiere verificación de email** para activación
- Login inmediato después del registro

### ✅ Soporte Multi-Rol
- Un usuario puede tener múltiples roles simultáneamente
- Facilita testing de flujos complejos con permisos combinados
- Roles disponibles: `ATLETA`, `ENTRENADOR`, `ADMINISTRADOR`, `REPRESENTANTE`

### ✅ Misma Lógica de Negocio
- **No modifica** repositories ni services
- Utiliza las mismas dependencias que los endpoints de producción
- Solo elimina decoradores `@limiter.limit()`

## 🚀 Activación

### Variable de Entorno

```env
# En athletics_fastapi/.env
ENABLE_TEST_ROUTES=true
```

### Verificación

Al iniciar la aplicación con `ENABLE_TEST_ROUTES=true`, verás:

```
⚠️  TEST ROUTES ENABLED - NO RATE LIMITING ON /api/v1/tests/* ⚠️
```

## 📂 Estructura del Módulo

```
athletics_fastapi/
├── app/
│   └── modules/
│       └── tests/
│           ├── __init__.py
│           └── routers/
│               ├── __init__.py
│               ├── auth_test_router.py         # Auth sin rate limit
│               ├── atleta_test_router.py       # Atletas y historial médico
│               ├── entrenador_test_router.py   # Entrenamientos y asistencias
│               ├── competencia_test_router.py  # Competencias completas
│               ├── representante_test_router.py # Representantes
│               ├── admin_test_router.py        # Administración
│               └── external_test_router.py     # Servicios externos
└── tests/
    ├── conftest.py                              # Fixtures multi-rol
    └── modules/
        ├── atleta/routers/test_atleta_test_router.py
        ├── entrenador/routers/test_entrenador_test_router.py
        └── competencia/routers/test_competencia_test_router.py
```

## 🔑 Endpoints Principales

### Autenticación (Auth)

#### Registro con Usuario Activo
```http
POST /api/v1/tests/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "username": "testuser",
  "first_name": "Test",
  "last_name": "User",
  "tipo_identificacion": "CEDULA",
  "numero_identificacion": "1234567890",
  "roles": ["ATLETA", "ENTRENADOR"],  // 👈 Múltiples roles
  "is_active": true  // 👈 Activo por defecto
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario de test creado exitosamente. Active: true",
  "data": {
    "id": 1,
    "email": "test@example.com",
    "is_active": true,
    ...
  }
}
```

#### Login (Sin Rate Limit)
```http
POST /api/v1/tests/auth/login
Content-Type: application/json

{
  "username": "test@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/v1/tests/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

#### Logout
```http
POST /api/v1/tests/auth/logout
```

### Atleta

#### Crear Perfil de Atleta
```http
POST /api/v1/tests/atleta/
Authorization: Bearer <token>
Content-Type: application/json

{
  "peso": 70.5,
  "altura": 1.75,
  "fecha_nacimiento": "2000-01-01",
  "genero": "M",
  "categoria": "Senior"
}
```

#### Obtener Mi Perfil
```http
GET /api/v1/tests/atleta/me
Authorization: Bearer <token>
```

#### Historial de Competencias
```http
GET /api/v1/tests/atleta/historial
Authorization: Bearer <token>
```

#### Estadísticas
```http
GET /api/v1/tests/atleta/estadisticas
Authorization: Bearer <token>
```

#### Listar Todos los Atletas
```http
GET /api/v1/tests/atleta/?skip=0&limit=100
```

#### Historial Médico

```http
# Crear
POST /api/v1/tests/atleta/historial-medico/
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo_sangre": "O+",
  "alergias": "Ninguna",
  "enfermedades_cronicas": "",
  "medicamentos_actuales": "",
  "contacto_emergencia": "Juan Pérez",
  "telefono_emergencia": "0987654321"
}

# Obtener propio
GET /api/v1/tests/atleta/historial-medico/me
Authorization: Bearer <token>

# Listar todos (Admin/Entrenador)
GET /api/v1/tests/atleta/historial-medico/
Authorization: Bearer <admin_token>
```

### Entrenador

#### Entrenamientos

```http
# Crear entrenamiento
POST /api/v1/tests/entrenador/entrenamientos/
Authorization: Bearer <coach_token>
Content-Type: application/json

{
  "nombre": "Entrenamiento de Velocidad",
  "descripcion": "Sesión de sprints",
  "tipo": "VELOCIDAD",
  "ubicacion": "Pista Principal"
}

# Listar mis entrenamientos
GET /api/v1/tests/entrenador/entrenamientos/
Authorization: Bearer <coach_token>

# Detalle
GET /api/v1/tests/entrenador/entrenamientos/{id}
Authorization: Bearer <coach_token>

# Actualizar
PUT /api/v1/tests/entrenador/entrenamientos/{id}
Authorization: Bearer <coach_token>

# Eliminar
DELETE /api/v1/tests/entrenador/entrenamientos/{id}
Authorization: Bearer <coach_token>
```

#### Horarios

```http
# Crear horario
POST /api/v1/tests/entrenador/horarios/
Authorization: Bearer <coach_token>
Content-Type: application/json

{
  "entrenamiento_id": 1,
  "dia_semana": "LUNES",
  "hora_inicio": "08:00:00",
  "hora_fin": "10:00:00"
}

# Listar horarios de un entrenamiento
GET /api/v1/tests/entrenador/horarios/{entrenamiento_id}

# Eliminar
DELETE /api/v1/tests/entrenador/horarios/{horario_id}
Authorization: Bearer <coach_token>
```

#### Asistencias

```http
# Inscribir atleta
POST /api/v1/tests/entrenador/inscripcion
Authorization: Bearer <coach_token>
Content-Type: application/json

{
  "horario_id": 1,
  "atleta_id": 5
}

# Listar inscritos
GET /api/v1/tests/entrenador/inscripcion/?horario_id=1
Authorization: Bearer <token>

# Registrar asistencia diaria
POST /api/v1/tests/entrenador/registro
Authorization: Bearer <coach_token>
Content-Type: application/json

{
  "registro_asistencias_id": 1,
  "fecha_entrenamiento": "2024-06-15",
  "presente": true,
  "observaciones": "Puntual"
}

# Atleta confirma asistencia
POST /api/v1/tests/entrenador/confirmar/{registro_id}?fecha_entrenamiento=2024-06-15

# Atleta rechaza asistencia
POST /api/v1/tests/entrenador/rechazar/{registro_id}?fecha_entrenamiento=2024-06-15

# Marcar presente
PUT /api/v1/tests/entrenador/marcar-presente/{asistencia_id}
Authorization: Bearer <coach_token>

# Marcar ausente
PUT /api/v1/tests/entrenador/marcar-ausente/{asistencia_id}
Authorization: Bearer <coach_token>

# Mis registros (como atleta)
GET /api/v1/tests/entrenador/mis-registros?atleta_id=5

# Eliminar inscripción
DELETE /api/v1/tests/entrenador/inscripcion/{registro_id}
Authorization: Bearer <coach_token>
```

#### Resultados de Entrenamiento

```http
# Listar
GET /api/v1/tests/entrenador/resultados/?skip=0&limit=100

# Crear
POST /api/v1/tests/entrenador/resultados/
Authorization: Bearer <coach_token>
Content-Type: application/json

{
  "atleta_id": 5,
  "entrenamiento_id": 1,
  "fecha": "2024-06-15",
  "resultado": "10.5 segundos",
  "observaciones": "Excelente marca"
}

# Actualizar
PUT /api/v1/tests/entrenador/resultados/{id}
Authorization: Bearer <coach_token>

# Eliminar
DELETE /api/v1/tests/entrenador/resultados/{id}
Authorization: Bearer <coach_token>
```

### Competencia

#### Competencias

```http
# Crear (Admin/Entrenador)
POST /api/v1/tests/competencia/competencias
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Campeonato Nacional 2024",
  "fecha_inicio": "2024-06-01",
  "fecha_fin": "2024-06-03",
  "ubicacion": "Estadio Principal",
  "descripcion": "Torneo nacional"
}

# Listar
GET /api/v1/tests/competencia/competencias?incluir_inactivos=true
Authorization: Bearer <token>

# Obtener
GET /api/v1/tests/competencia/competencias/{external_id}

# Actualizar
PUT /api/v1/tests/competencia/competencias/{external_id}
Authorization: Bearer <token>

# Eliminar
DELETE /api/v1/tests/competencia/competencias/{external_id}
Authorization: Bearer <token>
```

#### Pruebas (Eventos)

```http
# Crear
POST /api/v1/tests/competencia/pruebas
Content-Type: application/json

{
  "nombre": "100 metros planos",
  "tipo": "VELOCIDAD",
  "unidad_medida": "segundos",
  "descripcion": "Carrera de velocidad"
}

# Listar
GET /api/v1/tests/competencia/pruebas/

# Obtener
GET /api/v1/tests/competencia/pruebas/{external_id}

# Actualizar
PUT /api/v1/tests/competencia/pruebas/{external_id}
```

#### Resultados de Competencia

```http
# Crear
POST /api/v1/tests/competencia/resultados
Content-Type: application/json

{
  "competencia_id": "uuid",
  "atleta_id": 5,
  "prueba_id": "uuid",
  "resultado": "10.5",
  "posicion": 1,
  "medalla": "ORO"
}

# Listar
GET /api/v1/tests/competencia/resultados

# Por competencia
GET /api/v1/tests/competencia/resultados/competencia/{competencia_id}

# Obtener
GET /api/v1/tests/competencia/resultados/{external_id}

# Actualizar
PUT /api/v1/tests/competencia/resultados/{external_id}
```

#### Baremos (Sistemas de Puntuación)

```http
# Crear
POST /api/v1/tests/competencia/baremos
Content-Type: application/json

{
  "nombre": "Baremo IAAF 2024",
  "descripcion": "Sistema internacional",
  "tipo": "VELOCIDAD",
  "valores": {"10.0": 1200, "10.5": 1150}
}

# Listar
GET /api/v1/tests/competencia/baremos/

# Obtener
GET /api/v1/tests/competencia/baremos/{external_id}

# Actualizar
PUT /api/v1/tests/competencia/baremos/{external_id}
```

#### Tipo de Disciplina

```http
# Crear
POST /api/v1/tests/competencia/tipo-disciplina
Content-Type: application/json

{
  "nombre": "Atletismo",
  "descripcion": "Pista y campo"
}

# Listar
GET /api/v1/tests/competencia/tipo-disciplina/

# Obtener
GET /api/v1/tests/competencia/tipo-disciplina/{external_id}

# Actualizar
PUT /api/v1/tests/competencia/tipo-disciplina/{external_id}
```

#### Registro Prueba Competencia

```http
# Crear
POST /api/v1/tests/competencia/registro-prueba
Content-Type: application/json

{
  "competencia_id": "uuid",
  "prueba_id": "uuid",
  "categoria": "Senior",
  "genero": "M"
}

# Listar por competencia
GET /api/v1/tests/competencia/registro-prueba/competencia/{competencia_id}
```

### Representante

```http
# Registrar atleta hijo
POST /api/v1/tests/representante/athletes
Authorization: Bearer <representante_token>
Content-Type: application/json

{
  "email": "hijo@example.com",
  "password": "Pass123!",
  "username": "hijo_atleta",
  ...
}

# Actualizar atleta hijo
PUT /api/v1/tests/representante/athletes/{atleta_id}
Authorization: Bearer <representante_token>

# Obtener perfil
GET /api/v1/tests/representante/me
Authorization: Bearer <representante_token>

# Listar atletas representados
GET /api/v1/tests/representante/atletas
Authorization: Bearer <representante_token>

# Entrenamientos de atleta
GET /api/v1/tests/representante/atletas/{atleta_id}/entrenamientos
Authorization: Bearer <representante_token>

# Historial de atleta
GET /api/v1/tests/representante/atletas/{atleta_id}/historial
Authorization: Bearer <representante_token>
```

### Admin

```http
# Info de rotación JWT
GET /api/v1/tests/admin/jwt/rotation-info
Authorization: Bearer <admin_token>

# Rotar JWT manualmente
POST /api/v1/tests/admin/jwt/rotate
Authorization: Bearer <admin_token>
```

### External

```http
# Actualizar token externo
POST /api/v1/tests/external/update-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "new-external-token"
}

# Listar usuarios externos
GET /api/v1/tests/external/users
Authorization: Bearer <token>
```

## 🧪 Fixtures de Testing

### Fixtures Multi-Rol Disponibles

```python
# En tests/conftest.py

# Usuarios por rol individual
@pytest_asyncio.fixture
async def test_atleta_user(client: AsyncClient) -> Dict[str, Any]:
    """Usuario atleta activo con token"""
    # Retorna: {"user_id", "email", "token", "refresh_token", "user_data"}

@pytest_asyncio.fixture
async def test_entrenador_user(client: AsyncClient) -> Dict[str, Any]:
    """Usuario entrenador activo con token"""

@pytest_asyncio.fixture
async def test_admin_user(client: AsyncClient) -> Dict[str, Any]:
    """Usuario administrador activo con token"""

@pytest_asyncio.fixture
async def test_representante_user(client: AsyncClient) -> Dict[str, Any]:
    """Usuario representante activo con token"""

# Usuario con múltiples roles
@pytest_asyncio.fixture
async def test_multi_role_user(client: AsyncClient) -> Dict[str, Any]:
    """Usuario con roles ATLETA + ENTRENADOR"""
    # Retorna: {"user_id", "email", "token", ..., "roles": ["ATLETA", "ENTRENADOR"]}

# Clientes autenticados
@pytest_asyncio.fixture
async def authenticated_atleta_client(client, test_atleta_user) -> AsyncClient:
    """Cliente HTTP con headers de autenticación de atleta"""

@pytest_asyncio.fixture
async def authenticated_entrenador_client(client, test_entrenador_user) -> AsyncClient:
    """Cliente HTTP con headers de autenticación de entrenador"""

@pytest_asyncio.fixture
async def authenticated_admin_client(client, test_admin_user) -> AsyncClient:
    """Cliente HTTP con headers de autenticación de admin"""
```

### Ejemplo de Uso en Tests

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
class TestAtletaEndpoints:
    
    async def test_create_atleta_profile(
        self, 
        authenticated_atleta_client: AsyncClient
    ):
        """Test con cliente ya autenticado"""
        response = await authenticated_atleta_client.post(
            "/api/v1/tests/atleta/",
            json={
                "peso": 70.5,
                "altura": 1.75,
                "fecha_nacimiento": "2000-01-01",
                "genero": "M"
            }
        )
        assert response.status_code == 201
    
    async def test_multi_role_access(
        self,
        test_multi_role_user: Dict[str, Any],
        client: AsyncClient
    ):
        """Test usuario con múltiples roles"""
        token = test_multi_role_user["token"]
        
        # Puede actuar como atleta
        response1 = await client.get(
            "/api/v1/tests/atleta/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response1.status_code == 200
        
        # Y también como entrenador
        response2 = await client.post(
            "/api/v1/tests/entrenador/entrenamientos/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "nombre": "Test Training",
                "tipo": "VELOCIDAD",
                "ubicacion": "Gym"
            }
        )
        assert response2.status_code in [201, 403]
```

## 📊 Cobertura de Tests

### Tests Creados

- ✅ **Atleta**: `tests/modules/atleta/routers/test_atleta_test_router.py`
  - CRUD completo de atletas
  - Historial médico
  - Permisos por rol
  
- ✅ **Entrenador**: `tests/modules/entrenador/routers/test_entrenador_test_router.py`
  - Entrenamientos (CRUD)
  - Horarios (CRUD)
  - Asistencias (inscripción, confirmación, marcaje)
  - Resultados de entrenamiento
  - Escenarios multi-rol

- ✅ **Competencia**: `tests/modules/competencia/routers/test_competencia_test_router.py`
  - Competencias (CRUD)
  - Pruebas (CRUD)
  - Resultados (CRUD)
  - Baremos (CRUD)
  - Tipos de disciplina (CRUD)
  - Registros de pruebas
  - Permisos por rol

### Ejecutar Tests

```bash
# Todos los tests
pytest

# Solo tests de módulo específico
pytest tests/modules/atleta/
pytest tests/modules/entrenador/
pytest tests/modules/competencia/

# Con cobertura
pytest --cov=app --cov-report=html

# Tests específicos
pytest tests/modules/atleta/routers/test_atleta_test_router.py::TestAtletaEndpoints::test_create_atleta -v
```

## ⚠️ Consideraciones Importantes

### Seguridad

1. **NUNCA habilitar en producción**: `ENABLE_TEST_ROUTES=false` en producción
2. **Solo para desarrollo/testing**: Estos endpoints no tienen rate limiting
3. **No validaciones adicionales**: Solo para ambiente de pruebas controlado

### Diferencias con Endpoints de Producción

| Aspecto | Producción (`/api/v1/*`) | Testing (`/api/v1/tests/*`) |
|---------|---------------------------|------------------------------|
| Rate Limiting | ✅ Sí | ❌ No |
| Usuario Activo | ❌ Requiere verificación email | ✅ Activo por defecto |
| Multi-Rol | ❌ Un rol por usuario | ✅ Múltiples roles permitidos |
| Lógica de Negocio | ✅ Completa | ✅ Idéntica |
| Dependencias | ✅ Iguales | ✅ Iguales |
| Repositories | ✅ Sin modificar | ✅ Sin modificar |
| Services | ✅ Sin modificar | ✅ Sin modificar |

### Buenas Prácticas

1. **Limpieza de datos**: Los tests deben limpiar datos creados
2. **Isolation**: Cada test debe ser independiente
3. **Fixtures**: Reutilizar fixtures de conftest.py
4. **Naming**: Nombres descriptivos para tests
5. **Assertions**: Verificar múltiples aspectos del response

## 🔍 Debugging

### Verificar si están activas las rutas de test

```bash
# Debería mostrar el warning al iniciar
python run.py
# Output esperado:
# ⚠️  TEST ROUTES ENABLED - NO RATE LIMITING ON /api/v1/tests/* ⚠️
```

### Listar todas las rutas

```python
from app.main import _APP

for route in _APP.routes:
    print(f"{route.methods} {route.path}")
```

### Verificar variable de entorno

```bash
# Windows PowerShell
$env:ENABLE_TEST_ROUTES
# Linux/Mac
echo $ENABLE_TEST_ROUTES
```

## 📚 Referencias

- **Lógica Principal**: No modificada, ver módulos originales en `app/modules/`
- **Schemas**: Usa los mismos schemas de producción
- **Dependencies**: Idénticas a producción
- **Services**: Sin cambios
- **Repositories**: Sin cambios

## 🎓 Ejemplos de Uso

### Flujo Completo: Registro → Login → Crear Atleta

```python
import httpx

async def test_complete_flow():
    async with httpx.AsyncClient(base_url="http://localhost:8080") as client:
        # 1. Registro (usuario activo inmediatamente)
        register_response = await client.post(
            "/api/v1/tests/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "Pass123!",
                "username": "newuser",
                "first_name": "New",
                "last_name": "User",
                "tipo_identificacion": "CEDULA",
                "numero_identificacion": "1234567890",
                "roles": ["ATLETA"],
                "is_active": True
            }
        )
        assert register_response.status_code == 201
        
        # 2. Login inmediato (sin verificar email)
        login_response = await client.post(
            "/api/v1/tests/auth/login",
            json={
                "username": "newuser@test.com",
                "password": "Pass123!"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["data"]["access_token"]
        
        # 3. Crear perfil de atleta
        atleta_response = await client.post(
            "/api/v1/tests/atleta/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "peso": 72.0,
                "altura": 1.80,
                "fecha_nacimiento": "1995-05-15",
                "genero": "M",
                "categoria": "Senior"
            }
        )
        assert atleta_response.status_code == 201
        print("✅ Flujo completo exitoso!")
```

---

**Creado por**: Sistema de Testing Automatizado  
**Fecha**: Febrero 2026  
**Versión**: 1.0.0
