# Módulo de Deportes y Atletismo - UNL


# Backend

## Requisitos
- Python 3.12
- Docker
- Docker Compose




Para funcionalidades sensibles (como el envío de correos o integración con otros servicios), necesitas definir las siguientes variables en un archivo `.env` dentro de `athletics_fastapi/` o tenerlas configuradas en tu sistema:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **EMAIL_HOST_USER** | Correo origen para notificaciones | `tu_correo@gmail.com` |
| **EMAIL_HOST_PASSWORD** | Contraseña de aplicación del correo | `abcd 1234 efgh 5678` |
| **USERS_API_EMAIL** | Email para autenticarse con microservicio Users | `admin@unl.edu.ec` |
| **USERS_API_PASSWORD** | Password para microservicio Users | `password_seguro` |


El resto de variables estan por defecto, si se quiere se pede cambiar manualmente.

1. Todas se debe ejecutar en la carpeta athletics_fastapi

```bash
cd athletics_fastapi
```

2. Entorno virtual

```bash
# Crear entorno virtual si no existe (opcional, pero recomendado)
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activar entorno 
source venv/bin/activate

```

3. Instalar dependencias

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx
```

4. Ejecutar tests

```bash
pytest tests -v
```

5. Construir e iniciar los servicios
```bash
docker-compose up -d --build
```

### Notas Adicionales

*   Asegúrese de que las variables de entorno necesarias (como las definidas en `.env`) estén configuradas en Jenkins o disponibles en el entorno de ejecución.

---

## 🔍 Análisis de Calidad de Código con SonarQube

Este proyecto incluye configuración completa para análisis de calidad de código usando SonarQube, que analiza tanto el **backend (FastAPI)** como el **frontend (Vite UI)**.

### Inicio Rápido

```bash
# Iniciar SonarQube Server
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml up -d

# Ver logs
docker-compose -f docker-compose-sonarqube.yml logs -f

# Ejecutar análisis manual
docker-compose -f docker-compose-sonarqube.yml up sonar-scanner

# Detener
docker-compose -f docker-compose-sonarqube.yml down
```

### Levantar Backend + Frontend

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### Acceso a los Servicios

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **SonarQube**: http://localhost:9000 (usuario: `admin`, contraseña: `admin`)
- **PostgreSQL (FastAPI)**: localhost:5432
- **MariaDB (Spring Boot)**: localhost:3306
- **Redis**: localhost:6379

### Documentación Completa

Para más detalles sobre configuración, métricas analizadas y solución de problemas, consulta: [`ci/README.md`](ci/README.md)




