# Módulo de Deportes y Atletismo - UNL

Este proyecto es una plataforma para la gestión de deportes y atletismo, construida con **FastAPI** (Backend) y **React/Vite** (Frontend).

## 📋 Prerrequisitos

Para ejecutar este proyecto, asegúrate de tener instalado:

1.  **Python 3.12**: [Descargar Python](https://www.python.org/downloads/)
    *   Asegúrate de marcar "Add Python to PATH" durante la instalación.
2.  **Docker Desktop**: [Descargar Docker](https://www.docker.com/products/docker-desktop/)
    *   Debe estar instalado y **ejecutándose**.
3.  **PowerShell**: (Viene instalado por defecto en Windows).

## 🚀 Instalación y Ejecución

El proyecto incluye un script de automatización (`ci/windows.ps1`) que se encarga de:
1.  Crear entorno virtual (Venv) e instalar dependencias.
2.  Ejecutar tests unitarios.
3.  Levantar los servicios con Docker (PostgreSQL, Redis, API, etc.).
4.  Aplicar migraciones de base de datos automáticamente.

### Pasos:

1.  Abre una terminal (PowerShell) en la raíz del proyecto.
2.  Ejecuta el script de CI/CD:

    ```powershell
    .\ci\windows.ps1
    ```

Si todo sale bien, verás un mensaje de **"CI/CD FINALIZADO EXITOSAMENTE"** y los servicios estarán corriendo en Docker.

## ⚙️ Variables de Entorno

El sistema utiliza un archivo `docker-compose.yml` que ya tiene pre-configuradas muchas variables para el entorno de desarrollo local.

Sin embargo, para funcionalidades sensibles (como el envío de correos o integración con otros servicios), necesitas definir las siguientes variables en un archivo `.env` dentro de `athletics_fastapi/` o tenerlas configuradas en tu sistema:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **EMAIL_HOST_USER** | Correo origen para notificaciones | `tu_correo@gmail.com` |
| **EMAIL_HOST_PASSWORD** | Contraseña de aplicación del correo | `abcd 1234 efgh 5678` |
| **USERS_API_EMAIL** | Email para autenticarse con microservicio Users | `admin@unl.edu.ec` |
| **USERS_API_PASSWORD** | Password para microservicio Users | `password_seguro` |

### Otras Variables (Configurables en docker-compose)

Estas variables ya tienen valores por defecto en `docker-compose.yml` para desarrollo, pero pueden modificarse si es necesario:

- `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` (PostgreSQL)
- `JWT_SECRET` (Clave secreta para tokens)
- `APPLICATION_PORT` (Puerto de la API, por defecto 8080)

## 🛠️ Solución de Problemas

- **Error de Docker**: Asegúrate de que Docker Desktop esté abierto.
- **Error de permisos**: Ejecuta PowerShell como Administrador.
- **Puerto Ocupado**: Si el puerto `8080`, `5432` o `6379` está ocupado, detén los servicios que los usen o modifica el `docker-compose.yml`.
