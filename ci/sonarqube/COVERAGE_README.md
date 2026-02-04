# 📊 Configuración de Cobertura de Código

Este documento explica cómo generar y visualizar reportes de cobertura de código para el proyecto Athletics Module.

## 🎯 Descripción

La cobertura de código mide qué porcentaje del código fuente es ejecutado durante las pruebas. Esto ayuda a identificar:

- ✅ Código bien probado
- ⚠️ Código sin pruebas
- 🐛 Posibles áreas de riesgo

## 📁 Archivos Configurados

### Backend (Python)
- **`athletics_fastapi/requirements.txt`**: Incluye `pytest-cov`
- **`athletics_fastapi/tests/pytest.ini`**: Configuración de cobertura
- **Reportes generados**:
  - `coverage.xml` - Para SonarQube
  - `htmlcov/` - Reporte HTML visual

### Frontend (JavaScript/TypeScript)
- **`athletics_vite_ui/vite.config.js`**: Configuración de Vitest con cobertura
- **`athletics_vite_ui/package.json`**: Incluye `@vitest/coverage-v8`
- **Reportes generados**:
  - `coverage/lcov.info` - Para SonarQube
  - `coverage/` - Reportes en múltiples formatos

## 🚀 Uso

### Opción 1: Generar Cobertura Localmente (Recomendado)

#### En Windows (PowerShell):
```powershell
# Desde la raíz del proyecto
.\ci\sonarqube\generate-coverage.ps1
```

#### En Linux/Mac (Bash):
```bash
# Desde la raíz del proyecto
bash ci/sonarqube/generate-coverage.sh
```

Este script:
1. ✅ Activa el entorno virtual de Python
2. ✅ Instala dependencias necesarias
3. ✅ Ejecuta tests del backend con cobertura
4. ✅ Ejecuta tests del frontend con cobertura
5. ✅ Genera reportes en los formatos requeridos

### Opción 2: Ejecutar Tests Manualmente

#### Backend (Python):
```bash
cd athletics_fastapi

# Activar entorno virtual
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Instalar pytest-cov si no está instalado
pip install pytest-cov

# Ejecutar tests con cobertura
pytest -c tests/pytest.ini

# Ver reporte en terminal
pytest -c tests/pytest.ini --cov-report=term

# Abrir reporte HTML
# Windows:
start htmlcov/index.html
# Linux:
xdg-open htmlcov/index.html
# Mac:
open htmlcov/index.html
```

#### Frontend (JavaScript/TypeScript):
```bash
cd athletics_vite_ui

# Instalar dependencias si no están instaladas
npm install

# Instalar cobertura de Vitest
npm install --save-dev @vitest/coverage-v8

# Ejecutar tests con cobertura
npm run test -- --coverage

# Abrir reporte HTML
# Windows:
start coverage/index.html
# Linux:
xdg-open coverage/index.html
# Mac:
open coverage/index.html
```

## 📊 Visualizar Reportes

### Backend (Python)
- **Terminal**: Se muestra automáticamente al ejecutar los tests
- **HTML**: Abre `athletics_fastapi/htmlcov/index.html` en tu navegador
- **XML**: `athletics_fastapi/coverage.xml` (para SonarQube)

### Frontend (JavaScript/TypeScript)
- **Terminal**: Se muestra automáticamente al ejecutar los tests
- **HTML**: Abre `athletics_vite_ui/coverage/index.html` en tu navegador
- **LCOV**: `athletics_vite_ui/coverage/lcov.info` (para SonarQube)

## 🔍 Integración con SonarQube

Los reportes de cobertura se integran automáticamente con SonarQube:

1. **Genera la cobertura** (usando el script o manualmente)
2. **Ejecuta el análisis de SonarQube**:
   ```bash
   docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml up
   ```
3. **Visualiza en SonarQube**: http://localhost:9000

SonarQube leerá automáticamente:
- `athletics_fastapi/coverage.xml`
- `athletics_vite_ui/coverage/lcov.info`

## ⚙️ Configuración de Cobertura

### Backend (Python) - `pytest.ini`

```ini
[pytest]
addopts = 
    --cov=app                      # Directorio a cubrir
    --cov-report=xml:coverage.xml  # Reporte XML
    --cov-report=html:htmlcov      # Reporte HTML
    --cov-report=term-missing      # Mostrar líneas no cubiertas
    --cov-branch                   # Incluir cobertura de ramas
    --cov-fail-under=0             # No fallar si la cobertura es baja

[coverage:run]
omit = 
    */tests/*                      # Excluir tests
    */migrations/*                 # Excluir migraciones
    */venv/*                       # Excluir entorno virtual
```

### Frontend (JavaScript/TypeScript) - `vite.config.js`

```javascript
coverage: {
  provider: 'v8',                  // Motor de cobertura
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  exclude: [
    'node_modules/',
    '**/*.test.{js,jsx,ts,tsx}',   // Excluir tests
    '**/*.config.*',               // Excluir configs
  ],
  include: ['src/**/*.{js,jsx,ts,tsx}'],
}
```

## 📈 Métricas de Cobertura

- **Lines**: Porcentaje de líneas ejecutadas
- **Functions**: Porcentaje de funciones ejecutadas
- **Branches**: Porcentaje de ramas (if/else) ejecutadas
- **Statements**: Porcentaje de declaraciones ejecutadas

## 🎯 Objetivos de Cobertura

Se recomienda mantener:
- ✅ **Mínimo**: 60% de cobertura
- 🎯 **Objetivo**: 80% de cobertura
- 🏆 **Excelente**: 90%+ de cobertura

## 🛠️ Solución de Problemas

### Error: "pytest-cov not found"
```bash
pip install pytest-cov
```

### Error: "@vitest/coverage-v8 not found"
```bash
npm install --save-dev @vitest/coverage-v8
```

### No se genera coverage.xml
Verifica que estés ejecutando pytest desde el directorio correcto:
```bash
cd athletics_fastapi
pytest -c tests/pytest.ini
```

### No se genera lcov.info
Asegúrate de tener instalado el paquete de cobertura:
```bash
npm install --save-dev @vitest/coverage-v8
npm run test -- --coverage
```

## 📝 Notas Adicionales

- Los archivos de cobertura están en `.gitignore` y no se suben al repositorio
- La cobertura se regenera cada vez que ejecutas los tests
- Puedes ver la cobertura localmente sin necesidad de SonarQube
- Los reportes HTML son interactivos y muestran línea por línea qué está cubierto

## 🔗 Referencias

- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [SonarQube Coverage](https://docs.sonarqube.org/latest/analysis/coverage/)
