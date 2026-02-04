# 🚀 Guía de Deployment

Esta guía cubre el proceso completo de deployment del proyecto Athletics Module utilizando Docker y Jenkins para CI/CD.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Variables de Entorno](#variables-de-entorno)
- [Build de Imágenes](#build-de-imágenes)
- [Deployment Local](#deployment-local)
- [Deployment en Producción](#deployment-en-producción)
- [Jenkins CI/CD](#jenkins-cicd)
- [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

### Para Desarrollo:
- Docker Desktop (Windows/Mac) o Docker Engine (Linux)
- Docker Compose v2.0+
- Git

### Para Producción:
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Docker Engine 20.10+
- Docker Compose v2.0+
- Jenkins (opcional, para CI/CD)
- Dominio configurado (para HTTPS)
- Certificados SSL/TLS

## 🌍 Variables de Entorno

### Configuración por Entorno

El proyecto utiliza diferentes archivos `.env` según el entorno:

```
.env.example              # Plantilla para docker-compose
athletics_fastapi/
  .env.example            # Plantilla backend
  .env.development        # Development backend
  .env.production         # Production backend
athletics_vite_ui/
  .env.example            # Plantilla frontend
  .env.development        # Development frontend
  .env.production         # Production frontend
```

### Configurar Variables de Entorno

1. **Copiar archivos de ejemplo:**

```bash
# Root (para docker-compose)
cp .env.example .env

# Backend
cp athletics_fastapi/.env.example athletics_fastapi/.env

# Frontend
cp athletics_vite_ui/.env.example athletics_vite_ui/.env
```

2. **Editar valores sensibles:**

```bash
# Editar .env principal
nano .env

# Actualizar:
# - Passwords de bases de datos
# - Secretos JWT
# - Credenciales de email
# - URLs de producción
```

### Variables Críticas de Producción

⚠️ **IMPORTANTE**: Cambiar estos valores antes de deployment en producción:

```env
# Bases de datos
MARIADB_ROOT_PASSWORD=
MARIADB_PASSWORD=
POSTGRES_PASSWORD=
REDIS_PASSWORD=

# JWT
JWT_SECRET=

# Spring Boot
SPRING_OTHERS_KEY=

# API URLs
VITE_API_URL=https://api.yourdomain.com
```

## 🏗️ Build de Imágenes

### Método 1: Script Automatizado (Recomendado)

**Linux/Mac:**
```bash
chmod +x build.sh

# Build todo
./build.sh --all

# Solo backend
./build.sh --backend

# Solo frontend
./build.sh --frontend

# Build y push a registry
DOCKER_USERNAME=tu-usuario \
DOCKER_PASSWORD=tu-token \
IMAGE_TAG=v1.0.0 \
./build.sh --all --push
```

**Windows:**
```powershell
# Build todo
.\build.bat --all

# Solo backend
.\build.bat --backend

# Solo frontend
.\build.bat --frontend

# Build y push a registry
set DOCKER_USERNAME=tu-usuario
set DOCKER_PASSWORD=tu-token
set IMAGE_TAG=v1.0.0
.\build.bat --all --push
```

### Método 2: Docker Build Manual

**Backend:**
```bash
docker build \
  --build-arg APPLICATION_PORT=8080 \
  --build-arg WORKERS=4 \
  --build-arg ENV=production \
  -t athletics-fastapi:latest \
  ./athletics_fastapi
```

**Frontend:**
```bash
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg NODE_ENV=production \
  -t athletics-vite-ui:latest \
  ./athletics_vite_ui
```

### Método 3: Docker Compose

```bash
# Build con docker-compose (development)
docker-compose -f docker-compose.dev.yml build

# Build con docker-compose (production)
docker-compose -f docker-compose.prod.yml build
```

## 💻 Deployment Local

### 1. Configurar Variables

```bash
# Usar valores de desarrollo
cp athletics_fastapi/.env.development athletics_fastapi/.env
cp athletics_vite_ui/.env.development athletics_vite_ui/.env
```

### 2. Iniciar Servicios

```bash
# Build y start
docker-compose -f docker-compose.dev.yml up --build -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Ver estado
docker-compose -f docker-compose.dev.yml ps
```

### 3. Verificar Servicios

```bash
# Backend health
curl http://localhost:8080/health

# Frontend
curl http://localhost:5173/health

# Spring Boot
curl http://localhost:8096/actuator/health
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/docs
- **Users API**: http://localhost:8096

## 🌐 Deployment en Producción

### Opción 1: Docker Compose (Servidor Único)

#### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

#### 2. Clonar Repositorio

```bash
cd /opt
sudo git clone https://github.com/tu-usuario/sports-athletics-module.git
cd sports-athletics-module
```

#### 3. Configurar Variables

```bash
# Copiar y editar variables
sudo cp .env.example .env
sudo nano .env

# Configurar backend
sudo cp athletics_fastapi/.env.production athletics_fastapi/.env
sudo nano athletics_fastapi/.env

# Configurar frontend
sudo cp athletics_vite_ui/.env.production athletics_vite_ui/.env
sudo nano athletics_vite_ui/.env
```

#### 4. Deploy

```bash
# Build y start con compose de producción
sudo docker compose -f docker-compose.prod.yml up --build -d

# Verificar logs
sudo docker compose -f docker-compose.prod.yml logs -f

# Verificar estado
sudo docker compose -f docker-compose.prod.yml ps
```

#### 5. Configurar Nginx Reverse Proxy (Opcional)

```nginx
# /etc/nginx/sites-available/athletics

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/athletics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Opción 2: Docker Swarm (Cluster)

```bash
# Inicializar Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml athletics

# Ver servicios
docker stack services athletics

# Ver logs
docker service logs athletics_fastapi-app -f
```

### Opción 3: Kubernetes

Ver documentación en `k8s/README.md` (próximamente)

## 🤖 Jenkins CI/CD

### 1. Instalación de Jenkins

```bash
# Instalar Java
sudo apt install openjdk-11-jdk -y

# Agregar repositorio Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Instalar Jenkins
sudo apt update
sudo apt install jenkins -y

# Iniciar Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Obtener password inicial
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Configuración de Jenkins

Ver guía completa en [JENKINS_SETUP.md](JENKINS_SETUP.md)

1. Acceder a http://your-server:8080
2. Instalar plugins recomendados
3. Configurar credenciales de Docker Hub
4. Crear Pipeline Job
5. Configurar webhook de GitHub

### 3. Variables de Jenkins

Configurar en Jenkins → Manage Jenkins → Configure System:

```
DOCKER_REGISTRY=docker.io
BACKEND_PORT=8080
WORKERS=4
VITE_API_URL=https://api.yourdomain.com
```

### 4. Webhooks de GitHub

```
1. GitHub → Repository → Settings → Webhooks
2. Payload URL: http://jenkins-server:8080/github-webhook/
3. Content type: application/json
4. Events: Just the push event
5. Active: ✓
```

## 🔄 Actualizaciones y Rollback

### Actualizar Servicios

```bash
# Pull nuevas imágenes
docker compose -f docker-compose.prod.yml pull

# Recrear servicios
docker compose -f docker-compose.prod.yml up -d

# Verificar
docker compose -f docker-compose.prod.yml ps
```

### Rollback

```bash
# Ver imágenes disponibles
docker images | grep athletics

# Cambiar tag en docker-compose.prod.yml
IMAGE_TAG=previous-version

# Recrear servicios
docker compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo

### Logs

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Logs específicos
docker compose logs -f fastapi-app
docker compose logs -f frontend
docker compose logs -f postgres

# Últimas 100 líneas
docker compose logs --tail=100 fastapi-app
```

### Métricas

```bash
# Uso de recursos
docker stats

# Estado de servicios
docker compose ps

# Inspeccionar contenedor
docker inspect fastapi-app
```

### Health Checks

```bash
# Backend
curl http://localhost:8080/health

# Frontend
curl http://localhost:80/health

# Database
docker exec postgres pg_isready -U postgres
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que Postgres esté running
docker compose ps postgres

# Ver logs de Postgres
docker compose logs postgres

# Verificar conectividad
docker exec fastapi-app ping postgres

# Revisar variables de entorno
docker exec fastapi-app env | grep DATABASE
```

### Error: "Port already in use"

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :8080

# Cambiar puerto en .env
BACKEND_PORT=8081

# Recrear servicios
docker compose up -d
```

### Error: "Build failed"

```bash
# Limpiar cache de Docker
docker builder prune -a

# Build sin cache
docker compose build --no-cache

# Verificar logs de build
docker compose build --progress=plain
```

### Servicios no se comunican

```bash
# Verificar red de Docker
docker network ls
docker network inspect sports-athletics-module_app-network

# Recrear red
docker compose down
docker compose up -d
```

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Verificar logs de los servicios
3. Crear un issue en GitHub
4. Contactar al equipo de desarrollo
