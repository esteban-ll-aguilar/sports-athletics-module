# Limitaciones de Población de Base de Datos

## 🚨 Problema Identificado

El script `populate_database.py` NO puede poblar datos directamente en los endpoints principales debido a la arquitectura del sistema:

### Arquitectura de Autenticación
El sistema usa una arquitectura de **microservicios** donde:

1. **Microservicio de Usuarios Externo** (`USERS_API_URL`):
   - Maneja todo el registro de usuarios
   - Asigna roles (ATLETA, ENTRENADOR, REPRESENTANTE, ADMINISTRADOR)
   - Gestiona autenticación JWT

2. **Este Microservicio (Athletics)**:
   - Los endpoints como `/api/v1/atleta/` requieren que el usuario actual tenga el rol correspondiente
   - Ejemplo: Solo usuarios con rol `ATLETA` pueden crear su propio perfil de atleta
   
###Problema
- `populate_database.py` autentica como `admin@test.com` (rol ADMINISTRADOR)
- Los endpoints de creación requieren rol específico:
  - `/api/v1/atleta/` POST → requiere rol ATLETA
  - `/api/v1/entrenador/entrenamientos/` POST → requiere rol ENTRENADOR
  - `/api/v1/competencia/competencias/` POST → permite ADMINISTRADOR o ENTRENADOR

### Errores Obtenidos
```
405 Method Not Allowed → Endpoint no existía (YA CORREGIDO)
403 Forbidden → Usuario no tiene el rol requerido
422 Unprocessable Entity → Datos enviados no coinciden con el esquema
```

---

## ✅ Soluciones Implementadas

### Opción 1: Tests contra endpoints públicos/admin
Modificar el script para probar endpoints que SÍ permiten ADMINISTRADOR:
- `/api/v1/competencia/competencias/` ✅ (permite ADMINISTRADOR)
- Otros endpoints administrativos

### Opción 2: Mock Data en Base de Datos (RECOMENDADO)
Insertar datos directamente en la base de datos sin pasar por la API:

```python
# TODO: Implementar inserción directa a PostgreSQL
async def poblar_bd_directamente():
    """Inserta datos usando SQLAlchemy directamente."""
    from app.core.db.database import get_session
    from app.modules.atleta.domain.models.atleta_model import Atleta
    
    async with get_session() as session:
        for i in range(50):
            atleta = Atleta(
                user_id=i + 1,  # Asumir que usuarios ya existen
                anios_experiencia=random.randint(1, 10)
            )
            session.add(atleta)
        await session.commit()
```

### Opción 3: Usar endpoints externos (Integración Completa)
```python
# 1. Crear usuario en microservicio externo
response = await client.post(
    f"{USERS_API_URL}/api/users",
    json={
        "email": "atleta1@test.com",
        "password": "Pass123!",
        "role": "ATLETA",
        "first_name": "Juan",
        "last_name": "Pérez",
        "identificacion": "1234567890"
    }
)

# 2. Autenticar como ese usuario
login_response = await client.post(
    "/api/v1/auth/login",
    json={"username": "atleta1@test.com", "password": "Pass123!"}
)
token = login_response.json()["access_token"]

# 3. Crear perfil de atleta
await client.post(
    "/api/v1/atleta/",
    json={"anios_experiencia": 5},
    headers={"Authorization": f"Bearer {token}"}
)
```

---

## 🎯 Recomendación para Stress Testing

### Para pruebas de carga en PRODUCCIÓN:
1. **Pre-poblar la BD con fixture SQL** antes de ejecutar tests
2. **Usar usuarios de prueba pre-creados** con diferentes roles
3. **Generar 100-1000 usuarios en el microservicio externo** antes de stress tests

### Para pruebas locales:
1. Ejecutar script de seeds directamente en la BD
2. Usar el endpoint `/api/v1/competencia/competencias/` que SÍ permite ADMINISTRADOR
3. Mockear respuestas del microservicio externo en tests

---

## 📝 TODOs
- [ ] Crear script `seed_database_direct.py` que inserte directamente en PostgreSQL
- [ ] Documentar cómo crear usuarios de prueba en el microservicio externo
- [ ] Implementar fixtures SQL para CI/CD
- [ ] Actualizar Locust tests para usar solo endpoints accesibles
- [ ] Crear endpoint admin `/admin/seed-data` para pruebas

---

## 🔄 Workaround Temporal
Por ahora, el stress testing se enfocará en:
1. **Endpoints de autenticación** (`/api/v1/auth/*`)
2. **Endpoints de competencias** que permiten ADMINISTRADOR
3. **Endpoints de lectura** (GET) que requieren solo autenticación
4. **Tests de carga de infraestructura** (Prometheus, Grafana, cAdvisor)

Los tests de escritura (POST/PUT/DELETE) se implementarán cuando se resuelva la integración con el microservicio de usuarios.
