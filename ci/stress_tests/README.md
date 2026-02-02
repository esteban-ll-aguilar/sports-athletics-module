# 🚀 Pruebas de Estrés con Locust

Suite de pruebas de carga y estrés para el módulo de Atletismo.

## ⚠️ Requisitos Previos

1. **Backend corriendo** en `http://localhost:8080`
2. **Variable de entorno** `ENABLE_TEST_ROUTES=true` en el backend
3. **Locust instalado**: `pip install locust`

## 📁 Estructura

```
stress_tests/
├── docker-compose-stress.yml  # Docker Compose para Locust
├── populate_database.py       # Script para poblar BD con datos de test
├── run_all_tests.py           # Orquestador principal
├── locust/
│   ├── locustfile.py          # Definición de usuarios y tareas
│   ├── scenarios.py           # Escenarios predefinidos
│   └── locust.conf            # Configuración de Locust
└── utils/
    └── utils.py               # Generadores de datos
```

## 🎯 Endpoints de Test

Las pruebas usan endpoints especiales sin rate limiting:

| Módulo | Prefijo | Descripción |
|--------|---------|-------------|
| Auth | `/api/v1/tests/auth/*` | Login, registro, refresh, logout |
| Atleta | `/api/v1/tests/atleta/*` | CRUD de atletas |
| Entrenador | `/api/v1/tests/entrenador/*` | Entrenamientos, horarios, asistencia |
| Competencia | `/api/v1/tests/competencia/*` | Competencias, pruebas, baremos |
| Representante | `/api/v1/tests/representante/*` | Gestión de representados |
| Admin | `/api/v1/tests/admin/*` | Dashboard, usuarios, estadísticas |

## 🚀 Uso Rápido

### 1. Poblar Base de Datos

```bash
# Crear 100 usuarios + 30 competencias
python populate_database.py

# Crear más datos
python populate_database.py --users 200 --competencias 50

# Datos completos
python populate_database.py --full
```

### 2. Ejecutar Pruebas

#### Opción A: Orquestador Automático

```bash
# Smoke test (10 usuarios, 2 min)
python run_all_tests.py

# Load test (100 usuarios, 10 min)
python run_all_tests.py --load

# Stress test (500 usuarios, 15 min)
python run_all_tests.py --stress

# Spike test (300 usuarios, 5 min)
python run_all_tests.py --spike

# Soak test (150 usuarios, 60 min)
python run_all_tests.py --soak

# Saltar poblado de BD
python run_all_tests.py --load --skip-populate

# Configuración custom
python run_all_tests.py --users 200 --spawn-rate 20 --duration 15m
```

#### Opción B: Locust Directo

```bash
# Web UI interactiva
locust -f locust/locustfile.py --host=http://localhost:8080

# Headless con reporte
locust -f locust/locustfile.py --host=http://localhost:8080 \
    --users 100 --spawn-rate 10 --run-time 5m --headless \
    --html=report.html --csv=results
```

#### Opción C: Docker

```bash
# Iniciar Locust con Docker
docker-compose -f docker-compose-stress.yml up -d

# Abrir Web UI en http://localhost:8089

# Detener
docker-compose -f docker-compose-stress.yml down
```

## 📊 Tipos de Prueba

| Tipo | Usuarios | Spawn Rate | Duración | Propósito |
|------|----------|------------|----------|-----------|
| Smoke | 10 | 2/s | 2 min | Verificación básica |
| Load | 100 | 10/s | 10 min | Carga normal |
| Stress | 500 | 25/s | 15 min | Encontrar límites |
| Spike | 300 | 100/s | 5 min | Picos repentinos |
| Soak | 150 | 15/s | 60 min | Resistencia/memory leaks |

## 👥 Tipos de Usuario Simulados

- **MixedWorkloadUser**: Carga mixta realista (lectura + escritura)
- **ReadOnlyUser**: Solo operaciones GET
- **WriteHeavyUser**: Muchas operaciones POST/PUT/DELETE
- **AuthenticationStressUser**: Login/logout repetitivo
- **AtletaUser**: Operaciones de atleta
- **EntrenadorUser**: Operaciones de entrenador
- **CompetenciaUser**: Operaciones de competencia

## 📈 Resultados

Los reportes se generan en `results/`:
- `report.html` - Reporte visual HTML
- `stats_*.csv` - Estadísticas en CSV

## 🔧 Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@test.com | Admin123! | ADMINISTRADOR |
| entrenador1@test.com | Entrenador123! | ENTRENADOR |
| entrenador2@test.com | Entrenador123! | ENTRENADOR |
| representante1@test.com | Rep123! | REPRESENTANTE |
| user1@test.com ... user100@test.com | Password123! | ATLETA |

## 🐛 Troubleshooting

### "Las rutas de test no están habilitadas"
Asegúrate de tener `ENABLE_TEST_ROUTES=true` en el `.env` del backend.

### "No se puede conectar al API"
Verifica que el backend esté corriendo en `http://localhost:8080`.

### "Locust no está instalado"
```bash
pip install locust
```

### Error de autenticación en tests
Los usuarios deben existir. Ejecuta `populate_database.py` primero.
