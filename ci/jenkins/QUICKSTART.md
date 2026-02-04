# 🚀 Jenkins Automático - Inicio Rápido

## ⚡ Script de Inicio Automático

### Windows PowerShell

```powershell
# Ir al directorio de Jenkins
cd ci\jenkins

# IMPORTANTE: Configurar credenciales de Docker Hub ANTES de iniciar
# Opción 1: Editar .env.jenkins manualmente
notepad .env.jenkins

# Opción 2: Crear desde la terminal
@"
DOCKERHUB_USERNAME=tu-usuario-dockerhub
DOCKERHUB_PASSWORD=tu-token-dockerhub
JENKINS_ADMIN_USER=admin
JENKINS_ADMIN_PASSWORD=admin123
"@ | Out-File -FilePath .env.jenkins -Encoding UTF8

# Iniciar servicios
docker-compose -f docker-compose-jenkins.yml up --build -d

# Ver logs de inicialización
docker-compose -f docker-compose-jenkins.yml logs -f jenkins
```

### Linux/Mac

```bash
cd ci/jenkins

# Configurar credenciales
cat > .env.jenkins << EOF
DOCKERHUB_USERNAME=tu-usuario-dockerhub
DOCKERHUB_PASSWORD=tu-token-dockerhub
JENKINS_ADMIN_USER=admin
JENKINS_ADMIN_PASSWORD=admin123
EOF

# Iniciar
docker-compose -f docker-compose-jenkins.yml up --build -d

# Ver logs
docker-compose -f docker-compose-jenkins.yml logs -f jenkins
```

---

## ✅ ¿Qué se configura automáticamente?

### 1. **Jenkins**
- ✅ Usuario admin creado (admin/admin123)
- ✅ Plugins instalados automáticamente
- ✅ Configuration as Code activo
- ✅ Skip setup wizard

### 2. **Pipeline Job**
- ✅ Job "athletics-pipeline" creado automáticamente
- ✅ Configurado para leer Jenkinsfile desde SCM
- ✅ Polling cada 5 minutos (H/5 * * * *)
- ✅ Branches: main y develop

### 3. **Credenciales**
- ✅ Docker Hub credentials configuradas (desde .env.jenkins)
- ✅ ID: dockerhub-credentials

### 4. **SonarQube**
- ✅ Container iniciado automáticamente
- ✅ Base de datos PostgreSQL configurada
- ✅ Disponible en http://localhost:9000

### 5. **Portainer**
- ✅ Dashboard visual para containers
- ✅ Disponible en https://localhost:9443

---

## 🔐 Credenciales Por Defecto

| Servicio | URL | Usuario | Password |
|----------|-----|---------|----------|
| **Jenkins** | http://localhost:8081 | admin | admin123 |
| **SonarQube** | http://localhost:9000 | admin | admin |
| **Portainer** | https://localhost:9443 | - | (crear en primer acceso) |

---

## 📋 Verificación Post-Inicio

### 1. Verificar que Jenkins inició correctamente

```powershell
# Ver estado
docker-compose -f docker-compose-jenkins.yml ps

# Debe mostrar todos los servicios como "Up"
```

### 2. Acceder a Jenkins

```
http://localhost:8081
```

**Login:**
- Usuario: `admin`
- Password: `admin123`

### 3. Verificar Pipeline Creado

```
1. En Jenkins, ir a la página principal
2. Deberías ver el job: "athletics-pipeline" 🏃
3. Click en el job
4. Verificar que la configuración apunta a ci/jenkins/Jenkinsfile
```

### 4. Ejecutar Primera Build

```
1. Click en "Build Now"
2. Ver Console Output
3. Verificar que las etapas ejecutan correctamente
```

---

## 🎯 Flujo Automático

### Primera Vez (Build Inicial)

```
docker-compose -f docker-compose-jenkins.yml up --build -d
```

Esperar ~2 minutos para inicialización.

### Builds Posteriores

El pipeline se ejecuta **automáticamente** cuando:
- ✅ Haces push al repositorio (si configuraste webhooks)
- ✅ Cada 5 minutos verifica cambios (polling)
- ✅ O puedes ejecutar manualmente con "Build Now"

---

## 🔧 Configuración Avanzada

### Cambiar Credenciales de Admin

Editar `.env.jenkins`:

```bash
JENKINS_ADMIN_USER=mi-usuario
JENKINS_ADMIN_PASSWORD=mi-password-seguro
```

Reiniciar:

```powershell
docker-compose -f docker-compose-jenkins.yml down
docker-compose -f docker-compose-jenkins.yml up --build -d
```

### Configurar Webhooks de GitHub

```
1. En tu repo de GitHub → Settings → Webhooks
2. Add webhook
3. Payload URL: http://tu-servidor:8081/github-webhook/
4. Content type: application/json
5. Events: Just the push event
6. Active: ✓
```

### Agregar Más Credenciales

Editar `jenkins.yaml` y agregar en la sección `credentials`:

```yaml
- usernamePassword:
    scope: GLOBAL
    id: "github-credentials"
    username: "${GITHUB_USERNAME}"
    password: "${GITHUB_TOKEN}"
    description: "GitHub credentials"
```

Agregar las variables en `.env.jenkins`:

```bash
GITHUB_USERNAME=tu-usuario
GITHUB_TOKEN=tu-token
```

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```powershell
# Todos los servicios
docker-compose -f docker-compose-jenkins.yml logs -f

# Solo Jenkins
docker-compose -f docker-compose-jenkins.yml logs -f jenkins

# Solo SonarQube
docker-compose -f docker-compose-jenkins.yml logs -f sonarqube
```

### Portainer (Recomendado)

```
https://localhost:9443
```

Interfaz visual completa para monitorear containers.

---

## 🛑 Detener Servicios

### Detener pero mantener datos

```powershell
docker-compose -f docker-compose-jenkins.yml down
```

### Limpiar TODO (incluyendo volúmenes)

```powershell
docker-compose -f docker-compose-jenkins.yml down -v
```

⚠️ **Cuidado:** `-v` elimina TODOS los datos (configuración, builds, etc.)

---

## 🔍 Troubleshooting

### Jenkins no inicia o está en loop

```powershell
# Ver logs para identificar el error
docker-compose -f docker-compose-jenkins.yml logs jenkins

# Problemas comunes:
# 1. plugins.txt tiene un plugin inválido
# 2. jenkins.yaml tiene sintaxis incorrecta
# 3. No hay suficiente memoria

# Solución: Verificar logs y ajustar configuración
```

### Pipeline no se crea automáticamente

```powershell
# Verificar que el script de inicialización corrió
docker exec jenkins-server ls -la /usr/share/jenkins/ref/init.groovy.d/

# Ver logs del script
docker-compose -f docker-compose-jenkins.yml logs jenkins | Select-String "Creando Pipeline"

# Si no se ejecutó, forzar rebuild
docker-compose -f docker-compose-jenkins.yml down
docker-compose -f docker-compose-jenkins.yml up --build -d
```

### Credenciales de Docker Hub no funcionan

```powershell
# Verificar que las variables están cargadas
docker exec jenkins-server printenv | Select-String "DOCKERHUB"

# Si no aparecen, verificar .env.jenkins
cat .env.jenkins

# Reiniciar para recargar variables
docker-compose -f docker-compose-jenkins.yml restart jenkins
```

### Error "Cannot connect to Docker daemon"

```powershell
# Verificar que Docker Desktop está corriendo
docker ps

# En Windows, habilitar exposición del daemon
# Docker Desktop → Settings → General → "Expose daemon on tcp://localhost:2375"

# Reiniciar Jenkins
docker-compose -f docker-compose-jenkins.yml restart jenkins
```

---

## 📦 Estructura de Archivos

```
ci/jenkins/
├── docker-compose-jenkins.yml    # Compose principal
├── Dockerfile.jenkins            # Jenkins con config automática
├── jenkins.yaml                  # Configuration as Code
├── plugins.txt                   # Lista de plugins
├── .env.jenkins                  # Variables de entorno
├── init-scripts/
│   └── 01-create-pipeline.groovy # Script creación de job
└── QUICKSTART.md                 # Esta guía
```

---

## 🚀 Próximos Pasos

1. ✅ Jenkins configurado automáticamente
2. ✅ Pipeline job creado: "athletics-pipeline"
3. ✅ Credenciales configuradas
4. ⏭️ Ejecutar primera build manualmente
5. ⏭️ Verificar que todas las etapas pasan
6. ⏭️ Configurar webhooks para builds automáticos
7. ⏭️ Revisar reportes en SonarQube

---

## 📚 Documentación Completa

- **Pipeline completo**: [PIPELINE_FLOW.md](PIPELINE_FLOW.md)
- **Guía detallada de Jenkins**: [JENKINS_SETUP.md](JENKINS_SETUP.md)
- **Testing local**: [TEST_PIPELINE.md](TEST_PIPELINE.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ⚡ Comandos Rápidos

```powershell
# Ver estado
docker-compose -f docker-compose-jenkins.yml ps

# Ver logs
docker-compose -f docker-compose-jenkins.yml logs -f jenkins

# Reiniciar Jenkins
docker-compose -f docker-compose-jenkins.yml restart jenkins

# Detener todo
docker-compose -f docker-compose-jenkins.yml down

# Limpiar y reiniciar desde cero
docker-compose -f docker-compose-jenkins.yml down -v
docker-compose -f docker-compose-jenkins.yml up --build -d
```

---

## 🎉 ¡Listo!

Tu entorno Jenkins CI/CD está completamente automatizado.

Solo necesitas:
1. Configurar `.env.jenkins` con tus credenciales de Docker Hub
2. Ejecutar `docker-compose -f docker-compose-jenkins.yml up --build -d`
3. Acceder a http://localhost:8081 (admin/admin123)
4. ¡El pipeline está listo para ejecutarse!
