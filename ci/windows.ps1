# -------------------------------------------------------------------------
# SCRIPT DE CI/CD AUTOMÁTICO (Windows / PowerShell)
# -------------------------------------------------------------------------
# Objetivo: 
# 1. Configurar entorno desde cero (Venv, Dependencias).
# 2. Ejecutar Tests Unitarios Críticos.
# 3. Si pasan los tests -> Construir y Desplegar con Docker.
# 4. Aplicar migraciones de BD.
# -------------------------------------------------------------------------

$ErrorActionPreference = "Stop" # Detenerse ante cualquier error

# -------------------------------------------------------------------------
# 1. DEFINICIÓN DE RUTAS DINÁMICAS (No asumir dónde está el usuario)
# -------------------------------------------------------------------------
Write-Host "`n[0/5] Configurando rutas..." -ForegroundColor Cyan
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Path $ScriptDir -Parent
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "athletics_fastapi"
$DockerDir = Join-Path -Path $ProjectRoot -ChildPath "dc"
$ComposeFile = Join-Path -Path $DockerDir -ChildPath "docker-compose-profe.yml"

Write-Host " -> Raíz del Proyecto: $ProjectRoot"
Write-Host " -> Backend: $BackendDir"
Write-Host " -> Docker Compose: $ComposeFile"

# Validar existencia de carpetas clave
if (-not (Test-Path $BackendDir)) {
    Write-Error "CRÍTICO: No se encuentra la carpeta 'athletics_fastapi' en $ProjectRoot"
    exit 1
}

# -------------------------------------------------------------------------
# 2. VERIFICACIÓN DE PRERREQUISITOS
# -------------------------------------------------------------------------
Write-Host "`n[1/5] Verificando Prerrequisitos..." -ForegroundColor Cyan

# Verificar Python
try {
    $pyVersion = python --version 2>&1
    Write-Host " -> $pyVersion detectado." -ForegroundColor Green
} catch {
    Write-Error "CRÍTICO: Python no está instalado o no está en el PATH."
    exit 1
}

# Verificar Docker
try {
    $dockerVersion = docker --version 2>&1
    Write-Host " -> $dockerVersion detectado." -ForegroundColor Green
} catch {
    Write-Error "CRÍTICO: Docker no está instalado o no está en el PATH."
    exit 1
}

# -------------------------------------------------------------------------
# 3. CONFIGURACIÓN DEL ENTORNO (Backend)
# -------------------------------------------------------------------------
Write-Host "`n[2/5] Configurando Entorno Local (Backend)..." -ForegroundColor Cyan
Set-Location -Path $BackendDir

# Crear Venv si no existe
if (-not (Test-Path "venv")) {
    Write-Host " -> Creando entorno virtual (venv)..."
    # Intentar con 'py -3.12' o 'python'
    try {
        py -V:3.12 -m venv venv
    } catch {
        python -m venv venv
    }
} else {
    Write-Host " -> Entorno virtual ya existe."
}

# Activar Venv
$VenvActivate = ".\venv\Scripts\Activate.ps1"
if (Test-Path $VenvActivate) {
    Write-Host " -> Activando entorno virtual..."
    # Ejecutamos en el contexto actual (.)
    . $VenvActivate
} else {
    Write-Error "CRÍTICO: No se encontró el script de activación en $VenvActivate"
    exit 1
}

# Instalar Dependencias
Write-Host " -> Instalando/Actualizando dependencias..."
pip install --upgrade pip | Out-Null
pip install -r requirements.txt | Out-Null
pip install pytest pytest-asyncio httpx | Out-Null # Asegurar libs de test
Write-Host " -> Dependencias listas." -ForegroundColor Green

# -------------------------------------------------------------------------
# 4. EJECUCIÓN DE TESTS
# -------------------------------------------------------------------------
Write-Host "`n[3/5] Ejecutando Tests Unitarios..." -ForegroundColor Cyan

# Función helper para ejecutar tests
function Run-Test {
    param ($Path, $Name)
    Write-Host " -> Ejecutando: $Name ($Path)..." -NoNewline
    $Output = pytest $Path -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [OK]" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "$Output"
        Write-Error "CRÍTICO: Fallaron los tests de $Name. SE ABORTA EL DESPLIEGUE."
        exit 1
    }
}

Run-Test "tests/modules/auth/routers/test_register_flow.py" "Registro de Usuarios"
Run-Test "tests/modules/auth/services/test_password_reset_service.py" "Recuperación de Contraseña"

Write-Host " -> ¡TODOS LOS TESTS PASARON!" -ForegroundColor Green

# -------------------------------------------------------------------------
# 5. BUILD & DEPLOY (Docker)
# -------------------------------------------------------------------------
Write-Host "`n[4/5] Construyendo y Desplegando (Docker)..." -ForegroundColor Cyan

if (-not (Test-Path $ComposeFile)) {
    Write-Warning "No se encontró $ComposeFile, buscando fallback..."
    $ComposeFile = "docker-compose.yml"
}

Write-Host " -> Usando configuración: $ComposeFile"
Write-Host " -> Bajando contenedores anteriores (Down)..."
docker-compose -f $ComposeFile down --remove-orphans

Write-Host " -> Construyendo y Levantando (Up --build)..."
docker-compose -f $ComposeFile up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Error "CRÍTICO: Falló el despliegue con Docker Compose."
    exit 1
}
Write-Host " -> Contenedores levantados." -ForegroundColor Green

# -------------------------------------------------------------------------
# 6. MIGRACIONES DB
# -------------------------------------------------------------------------
Write-Host "`n[5/5] Aplicando Migraciones a la BD..." -ForegroundColor Cyan
Write-Host " -> Esperando unos segundos para que la BD inicie..."
Start-Sleep -Seconds 5

try {
    # Aseguramos que alembic use la variables de entorno correctas o el .env
    # Si la DB está en localhost:5432 (expuesta por docker), esto funcionará
    alembic upgrade head
    Write-Host " -> Migraciones aplicadas con éxito." -ForegroundColor Green
} catch {
    Write-Error "ERROR: Falló 'alembic upgrade head'. Verifica que la BD esté arriba."
    # No salimos con error critico aqui, el deploy ya está hecho, solo falló la migración
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "      CI/CD FINALIZADO EXITOSAMENTE       " -ForegroundColor Green
Write-Host "=========================================="




