# ============================================
# Multi-stage Build para optimización
# ============================================

# Stage 1: Builder
FROM node:22-alpine as builder

# Argumentos de build para variables de entorno
ARG VITE_API_URL=http://localhost:8080
ARG NODE_ENV=production

# Establecer variables de entorno en build time
ENV VITE_API_URL=${VITE_API_URL} \
    NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies (incluye devDependencies necesarias para el build)
RUN npm ci --include=dev

# Copiar el resto del código
COPY . .

# Build de la aplicación con las variables de entorno
RUN npm run build

# ============================================
# Stage 2: Runtime con Nginx
# ============================================
FROM nginx:alpine

# Copiar el build del stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear script para inyectar variables de entorno en runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'set -e' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'echo "Injecting runtime environment variables..."' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo '  find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" {} \;' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'fi' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    chmod +x /docker-entrypoint.d/40-envsubst-on-templates.sh

# Variables de entorno con valores por defecto
ENV VITE_API_URL=http://localhost:8080

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx (usa el entrypoint por defecto de nginx que ejecuta scripts en /docker-entrypoint.d/)
CMD ["nginx", "-g", "daemon off;"]
