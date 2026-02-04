# Locust Load Testing - Sports Athletics Module

## 📁 Estructura de Archivos

```
ci/stress_tests/locust/
├── locustfile.py          # Archivo principal (todos los módulos)
├── auth_load.py           # Módulo de autenticación
├── atleta_load.py         # Módulo de atletas
├── entrenador_load.py     # Módulo de entrenadores
├── competencia_load.py    # Módulo de competencias
├── representante_load.py  # Módulo de representantes
├── admin_load.py          # Módulo de administración
├── locust.conf            # Configuración por defecto
└── README.md              # Este archivo
```

## 🚀 Requisitos Previos

1. **Backend corriendo** con `ENABLE_TEST_ROUTES=true`:
   ```bash
   # En athletics_fastapi/.env
   ENABLE_TEST_ROUTES=true
   ```

2. **Instalar Locust**:
   ```bash
   pip install locust
   ```

## 📋 Uso

### Probar módulo específico

```bash
cd ci/stress_tests/locust

# Autenticación
locust -f auth_load.py --host=http://localhost:8080

# Atletas
locust -f atleta_load.py --host=http://localhost:8080

# Entrenadores
locust -f entrenador_load.py --host=http://localhost:8080

# Competencias
locust -f competencia_load.py --host=http://localhost:8080

# Representantes
locust -f representante_load.py --host=http://localhost:8080

# Admin
locust -f admin_load.py --host=http://localhost:8080
```

### Probar todos los módulos

```bash
cd ci/stress_tests/locust
locust -f locustfile.py --host=http://localhost:8080
```

### Modo headless (sin interfaz web)

```bash
# 10 usuarios, spawn rate 2/s, duración 60s
locust -f auth_load.py --host=http://localhost:8080 \
    --headless -u 10 -r 2 --run-time 60s
```

### Con Docker

```bash
cd ci/stress_tests
docker-compose -f docker-compose-stress.yml up
```

## 🌐 Interfaz Web

1. Ejecutar locust
2. Abrir http://localhost:8089
3. Configurar:
   - **Number of users**: Cantidad total de usuarios
   - **Spawn rate**: Usuarios por segundo
   - **Host**: http://localhost:8080

## 📊 Endpoints por Módulo

### Auth (`/api/v1/tests/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /register | Registrar usuario |
| POST | /login | Login |
| POST | /logout | Logout |
| POST | /refresh | Refresh token |
| GET | /profile | Perfil usuario |

### Atleta (`/api/v1/tests/atleta`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | / | Crear perfil atleta |
| GET | /me | Mi perfil |
| GET | /historial | Mi historial |
| GET | /estadisticas | Mis estadísticas |
| GET | / | Listar atletas |
| GET | /{id} | Obtener atleta |
| PUT | /{id} | Actualizar atleta |

### Entrenador (`/api/v1/tests/entrenador`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | / | Crear entrenamiento |
| GET | / | Listar entrenamientos |
| GET | /{id} | Obtener entrenamiento |
| PUT | /{id} | Actualizar entrenamiento |
| POST | /entrenamiento/{id} | Crear horario |
| GET | /entrenamiento/{id} | Listar horarios |
| GET | /mis-registros | Mis registros |

### Competencia (`/api/v1/tests/competencia`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /competencias | Crear competencia |
| GET | /competencias | Listar competencias |
| GET | /pruebas/ | Listar pruebas |
| GET | /baremos/ | Listar baremos |
| GET | /tipo-disciplina/ | Tipos de disciplina |
| GET | /resultados-pruebas/ | Resultados |

### Representante (`/api/v1/tests/representante`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /athletes | Registrar hijo |
| GET | /athletes | Mis atletas |
| GET | /athletes/{id} | Detalle hijo |
| GET | /athletes/{id}/historial | Historial |
| GET | /athletes/{id}/estadisticas | Estadísticas |
| PUT | /athletes/{id} | Actualizar hijo |

### Admin (`/api/v1/tests/admin`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /jwt/rotation-info | Info rotación JWT |
| POST | /jwt/rotate-secret | Rotar secret |

## ⚠️ Notas Importantes

1. **SIN trailing slashes**: Las URLs deben ser `/endpoint` no `/endpoint/`
2. **Registro automático**: Cada usuario de Locust registra su propio usuario de prueba
3. **Tokens**: Se manejan automáticamente (login, refresh)
4. **Roles**: Se crean usuarios con roles apropiados (ATLETA, ENTRENADOR, etc.)

## 🐛 Solución de Problemas

### Error 307 Redirect
- Revisar que las URLs no tengan trailing slash final
- Ejemplo correcto: `/api/v1/tests/auth/login`
- Ejemplo incorrecto: `/api/v1/tests/auth/login/`

### Error 401 Unauthorized
- Verificar que `ENABLE_TEST_ROUTES=true` esté en el backend
- El endpoint `/register` permite crear usuarios con cualquier rol

### Error 404 Not Found
- Verificar que el endpoint exista en los test routers
- Revisar la estructura de URLs en los routers

### "Too many file descriptors"
- Problema de Windows con muchas conexiones
- Reducir número de usuarios (`-u 10` en vez de `-u 100`)
