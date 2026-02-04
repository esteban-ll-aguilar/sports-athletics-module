# Documentación de Implementación de SonarQube

Esta documentación detalla cómo se ha implementado la integración de SonarQube en el proyecto **Sports Athletics Module** para el análisis de calidad y cobertura de código.

## 1. Visión General de la Implementación

La solución utiliza **Docker Compose** para orquestar un entorno completo y efímero de análisis estático. A diferencia de las configuraciones tradicionales que dependen de herramientas instaladas en el host, esta implementación está totalmente **contenherizada** y automatizada.

### Características Principales:
- **Zero-Config Local**: No requiere instalar Java, SonarScanner o bases de datos en la máquina del desarrollador.
- **Generación Automática de Cobertura**: Un contenedor dedicado ejecuta los tests antes del análisis.
- **Análisis Multi-Módulo**: Soporta Backend (Python) y Frontend (Vite/JS) en un solo reporte.
- **Autoconfiguración**: El scanner configura automáticamente contraseñas y tokens en el servidor SonarQube.

## 2. Arquitectura del Sistema

El sistema se compone de 4 servicios definidos en `ci/sonarqube/docker-compose-sonarqube.yml`:

### A. Servicios de Infraestructura
1. **`sonarqube-db` (PostgreSQL 15)**
   - Base de datos persistente para guardar los historiales y perfiles de calidad.
   - Volumen: `sonarqube_db_data`.

2. **`sonarqube` (SonarQube 10 Community)**
   - El servidor web y motor de análisis.
   - Expone la interfaz en `http://localhost:9000`.
   - Espera a que la DB esté saludable (healthcheck) antes de iniciar.

### B. Servicios de Ejecución (Pipeline en Docker)
3. **`coverage-generator` (Python 3.11 Slim)**
   - **Rol**: Preparar el terreno.
   - **Acciones**:
     - Instala dependencias de Python y Node.js.
     - Ejecuta `pytest` con `pytest-cov` para generar `coverage.xml`.
     - Ejecuta `vitest` con `coverage-v8` para generar `lcov.info`.
   - **Resultado**: Archivos de cobertura listos para ser consumidos.

4. **`sonar-scanner` (SonarSource CLI)**
   - **Rol**: Ejecutar el análisis y subir resultados.
   - **Dependencias**: Espera a que `sonarqube` esté listo (status UP) Y a que `coverage-generator` haya terminado exitosamente.
   - **Lógica de Script (`command`)**:
     1. Verifica conectividad con SonarQube.
     2. Cambia la contraseña por defecto (`admin` -> `Admin*123`).
     3. Genera un User Token dinámico para el análisis.
     4. Ejecuta `sonar-scanner` inyectando el token y las rutas de los reportes.

## 3. Configuración del Proyecto (`sonar-project.properties`)

El archivo `ci/sonarqube/sonar-project.properties` define una estructura **Multi-Módulo**:

```properties
# Raíz
sonar.projectKey=athletics-sports-module
sonar.modules=backend,frontend

# Módulo Backend
backend.sonar.projectBaseDir=athletics_fastapi
backend.sonar.sources=app
backend.sonar.python.coverage.reportPaths=coverage.xml

# Módulo Frontend
frontend.sonar.projectBaseDir=athletics_vite_ui
frontend.sonar.sources=src
frontend.sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Exclusiones Clave
Se han configurado exclusiones agresivas para evitar ruido en el análisis:
- **Backend**: Excluye migraciones, venv, configuración de tests (`conftest.py`), y archivos utilitarios puros.
- **Frontend**: Excluye `node_modules`, mocks, archivos de configuración de Vite, y componentes de ejemplo.

## 4. Flujo de Ejecución

El proceso se ejecuta con un solo comando:

```bash
docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml up
```

### Secuencia Paso a Paso:
1. **Inicio**: Docker levanta PostgreSQL y SonarQube.
2. **Generación**: `coverage-generator` inicia en paralelo. Instala librerías y corre tests.
3. **Espera**: `sonar-scanner` espera en un bucle (`until curl...`) hasta que SonarQube responda "UP".
4. **Handshake**: Una vez arriba, `sonar-scanner` asegura las credenciales.
5. **Scan**: `sonar-scanner` lee `sonar-project.properties`, encuentra los XML/LCOV generados en el paso 2, y sube el análisis.
6. **Finalización**: Los resultados aparecen en el dashboard y el scanner termina.

## 5. Integración CI/CD

Actualmente, la implementación está diseñada para **ejecución local o en agentes de CI que soporten Docker Compose**.
- El workflow `.github/workflows/ci-cd-development.yml` actual **NO** incluye el paso de SonarQube.
- Para integrarlo, se debería añadir un paso que levante este compose y espere a que el scanner termine con código de salida 0.

## 6. Ubicación de Archivos

- `ci/sonarqube/`
  - `docker-compose-sonarqube.yml`: Orquestación.
  - `sonar-project.properties`: Reglas de análisis.
  - `README.md`: Guía de usuario rápida.
  - `.env.sonar`: Credenciales por defecto.
