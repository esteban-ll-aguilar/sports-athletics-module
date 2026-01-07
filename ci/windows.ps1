Write-Host "Verificando Python 3.12..."

$version = python --version 2>&1
if ($version -match "3\.12") {
    Write-Host "Python 3.12 encontrado: $version"
} else {
    Write-Host "Python 3.12 NO encontrado. Versión actual: $version"
    exit 1
}


Write-Host "Entrando al directorio athletics_fastapi..."
cd athletics_fastapi

Write-Host "Creando entorno virtual..."
py -V:3.12 -m venv venv

Write-Host "Activando entorno virtual..."
.\venv\Scripts\activate

Write-Host "Instalando dependencias..."
pip install -r requirements.txt


Write-Host "Comenzando Tests..."

#Incluir la ruta de los tests



Write-Host "Actualizando Base de Datos..."
alembic upgrade head



