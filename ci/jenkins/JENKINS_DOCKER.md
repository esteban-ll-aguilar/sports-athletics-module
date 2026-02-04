# 🐳 Jenkins en Docker - Guía Rápida

## 🚀 Inicio Rápido

⚡ **NUEVO: Configuración 100% Automática** - Ver [QUICKSTART.md](QUICKSTART.md)

```powershell
# 1. Configurar credenciales de Docker Hub
notepad .env.jenkins

# 2. Iniciar todo
docker-compose -f docker-compose-jenkins.yml up --build -d

# 3. Acceder a Jenkins
# URL: http://localhost:8081
# Usuario: admin
# Password: admin123
```

El sistema automáticamente:
- ✅ Inicia Jenkins con configuración preconfigurada
- ✅ Instala todos los plugins necesarios
- ✅ Crea el usuario admin (admin/admin123)
- ✅ Configura credenciales de Docker Hub
- ✅ **Crea el pipeline "athletics-pipeline" automáticamente**
- ✅ Configura Docker-in-Docker para builds
- ✅ Inicia SonarQube para análisis de código
- ✅ Inicia Portainer para gestión visual de containers
- ✅ **NO requiere configuración manual**

---

## 📦 Servicios Incluidos

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|--------------|
| **Jenkins** | 8081 | http://localhost:8081 | Ver password en consola |
| **SonarQube** | 9000 | http://localhost:9000 | admin / admin |
| **Portainer** | 9443 | https://localhost:9443 | Crear en primer acceso |

---

## ✅ Verificación Post-Inicio

### 1. Abrir Jenkins

```
http://localhost:8081
```

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin123`

> ⚠️ **Nota:** No verás el wizard de configuración inicial, todo está preconfigurado.

### 2. Verificar Pipeline Creado

```
1. En la página principal deberías ver: "athletics-pipeline" 🏃
2. Click en el pipeline
3. Verificar que está configurado correctamente
4. Verificar que apunta a ci/jenkins/Jenkinsfile
```

### 3. Verificar Credenciales de Docker Hub

```
1. Manage Jenkins → Manage Credentials
2. System → Global credentials
3. Deberías ver "dockerhub-credentials"
```

Si no aparecen, verifica que configuraste `.env.jenkins` correctamente.

### 4. Ejecutar Primera Build

```
1. En el pipeline "athletics-pipeline"
2. Click en "Build Now"
3. Ver progreso en Console Output
4. Verificar que cada etapa ejecuta correctamente
```

### 5. Configurar Credenciales de Docker Hub (si no están)

Solo si no detectó las credenciales del `.env.jenkins`:

```
1. Manage Jenkins → Manage Credentials
2. (global) → Add Credentials
3. Kind: Username with password
4. ID: dockerhub-credentials
5. Username: tu-usuario-dockerhub
6. Password: tu-token-dockerhub
7. Save
```

---

## 📊 Configurar SonarQube

### 1. Acceder a SonarQube

```
http://localhost:9000
Usuario: admin
Password: admin
```

### 2. Cambiar Password

En primer login te pedirá cambiar el password.

### 3. Crear Token

```
1. Administration → Security → Users
2. Click en "tokens" del usuario admin
3. Generate Token
4. Nombre: jenkins
5. Copiar el token generado
```

### 4. Configurar en Jenkins (Opcional)

```
1. Manage Jenkins → Configure System
2. SonarQube servers
3. Name: SonarQube
4. Server URL: http://sonarqube:9000
5. Server authentication token: (pegar token)
6. Save
```

---

## 🐳 Gestión de Containers

### Ver Logs

```powershell
# Todos los servicios
docker-compose -f docker-compose-jenkins.yml logs -f

# Solo Jenkins
docker-compose -f docker-compose-jenkins.yml logs -f jenkins

# Solo SonarQube
docker-compose -f docker-compose-jenkins.yml logs -f sonarqube
```

### Detener Servicios

```powershell
docker-compose -f docker-compose-jenkins.yml down
```

### Detener y Limpiar Todo

```powershell
docker-compose -f docker-compose-jenkins.yml down -v
```

### Reiniciar Servicios

```powershell
docker-compose -f docker-compose-jenkins.yml restart
```

### Ver Estado

```powershell
docker-compose -f docker-compose-jenkins.yml ps
```

---

## 🔍 Troubleshooting

### Error: "Port 8081 already in use"

```powershell
# Cambiar puerto en docker-compose-jenkins.yml
ports:
  - "8082:8080"  # Usar 8082 en lugar de 8081
```

### Error: "Cannot connect to Docker daemon"

En Windows:
1. Asegúrate de que Docker Desktop esté corriendo
2. En Docker Desktop → Settings → General → "Expose daemon on tcp://localhost:2375"

### Error: "Jenkins no inicia"

```powershell
# Ver logs
docker-compose -f docker-compose-jenkins.yml logs jenkins

# Verificar recursos de Docker
docker stats

# Reiniciar
docker-compose -f docker-compose-jenkins.yml restart jenkins
```

### Error: "Out of memory"

Aumentar memoria de Docker:
1. Docker Desktop → Settings → Resources
2. Memory: Aumentar a 8GB+
3. Apply & Restart

### Error: "SonarQube no inicia"

```powershell
# SonarQube requiere ajuste en Linux
# En Windows/Mac no es necesario

# Ver logs
docker-compose -f docker-compose-jenkins.yml logs sonarqube
```

---

## 📂 Estructura de Volúmenes

Los datos se guardan en volúmenes Docker:

```
jenkins_home          → Configuración de Jenkins
jenkins-docker-certs  → Certificados Docker
sonarqube_data        → Datos de SonarQube
sonar_db_data         → Base de datos de SonarQube
portainer_data        → Configuración de Portainer
```

### Backup de Jenkins

```powershell
# Exportar volumen
docker run --rm -v jenkins_home:/data -v ${PWD}:/backup ubuntu tar czf /backup/jenkins-backup.tar.gz /data

# Restaurar
docker run --rm -v jenkins_home:/data -v ${PWD}:/backup ubuntu tar xzf /backup/jenkins-backup.tar.gz -C /
```

---

## 🎯 Testing del Pipeline

Una vez Jenkins esté configurado:

### 1. Primera Ejecución Manual

```
1. En Jenkins, click en tu pipeline job
2. Build Now
3. Ver Console Output
4. Verificar que todas las etapas pasen
```

### 2. Activar Webhooks (Opcional)

Para builds automáticos al hacer push:

```
1. En Jenkins: Configure → Build Triggers
2. Marcar "GitHub hook trigger for GITScm polling"
3. En GitHub: Settings → Webhooks → Add webhook
4. URL: http://tu-servidor:8081/github-webhook/
5. Content type: application/json
6. Events: Just the push event
```

---

## 🔐 Seguridad

### Cambiar Password de Jenkins

```
1. Manage Jenkins → Manage Users
2. Click en tu usuario
3. Configure → Password
```

### Habilitar HTTPS (Producción)

Para producción, usa un reverse proxy (Nginx):

```nginx
server {
    listen 443 ssl;
    server_name jenkins.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📈 Monitoreo

### Portainer (Recomendado)

```
https://localhost:9443
```

Interfaz visual para:
- Ver containers corriendo
- Logs en tiempo real
- Estadísticas de recursos
- Gestión de volúmenes

### Docker CLI

```powershell
# Uso de CPU y memoria
docker stats

# Ver todos los containers
docker ps -a

# Espacio en disco
docker system df
```

---

## 🚀 Próximos Pasos

1. ✅ Jenkins configurado y corriendo
2. ✅ Pipeline job creado
3. ✅ Credenciales de Docker Hub configuradas
4. ⏭️ Hacer push a tu repositorio
5. ⏭️ Ver el pipeline ejecutarse automáticamente
6. ⏭️ Revisar reportes en Jenkins
7. ⏭️ Verificar análisis en SonarQube

---

## 🛑 Detener Todo

Cuando termines de probar:

```powershell
# Detener servicios pero mantener datos
docker-compose -f docker-compose-jenkins.yml down

# Detener y eliminar TODO (incluyendo datos)
docker-compose -f docker-compose-jenkins.yml down -v
```

---

## 📚 Recursos Adicionales

- **Jenkins**: [JENKINS_SETUP.md](JENKINS_SETUP.md)
- **Pipeline**: [PIPELINE_FLOW.md](PIPELINE_FLOW.md)
- **Testing**: [TEST_PIPELINE.md](TEST_PIPELINE.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
