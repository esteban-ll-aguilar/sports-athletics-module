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