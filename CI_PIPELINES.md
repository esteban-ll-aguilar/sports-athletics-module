**CI Pipelines — Jenkins vs GitHub Workflows**

Este documento describe qué hace el `Jenkinsfile` del proyecto y las acciones definidas en los workflows de GitHub Actions (archivos en `.github/workflows/`). Está pensado para desarrolladores y/o integradores que necesiten entender y mantener la CI.

**Archivos clave**:
- **Jenkins pipeline:** [ci/jenkins/Jenkinsfile](ci/jenkins/Jenkinsfile)
- **GitHub workflows:** [.github/workflows/ci-develop.yml](.github/workflows/ci-develop.yml), [.github/workflows/ci-main.yml](.github/workflows/ci-main.yml), [.github/workflows/pr-checks.yml](.github/workflows/pr-checks.yml)

**Resumen general**:
- Jenkins: pipeline más completo y orquestado dentro de un agente (máquina), ejecuta instalación, tests (unit + integration), construcción de imágenes Docker y publica resultados (JUnit + HTML). Levanta servicios con `docker-compose` para los tests de integración.
- GitHub Actions: tres workflows (develop, main, PR checks) con pasos muy parecidos entre sí para instalar dependencias y ejecutar tests. `ci-main.yml` adicionalmente construye las imágenes Docker. Todos suben artefactos (cobertura y resultados) como artefactos de build.

**Detalles — Jenkins (`ci/jenkins/Jenkinsfile`)**

- Entorno / variables definidas:
  - `BACKEND_IMAGE`, `FRONTEND_IMAGE`, `IMAGE_TAG` (tag con número de build), `BACKEND_PORT`, `WORKERS`, `WORKSPACE_ROOT`.
  - Opciones de pipeline: rotación de builds, timeout global 30 minutos y timestamps.

- Etapas principales:
  1. **Setup Environment**
     - Instala dependencias backend dentro de un virtualenv (`jenkins-venv`) ubicado en `athletics_fastapi/jenkins-venv`.
     - Instala dependencias frontend con `npm install` en `athletics_vite_ui` (limpia binarios nativos problemáticos antes).

  2. **Unit Tests** (paralelo)
     - Backend: activa `jenkins-venv` y ejecuta `pytest -c ./tests/pytest.ini` en `athletics_fastapi`.
       - Publica `test-results.xml` con `junit` (ruta relativa: `test-results.xml` dentro del directorio de trabajo).
       - Publica el informe HTML de cobertura (`htmlcov`) con `publishHTML` (ruta relativa: `htmlcov`).
     - Frontend: ejecuta `npm run test -- --run --reporter=verbose` en `athletics_vite_ui` y publica el reporte de cobertura (si existe) con ruta relativa `coverage`.

  3. **Build Docker Images** (paralelo)
     - Backend: `docker build` pasando `APPLICATION_PORT`, `WORKERS`, `ENV=development`, etiqueta con `${BACKEND_IMAGE}:${IMAGE_TAG}` y `:latest`.
     - Frontend: `docker build` con `VITE_API_URL` y `NODE_ENV`, etiqueta con `${FRONTEND_IMAGE}:${IMAGE_TAG}` y `:latest`.

  4. **Integration Tests**
     - Levanta servicios con `docker-compose -f docker-compose.dev.yml up -d` (en el workspace raíz), espera ~30s.
     - Ejecuta tests de integración: `pytest -c ci/integration_test/pytest.ini` dentro de `athletics_fastapi` (el script permite fallos sin romper el pipeline gracias a `|| true`, pero los resultados se publican).
     - Publica resultados JUnit e informe HTML de integración con rutas relativas (`ci/integration_test/test-results.xml` y `ci/integration_test/htmlcov`).

- Post (siempre):
  - Detiene servicios `docker-compose down`, limpia caches temporales (pycache, caches Vite) pero preserva dependencias.
  - Mensajes para `success` / `failure`.

**Observaciones sobre Jenkins**:
- Está pensado para un agente persistente que cachea dependencias en carpetas específicas (`jenkins-venv`, `jenkins-node_modules`).
- Ejecuta integración completa (levanta `docker-compose` para integración dentro del mismo pipeline).

**Detalles — GitHub Actions (workflows)**

Los tres workflows comparten la mayor parte de la lógica:

- Pasos comunes en todas las acciones (`ci-develop.yml`, `ci-main.yml`, `pr-checks.yml`):
  - `actions/checkout@v4` para obtener el código.
  - `actions/setup-python@v5` para instalar Python 3.12 y cachear pip usando `athletics_fastapi/requirements.txt`.
  - Instalar dependencias backend en `athletics_fastapi`:
    - `python -m pip install --upgrade pip` y `pip install -r requirements.txt`.
  - `actions/setup-node@v4` para Node.js 22 y cache de `package-lock.json`.
  - Instalar dependencias frontend: ejecutar `npm ci` en `athletics_vite_ui`.
  - Ejecutar tests:
    - Backend: `pytest -c ./tests/pytest.ini --verbose --tb=short` en `athletics_fastapi`.
    - Frontend: `npm run test -- --run --reporter=verbose` en `athletics_vite_ui`.
  - Subir artefactos de cobertura y resultados (HTML coverage y archivos `test-results.xml` / `.coverage`) con `actions/upload-artifact@v4`.

- Diferencias notables:
  - `ci-main.yml` (main): además construye las imágenes Docker con `docker build` para backend y frontend (usa `github.sha` para tag). Esto implica que el runner necesita Docker y permisos para construir imágenes.
  - `ci-develop.yml` (develop): similar al PR checks, pero diseñado para pushes a `develop`. No construye imágenes.
  - `pr-checks.yml`: ejecuta las validaciones en Pull Requests hacia `develop` y `main`, similar a `ci-develop.yml`.

**Qué artefactos y reportes se generan**
- Backend coverage HTML: `athletics_fastapi/htmlcov/` (subido como artifact).
- Frontend coverage: `athletics_vite_ui/coverage/`.
- Test results XML y `.coverage` desde `athletics_fastapi` (archivos referenciados en los workflows para subir como artefactos).

**Comparativa rápida (Jenkins vs GitHub Actions)**
- Orquestación:
  - Jenkins: pipeline en un solo script, stages paralelos definidos, más control fino sobre el agente (cache de venv, node_modules local).
  - GitHub Actions: jobs y steps en runners gestionados; workflows repetitivos (desplegados por branch/evento).

- Integración/Servicios:
  - Jenkins: levanta `docker-compose` para integración dentro del pipeline.
  - GitHub Actions: no levanta servicios por defecto (a menos que se añadan pasos con `docker-compose` o servicios de contenedores). `ci-main.yml` solo construye imágenes.

- Publicación de resultados:
  - Ambos: suben archivos de cobertura y test results. Jenkins además publica HTML directamente en el job con `publishHTML`.

**Recomendaciones / notas operativas**
- Si se desea que GitHub Actions ejecute los tests de integración de forma similar a Jenkins, agregar pasos para levantar `docker-compose` y esperar a que los servicios estén listos.
- Verificar que los runners (Jenkins agent o GitHub runner) tengan Docker instalado y permisos si se construyen imágenes o se levantan containers.
- Mantener separados los tests que requieren servicios reales y los que pueden mockearse. Los tests de conectividad hacia infra real (Redis/SMTP/DB) deben residir en una suite de integración que se ejecute solo en agentes controlados.

**Cómo ejecutar localmente (resumen rápido)**
- Instalar dependencias backend:
  - `python -m venv .venv` && `. .venv/bin/activate` && `pip install -r athletics_fastapi/requirements.txt`
- Ejecutar tests unitarios backend:
  - `pytest -c athletics_fastapi/tests/pytest.ini`
- Construir imágenes localmente (opcional):
  - Backend: `docker build -t athletics-fastapi:local athletics_fastapi`
  - Frontend: `docker build -t athletics-vite-ui:local athletics_vite_ui`

---

Documento generado para facilitar el mantenimiento de CI. Si quieres que añada una plantilla de job para ejecutar integration tests en GitHub Actions, indícalo y la incluyo.
