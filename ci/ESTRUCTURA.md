# 📁 Estructura de Archivos de SonarQube

```
sports-athletics-module/
│
├── docker-compose.yml                     # Docker Compose principal (Backend + Frontend)
│
├── ci/                                    # Directorio de Integración Continua
│   ├── .gitignore                        # Ignora archivos sensibles
│   ├── README.md                         # Documentación completa
│   ├── ESTRUCTURA.md                     # Este archivo
│   │
│   └── sonarqube/                        # Configuración de SonarQube
│       ├── docker-compose-sonarqube.yml  # Docker Compose de SonarQube
│       ├── sonar-project.properties      # Configuración multi-módulo
│       ├── .env.sonar                    # Variables de entorno (credenciales)
│       ├── Dockerfile.sonar              # Dockerfile personalizado para scanner
│       └── run-sonar-analysis.sh         # Script bash de análisis
│
├── athletics_fastapi/                     # Backend Python/FastAPI
│   ├── app/                              # Código fuente
│   ├── tests/                            # Tests
│   └── coverage.xml                      # Reporte de cobertura (generado)
│
├── athletics_vite_ui/                     # Frontend Vite/TypeScript
│   ├── src/                              # Código fuente
│   └── coverage/                         # Reportes de cobertura (generado)
│       └── lcov.info
│
└── README.md                              # README principal (actualizado)
```



## 🎯 Archivos Clave

### 1. `docker-compose.yml` (Raíz del Proyecto)
Docker Compose principal que incluye:
- 🗄️ PostgreSQL (FastAPI)
- 🗄️ MariaDB (Spring Boot)
- 🔴 Redis (Cache)
- 🚀 Backend FastAPI (puerto 8080)
- ⚛️ Frontend Vite UI (puerto 5173)

### 2. `ci/sonarqube/docker-compose-sonarqube.yml`
Docker Compose de SonarQube que incluye:
- 🗄️ PostgreSQL (SonarQube)
- 🔍 SonarQube Server (puerto 9000)
- 📊 SonarQube Scanner (análisis automático)

### 3. `ci/sonarqube/sonar-project.properties`
Configuración principal de SonarQube con arquitectura multi-módulo:
- ✅ Configuración del proyecto principal
- ✅ Módulo Backend (Python/FastAPI)
- ✅ Módulo Frontend (TypeScript/JavaScript)
- ✅ Exclusiones y rutas de reportes

### 4. `ci/README.md`
Documentación completa con:
- 📖 Instrucciones de uso
- ⚙️ Configuración avanzada
- 🐛 Solución de problemas
- 📊 Métricas analizadas




## 🚀 Flujo de Trabajo

```
1. Iniciar SonarQube
   ↓
2. Esperar a que esté listo (1-2 min)
   ↓
3. Scanner ejecuta análisis automático
   ↓
4. Ver resultados en http://localhost:9000
   ↓
5. Revisar métricas de calidad
```

## 📊 Métricas Analizadas

### Backend (Python)
- Bugs y vulnerabilidades
- Code smells
- Cobertura de código
- Duplicación
- Complejidad ciclomática

### Frontend (TypeScript/JS)
- Bugs y vulnerabilidades
- Code smells
- Cobertura de código
- Duplicación
- Complejidad ciclomática

## 🔐 Seguridad

- ⚠️ El archivo `.env.sonar` contiene credenciales
- ✅ Está incluido en `.gitignore`
- 🔒 Cambiar credenciales por defecto en producción
