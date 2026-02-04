# ============================================
# Multi-stage Build para optimización
# ============================================

# Stage 1: Builder
FROM python:3.12-slim as builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y crear wheels
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# ============================================
# Stage 2: Runtime
# ============================================
FROM python:3.12-slim

# Argumentos de build (pueden ser sobrescritos en build time)
ARG APPLICATION_PORT=8080
ARG WORKERS=4
ARG ENV=production

# Establecer directorio de trabajo
WORKDIR /app

# Establecer variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=${APPLICATION_PORT}

# Variables de entorno de la aplicación (valores por defecto)
# Estas pueden ser sobrescritas en runtime por docker-compose o Kubernetes
ENV APPLICATION_HOST=0.0.0.0 \
    APPLICATION_PORT=${APPLICATION_PORT} \
    APPLICATION_VERSION=1.0.0 \
    WORKERS=${WORKERS} \
    ENV=${ENV}

# Copiar wheels desde builder y instalar
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Copiar el resto del código fuente
COPY . .

# Crear directorio data para archivos estáticos (ej: fotos de perfil)
RUN mkdir -p data/profile_pictures

# Convertir line endings y dar permisos al entrypoint (fix Windows CRLF)
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Cambiar a usuario no-root
USER appuser

# Exponer el puerto
EXPOSE ${APPLICATION_PORT}

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${APPLICATION_PORT}/health')" || exit 1

# Usar entrypoint para inicialización (DB check + migraciones)
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando por defecto para iniciar la aplicación (usa variable WORKERS)
CMD sh -c "uvicorn app.main:_APP --host 0.0.0.0 --port ${APPLICATION_PORT} --workers ${WORKERS}"