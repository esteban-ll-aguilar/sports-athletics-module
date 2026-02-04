# Configuración de Jenkins para CI/CD

Este proyecto utiliza Jenkins para implementar un pipeline de CI/CD completo que automatiza el testing, construcción y despliegue de los servicios con el siguiente flujo:

1. **Tests Unitarios** (Backend & Frontend)
2. **Análisis de SonarQube** (automático)
3. **Pruebas de Integración**
4. **Build con Entorno de Desarrollo**
5. **Pruebas de Carga y Estrés** (automáticas)
6. **Build de Producción** (solo si pasan las pruebas de estrés)
7. **Push a Registry**
8. **Deploy a Producción** (manual)

## 📋 Requisitos Previos

### En el Servidor Jenkins:
1. **Jenkins** (versión 2.400+)
2. **Docker** instalado y configurado
3. **Docker Compose** (v2.0+)
4. **Python 3.9+** instalado
5. **Node.js 18+** y npm
6. **Plugins de Jenkins necesarios:**
   - Docker Pipeline
   - Git Plugin
   - Pipeline Plugin
   - Credentials Plugin
   - HTML Publisher Plugin (para reportes)
   - JUnit Plugin (para resultados de tests)
   - Blue Ocean (opcional, para mejor visualización)

### Credenciales necesarias en Jenkins:
- `dockerhub-credentials`: Credenciales de Docker Hub para push de imágenes

## 🚀 Configuración Inicial

### 1. Configurar Jenkins

```bash
# Instalar plugins necesarios
# Ir a: Manage Jenkins > Manage Plugins > Available
# Buscar e instalar: Docker Pipeline, Git Plugin, Pipeline, HTML Publisher, JUnit
```

### 2. Configurar Credenciales de Docker Hub

```
1. Ir a: Manage Jenkins > Manage Credentials
2. Add Credentials
   - Kind: Username with password
   - ID: dockerhub-credentials
   - Username: tu-usuario-dockerhub
   - Password: tu-token-dockerhub
```

### 3. Crear el Job de Pipeline

```
1. New Item > Pipeline
2. Nombre: athletics-module-pipeline
3. En Pipeline section:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: <tu-repositorio>
   - Branch: */main (o tu rama principal)
   - Script Path: ci/jenkins/Jenkinsfile
```

## 📁 Estructura del Pipeline

El pipeline está dividido en las siguientes etapas secuenciales:

### 1. **Checkout** 🔄
- Clona el repositorio
- Obtiene el commit ID corto

### 2. **Environment Setup** ⚙️
- Configura las variables de entorno
- Muestra información del build

### 3. **Unit Tests - Backend** 🧪
- Ejecuta `pytest -c ./tests/pytest.ini`
- Genera reportes de coverage en XML y HTML
- Publica resultados JUnit
- **Comando**: `pytest -c ./tests/pytest.ini --verbose`

### 4. **Unit Tests - Frontend** 🧪
- Ejecuta tests con Vitest
- Genera reportes verbose
- Publica reportes de coverage
- **Comando**: `npm run test -- --run --reporter=verbose`

### 5. **SonarQube Analysis** 🔍
- Inicia SonarQube automáticamente (si no está corriendo)
- Espera a que SonarQube esté listo
- Ejecuta análisis de código
- Verifica Quality Gate (sin bloquear)
- **Totalmente automático, no requiere intervención manual**

### 6. **Integration Tests** 🔗
- Ejecuta `pytest -c ci/integration_test/pytest.ini`
- Pruebas de integración end-to-end
- Genera reportes separados

### 7. **Build Images - Development** 🏗️
- Construye imágenes con ENV=development
- Backend: `athletics-fastapi:dev`
- Frontend: `athletics-vite-ui:dev`
- Usa configuración de desarrollo

### 8. **Deploy Dev & Stress Tests** 🔥
- Despliega entorno de desarrollo con docker-compose
- Espera a que servicios estén listos
- Puebla base de datos con datos de prueba
- **Ejecuta pruebas de carga automáticamente**
- **Ejecuta pruebas de estrés**
- **SI FALLAN**: Pipeline se detiene aquí
- **SI PASAN**: Continúa al siguiente stage

### 9. **Build Images - Production** 🏗️
- **Solo se ejecuta si pasaron las pruebas de estrés**
- Limpia entorno de desarrollo
- Elimina imágenes de desarrollo
- Construye imágenes con ENV=production
- Backend: `athletics-fastapi:latest`
- Frontend: `athletics-vite-ui:latest`
- Usa configuración de producción

### 10. **Push Production Images** 📤
- **Solo si pasaron las pruebas de estrés**
- Solo en ramas main/master/develop
- Push a Docker Hub con tags de versión
- Tags: `:latest` y `:build-number`

### 11. **Deploy to Production** 🚀
- **Solo si pasaron las pruebas de estrés**
- Solo en rama main/master
- **Requiere confirmación manual**
- Usa docker-compose.prod.yml
- Health checks post-deployment

## 🔧 Variables de Entorno

### Variables configurables en el Jenkinsfile:

```groovy
environment {
    // Registry
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    
    // Imágenes
    BACKEND_IMAGE = 'athletics-fastapi'
    FRONTEND_IMAGE = 'athletics-vite-ui'
    
    // Build args
    BACKEND_PORT = '8080'
    WORKERS = '4'
    ENV_TYPE = 'production'
}
```

### Variables para Build del Backend:
- `APPLICATION_PORT`: Puerto de la aplicación (default: 8080)
- `WORKERS`: Número de workers de Uvicorn (default: 4)
- `ENV`: Entorno (development/production)

### Variables para Build del Frontend:
- `VITE_API_URL`: URL del backend API
- `NODE_ENV`: Entorno de Node (development/production)

## 📦 Construcción de Imágenes

### Backend (FastAPI)

```bash
# Build manual con variables
docker build \
  --build-arg APPLICATION_PORT=8080 \
  --build-arg WORKERS=4 \
  --build-arg ENV=production \
  -t athletics-fastapi:latest \
  ./athletics_fastapi
```

### Frontend (Vite/React)

```bash
# Build manual con variables
docker build \
  --build-arg VITE_API_URL=http://localhost:8080 \
  --build-arg NODE_ENV=production \
  -t athletics-vite-ui:latest \
  ./athletics_vite_ui
```

## 🎯 Estrategia de Branching

El pipeline está configurado para diferentes comportamientos según la rama:

| Rama | Tests | Build | Push | Deploy |
|------|-------|-------|------|--------|
| **feature/** | ✅ | ✅ | ❌ | ❌ |
| **develop** | ✅ | ✅ | ✅ | ✅ Auto (Dev) |
| **main/master** | ✅ | ✅ | ✅ | ⏸️ Manual (Prod) |

## 🔐 Seguridad

### Multi-stage Builds
- Reduce tamaño de imágenes finales
- Separa dependencias de build de runtime
- No incluye herramientas de compilación en producción

### Non-root User
- Las imágenes ejecutan con usuario no-root (uid 1000)
- Mejora la seguridad del contenedor

### Security Scanning
- Trivy escanea vulnerabilidades
- Pipeline falla en vulnerabilidades CRITICAL (opcional)

### .dockerignore
- Evita copiar archivos sensibles
- Reduce contexto de build
- Optimiza tiempo de construcción

## 📊 Monitoreo y Logs

### Ver logs del pipeline:
```bash
# En Jenkins UI
Blue Ocean > Pipeline > Build #X > Logs
```

### Ver logs de contenedores:
```bash
# Backend
docker logs fastapi-app -f

# Frontend
docker logs vite-ui -f
```

## 🐛 Troubleshooting

### Error: "Cannot connect to Docker daemon"
```bash
# Verificar que Jenkins tenga permisos
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Error: "Permission denied" en scripts
```bash
# Dar permisos a entrypoint
chmod +x athletics_fastapi/entrypoint.sh
```

### Error en push de imágenes
```bash
# Verificar credenciales
docker login
# Verificar que el ID de credenciales sea correcto en Jenkinsfile
```

### Build lento
```bash
# Usar caché de Docker
# Asegurarse de que .dockerignore está configurado
# Considerar usar BuildKit
export DOCKER_BUILDKIT=1
```

## 🔄 Actualización de Variables de Entorno

### Para cambiar variables en Runtime (sin rebuild):

```bash
# Editar docker-compose.yml
# Cambiar las variables en la sección environment
# Reiniciar servicios
docker-compose up -d
```

### Para cambiar variables en Build Time:

```bash
# Editar Jenkinsfile
# Cambiar las variables en la sección environment
# Hacer commit y push
# Jenkins reconstruirá automáticamente
```

## 📈 Mejoras Futuras

- [ ] Integración con SonarQube para análisis de código
- [ ] Notificaciones a Slack/Teams
- [ ] Deploy a Kubernetes
- [ ] Smoke tests automáticos post-deploy
- [ ] Rollback automático en caso de fallo
- [ ] Gestión de secretos con Vault
- [ ] Cache de dependencias entre builds

## 📝 Notas

- El pipeline usa `sh` por defecto (Linux/macOS)
- Para Windows, cambiar `sh` por `bat` o `powershell`
- Los healthchecks esperan endpoints `/health` en backend y frontend
- El deploy a producción requiere confirmación manual
