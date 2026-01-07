# -------------------------------------------------------------------------
# SCRIPT DE CI/CD AUTOMATICO (Windows / PowerShell)
# -------------------------------------------------------------------------
# Objetivo: 
# 1. Configurar entorno desde cero (Venv, Dependencias).
# 2. Ejecutar Tests Unitarios Criticos.
# 3. Si pasan los tests -> Construir y Desplegar con Docker.
# 4. Aplicar migraciones de BD.
# -------------------------------------------------------------------------

$ErrorActionPreference = "Stop" # Detenerse ante cualquier error

# -------------------------------------------------------------------------
# 1. DEFINICION DE RUTAS DINAMICAS (No asumir donde esta el usuario)
# -------------------------------------------------------------------------
Write-Host "`n[0/5] Configurando rutas..." -ForegroundColor Cyan
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Path $ScriptDir -Parent
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "athletics_fastapi"
$DockerDir = Join-Path -Path $ProjectRoot -ChildPath "athletics_fastapi"
$ComposeFile = Join-Path -Path $DockerDir -ChildPath "docker-compose.yml"

Write-Host " -> Raiz del Proyecto: $ProjectRoot"
Write-Host " -> Backend: $BackendDir"
Write-Host " -> Docker Compose: $ComposeFile"

# Validar existencia de carpetas clave
if (-not (Test-Path $BackendDir)) {
    Write-Error "CRITICO: No se encuentra la carpeta 'athletics_fastapi' en $ProjectRoot"
    exit 1
}

# -------------------------------------------------------------------------
# 2. VERIFICACION DE PRERREQUISITOS
# -------------------------------------------------------------------------
Write-Host "`n[1/5] Verificando Prerrequisitos..." -ForegroundColor Cyan

# Verificar Python 3.12
$Global:PyCmd = "python" # Default fallback
try {
    # Primero intentamos con el launcher especificamente la 3.12
    $pyCheck = py -3.12 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $Global:PyCmd = "py -3.12"
        Write-Host " -> Python 3.12 detectado via Launcher ($pyCheck)." -ForegroundColor Green
    } else {
        throw "Launcher no encontro 3.12"
    }
} catch {
    # Si falla, miramos si 'python' es la 3.12
    try {
        $pyCheck = python --version 2>&1
        if ($pyCheck -match "3.12") {
            $Global:PyCmd = "python"
            Write-Host " -> Python 3.12 detectado en PATH ($pyCheck)." -ForegroundColor Green
        } else {
            Write-Error "CRITICO: Se requiere Python 3.12. Se detecto $pyCheck pero necesitamos 3.12."
            Write-Host "Instala Python 3.12 o usa el flag '-0' en 'py' para verificar tus versiones."
            exit 1
        }
    } catch {
        Write-Error "CRITICO: No se encontro Python 3.12 instalado."
        exit 1
    }
}

# Verificar Docker
try {
    $dockerVersion = docker --version 2>&1
    Write-Host " -> $dockerVersion detectado." -ForegroundColor Green
} catch {
    Write-Error "CRITICO: Docker no esta instalado o no esta en el PATH."
    exit 1
}

# -------------------------------------------------------------------------
# 3. CONFIGURACION DEL ENTORNO (Backend)
# -------------------------------------------------------------------------
Write-Host "`n[2/5] Configurando Entorno Local (Backend)..." -ForegroundColor Cyan
Set-Location -Path $BackendDir

# Crear Venv si no existe
if (-not (Test-Path "venv")) {
    Write-Host " -> Creando entorno virtual (venv) con $Global:PyCmd ..."
    # Ejecutar comando como scriptblock porque PyCmd puede tener espacios (ej: "py -3.12")
    Invoke-Expression "$Global:PyCmd -m venv venv"
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
    Write-Error "CRITICO: No se encontro el script de activacion en $VenvActivate"
    exit 1
}

# Instalar Dependencias
Write-Host " -> Instalando/Actualizando dependencias..."
pip install --upgrade pip | Out-Null
pip install -r requirements.txt | Out-Null
pip install pytest pytest-asyncio httpx | Out-Null # Asegurar libs de test
Write-Host " -> Dependencias listas." -ForegroundColor Green

# -------------------------------------------------------------------------
# 4. EJECUCION DE TESTS
# -------------------------------------------------------------------------
Write-Host "`n[3/5] Ejecutando Tests Unitarios..." -ForegroundColor Cyan

# Funcion helper para ejecutar tests
function Run-Test {
    param ($Path, $Name)
    Write-Host " -> Ejecutando Test: $Name ($Path)..." -NoNewline
    
    # Usamos cmd /c para ejecutar pytest y redirigir stderr a stdout A NIVEL DE CMD.
    # Esto evita que PowerShell interprete los warnings en stderr como errores "NativeCommandError"
    # cuando $ErrorActionPreference = "Stop".
    $Output = cmd /c "pytest $Path -v 2>&1"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [OK]" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "$Output"
        Write-Error "CRITICO: Fallaron los tests de $Name. SE ABORTA EL DESPLIEGUE."
        exit 1
    }
}

Run-Test "tests/modules/auth/routers/test_register_flow.py" "Registro de Usuarios"
Run-Test "tests/modules/auth/services/test_password_reset_service.py" "Recuperacion de Contrasena"
Run-Test "tests/modules/atleta/services/test_historial_medico_service.py" "Historial Medico"
Run-Test "tests/modules/competencia/services/test_resultado_competencia_service.py" "Resultado de Competencia"
Run-Test "tests/modules/competencia/repositories/test_baremo_repository.py" "Baremo"
Run-Test "tests/modules/admin/services/test_admin_user_service.py" "Administrador"

Write-Host " -> ¡TODOS LOS TESTS PASARON!" -ForegroundColor Green

# -------------------------------------------------------------------------
# 5. BUILD & DEPLOY (Docker)
# -------------------------------------------------------------------------
Write-Host "`n[4/5] Construyendo y Desplegando (Docker)..." -ForegroundColor Cyan

if (-not (Test-Path $ComposeFile)) {
    Write-Warning "No se encontro $ComposeFile, buscando fallback..."
    $ComposeFile = "docker-compose.yml"
}

Write-Host " -> Usando configuracion: $ComposeFile"
Write-Host " -> Bajando contenedores anteriores (Down)..."
docker-compose -f $ComposeFile down --remove-orphans

Write-Host " -> Construyendo y Levantando (Up --build)..."
docker-compose -f $ComposeFile up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Error "CRITICO: Fallo el despliegue con Docker Compose."
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
    # Ejecutamos las migraciones dentro del contenedor 'init-fastapi' que ya tiene las variables de entorno
    Write-Host " -> Ejecutando migraciones via Docker (init-fastapi)..."
    
    # Usamos docker-compose run para levantar temporalmente el servicio de inicializacion
    # Nota: Si el servicio ya corrio en el 'up -d' anterior, esto asegura que corra de nuevo las migraciones
    # O simplemente revisamos logs si 'init-fastapi' ya lo hizo al inicio.
    
    # Opcion A: Ejecutar explicitamente
    docker-compose -f $ComposeFile run --rm init-fastapi
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " -> Migraciones aplicadas con exito." -ForegroundColor Green
    } else {
        throw "El contenedor de migraciones fallo."
    }

} catch {
    Write-Error "ERROR: Fallo la aplicacion de migraciones via Docker."
    # No salimos con error critico aqui, el deploy ya este hecho, solo fallo la migracion
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "      CI/CD FINALIZADO EXITOSAMENTE       " -ForegroundColor Green
Write-Host "=========================================="
