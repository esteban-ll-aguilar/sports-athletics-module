# Usar una imagen base oficial optimizada
FROM python:3.12-slim

# Establecer directorio de trabajo
WORKDIR /app

# Establecer variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo requirements.txt y luego instalar
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código fuente
COPY . .

# Copiar scripts de inicialización y dar permisos
COPY check_db.py .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Exponer el puerto
EXPOSE 8080

# Usar entrypoint para inicialización (DB check + migraciones)
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando por defecto para iniciar la aplicación
CMD ["uvicorn", "app.main:_APP", "--host", "0.0.0.0", "--port", "8080"]