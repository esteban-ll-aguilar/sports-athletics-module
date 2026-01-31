# Manual de Configuración del Sistema de Atletismo

Este documento sirve como guía para configurar y ejecutar el sistema de gestión de atletismo, que consta de una API Backend (FastAPI) y una Interfaz Frontend (React/Vite).

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu sistema:

*   **Python 3.10+**: Para ejecutar el backend.
*   **Node.js 18+ y npm**: Para ejecutar el frontend.
*   **PostgreSQL**: Base de datos relacional.
*   **Redis**: Sistema de caché y mensajería (necesario para ciertas funcionalidades del backend).
*   **Git**: Para clonar el repositorio.

---

## 2. Configuración del Backend (`athletics_fastapi`)

El backend está construido con **FastAPI**. Sigue estos pasos para configurarlo:

### 2.1. Instalación de Dependencias

1.  Navega a la carpeta del backend:
    ```bash
    cd athletics_fastapi
    ```

2.  Crea un entorno virtual (recomendado):
    ```bash
    python -m venv venv
    ```

3.  Activa el entorno virtual:
    *   **Windows:** `.\venv\Scripts\activate`
    *   **macOS/Linux:** `source venv/bin/activate`

4.  Instala las librerías necesarias:
    ```bash
    pip install -r requirements.txt
    ```

### 2.2. Variables de Entorno (.env)

El sistema utiliza variables de entorno para su configuración. Debes crear un archivo `.env` en la carpeta `athletics_fastapi`. Puedes usar el archivo `.env.sample` como plantilla.

Copia el archivo de ejemplo:
```bash
cp .env.sample .env
# O en Windows simplemente copia y pega y renombra a .env
```

**Explicación de las Variables:**

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **APP** | | |
| `APPLICATION_HOST` | Host donde correrá la API. | `localhost` |
| `APPLICATION_PORT` | Puerto donde correrá la API. | `8080` |
| `APPLICATION_VERSION` | Versión actual del sistema. | `1.0.0` |
| **BASE DE DATOS** | | |
| `DATABASE_NAME` | Nombre de la base de datos PostgreSQL. | `BaseDeDatos` |
| `DATABASE_USER` | Usuario de PostgreSQL. | `postgres` |
| `DATABASE_PASSWORD` | Contraseña del usuario. | `123456` |
| `DATABASE_HOST` | Host de la base de datos. | `localhost` |
| `DATABASE_PORT` | Puerto de PostgreSQL. | `5432` |
| **REDIS** | | |
| `REDIS_URL` | URL de conexión a Redis (caché). | `redis://localhost:6379/0` |
| **SEGURIDAD (JWT)** | | |
| `JWT_SECRET` | Clave secreta para firmar tokens. **¡Cámbiala!** | `mi_clave_secreta` |
| `JWT_ALGORITHM` | Algoritmo de encriptación. | `HS256` |
| `ACCESS_TOKEN_EXPIRES_MINUTES` | Tiempo de vida del token de acceso (min). | `15` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Tiempo de vida del token de refresco (días). | `7` |
| **CORREO** | | |
| `EMAIL_HOST` | Servidor SMTP (ej. Gmail). | `smtp.gmail.com` |
| `EMAIL_PORT` | Puerto SMTP. | `587` |
| `EMAIL_HOST_USER` | Correo remitente. | `tu@email.com` |
| `EMAIL_HOST_PASSWORD` | Contraseña o App Password del correo. | `password` |

### 2.3. Base de Datos

Asegúrate de que el servicio de PostgreSQL esté corriendo y crea la base de datos con el nombre configurado en `DATABASE_NAME` (por defecto `BaseDeDatos`).

Para aplicar las migraciones (crear tablas):
```bash
alembic upgrade head
```

### 2.4. Ejecutar el Servidor

Para iniciar el backend, ejecuta:
```bash
python run.py
```
El servidor debería estar disponible en `http://localhost:8080`.

---

## 3. Configuración del Frontend (`athletics_vite_ui`)

El frontend está construido con **React** y **Vite**.

### 3.1. Instalación de Dependencias

1.  Navega a la carpeta del frontend:
    ```bash
    cd ../athletics_vite_ui
    ```

2.  Instala los paquetes de Node:
    ```bash
    npm install
    # o si prefieres 'pnpm' o 'yarn'
    ```

### 3.2. Variables de Entorno (.env)

Crea un archivo `.env` en la carpeta `athletics_vite_ui`. Usa `.env.sample` como guía.

**Explicación de las Variables:**

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base donde está corriendo el backend. Debe coincidir con `http://APPLICATION_HOST:APPLICATION_PORT`. | `http://localhost:8080` |

> **Nota:** En Vite, las variables de entorno expuestas al cliente deben comenzar con `VITE_`.

### 3.3. Ejecutar el Frontend

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

Por defecto, Vite suele correr en `http://localhost:5173`. Abre esa URL en tu navegador para ver la aplicación.

---

## 4. Resumen de Ejecución Normal

Una vez configurado todo, para trabajar día a día necesitarás dos terminales:

**Terminal 1 (Backend):**
```bash
cd athletics_fastapi
source venv/bin/activate  # o .\venv\Scripts\activate en Windows
python run.py
```

**Terminal 2 (Frontend):**
```bash
cd athletics_vite_ui
npm run dev
```
