# 🎉 Configuración Completada - Docker Compose

## ✅ Resumen de Configuración

Se han configurado **dos archivos Docker Compose** para separar las responsabilidades:

1. **`docker-compose.yml`** (raíz) - Backend, Frontend y sus dependencias
2. **`dc/docker-compose-sonarqube.yml`** - SonarQube (análisis de código)

---

## 📦 Servicios Disponibles

### **Docker Compose Principal (`docker-compose.yml`)**
1. ✅ **PostgreSQL** - Base de datos para FastAPI (puerto 5432)
2. ✅ **MariaDB** - Base de datos para Spring Boot (puerto 3306)
3. ✅ **Redis** - Cache y sesiones (puerto 6379)
4. ✅ **Spring Boot** - Microservicio de usuarios (puerto 8096)
5. ✅ **FastAPI** - API principal (puerto 8080)
6. ✅ **Vite UI** - Frontend (puerto 5173)

### **Docker Compose SonarQube (`dc/docker-compose-sonarqube.yml`)**
7. 🔍 **SonarQube PostgreSQL** - Base de datos para SonarQube
8. 🔍 **SonarQube Server** - Servidor de análisis (puerto 9000)
9. 🔍 **SonarQube Scanner** - Analizador de código

---

## 🚀 Comandos Principales

### **Levantar Backend + Frontend**
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### **Levantar SonarQube (Separado)**
```bash
# Opción 1: Script PowerShell (Recomendado)
cd ci
.\sonarqube.ps1 start

# Opción 2: Docker Compose
cd dc
docker-compose -f docker-compose-sonarqube.yml up -d
```


### **Ver Logs**
```bash
# Backend + Frontend
docker-compose logs -f

# Solo API
docker-compose logs -f api

# Solo Frontend
docker-compose logs -f frontend

# SonarQube (archivo separado)
cd dc
docker-compose -f docker-compose-sonarqube.yml logs -f sonarqube
```

### **Detener Servicios**
```bash
# Detener Backend + Frontend
docker-compose down

# Detener SonarQube
cd dc
docker-compose -f docker-compose-sonarqube.yml down

# Detener y eliminar volúmenes
docker-compose down -v
cd dc
docker-compose -f docker-compose-sonarqube.yml down -v
```


---

## 🌐 Acceso a los Servicios

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:8080 | - |
| **Spring Boot** | http://localhost:8096 | - |
| **SonarQube** | http://localhost:9000 | admin / admin |
| **PostgreSQL (FastAPI)** | localhost:5432 | postgres / 123456 |
| **MariaDB (Spring Boot)** | localhost:3306 | desarrollo / desarrollo |
| **Redis** | localhost:6379 | - |

---

## 📊 Análisis de Código con SonarQube

### **Método 1: Script PowerShell (Recomendado)**
```powershell
cd ci
.\sonarqube.ps1 start    # Iniciar
.\sonarqube.ps1 status   # Ver estado
.\sonarqube.ps1 scan     # Ejecutar análisis
.\sonarqube.ps1 logs     # Ver logs
.\sonarqube.ps1 stop     # Detener
```

### **Método 2: Docker Compose**
```bash
# Iniciar SonarQube
cd dc
docker-compose -f docker-compose-sonarqube.yml up -d

# Ejecutar análisis manual
docker-compose -f docker-compose-sonarqube.yml up sonar-scanner

# Ver estado
docker-compose -f docker-compose-sonarqube.yml ps
```

---

## 🎯 Ventajas de esta Configuración

✅ **Separación de responsabilidades** - Backend/Frontend separado de herramientas de CI
✅ **Gestión independiente** - Puedes levantar solo lo que necesitas
✅ **Comandos simples** - Sin necesidad de profiles complejos
✅ **Networking automático** entre servicios del mismo compose
✅ **Fácil de mantener** y escalar
✅ **Script PowerShell** para gestión simplificada de SonarQube

---

## 📁 Archivos Importantes

```
sports-athletics-module/
├── docker-compose.yml          ⭐ ARCHIVO PRINCIPAL
├── ci/
│   ├── sonar-project.properties   # Configuración de SonarQube
│   ├── sonarqube.ps1              # Script de gestión
│   ├── README.md                  # Documentación detallada
│   └── ESTRUCTURA.md              # Estructura de archivos
├── athletics_fastapi/
│   └── Dockerfile
├── athletics_vite_ui/
│   └── Dockerfile
└── README.md                      # README principal
```

---

## 🔧 Archivos Docker Compose

### **docker-compose.yml** (Raíz del Proyecto)
Contiene los servicios principales de la aplicación:
- Backend FastAPI
- Frontend Vite UI
- Bases de datos (PostgreSQL, MariaDB)
- Redis
- Spring Boot

### **dc/docker-compose-sonarqube.yml** (Herramientas de CI)
Contiene los servicios de análisis de código:
- SonarQube Server
- SonarQube PostgreSQL
- SonarQube Scanner

**Ventaja:** Puedes levantar cada stack de forma independiente según tus necesidades.

---

## 📝 Próximos Pasos

1. **Probar el stack completo:**
   ```bash
   docker-compose up -d
   ```

2. **Verificar que todo funciona:**
   ```bash
   docker-compose ps
   ```

3. **Acceder al frontend:**
   - http://localhost:5173

4. **Probar SonarQube (opcional):**
   ```bash
   cd ci
   .\sonarqube.ps1 start
   ```

5. **Ver logs si hay problemas:**
   ```bash
   docker-compose logs -f
   ```

---

## 🐛 Solución de Problemas

### **Error: Puerto en uso**
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8080

# Cambiar el puerto en docker-compose.yml
ports:
  - "8081:8080"  # Cambiar 8080 a 8081
```

### **Contenedores no inician**
```bash
# Ver logs detallados
docker-compose logs -f [nombre-servicio]

# Reconstruir imágenes
docker-compose build --no-cache
docker-compose up -d
```

### **SonarQube no responde**
```bash
# Esperar 1-2 minutos, luego verificar
cd dc
docker-compose -f docker-compose-sonarqube.yml logs -f sonarqube

# Verificar estado
curl http://localhost:9000/api/system/status
```

---

## 📚 Documentación Adicional

- **Guía completa de SonarQube**: `ci/README.md`
- **Estructura de archivos**: `ci/ESTRUCTURA.md`
- **README principal**: `README.md`

---

¡Todo listo para usar! 🎉
