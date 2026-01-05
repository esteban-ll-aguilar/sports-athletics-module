"""Utilidades para manejo de archivos."""
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from datetime import datetime


UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "uploads")


async def upload_file_to_cloud(
    file: UploadFile,
    folder: str = "general",
    file_name: str = None,
) -> str:
    """
    Cargar archivo a almacenamiento local o cloud.
    
    Args:
        file: UploadFile de FastAPI
        folder: Carpeta de destino
        file_name: Nombre del archivo (sin extensión)
    
    Returns:
        URL o ruta del archivo guardado
    """
    try:
        # Crear directorio si no existe
        folder_path = Path(UPLOAD_DIRECTORY) / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Generar nombre único del archivo
        file_extension = Path(file.filename).suffix
        if file_name:
            final_filename = f"{file_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
        else:
            final_filename = f"{uuid.uuid4()}{file_extension}"
        
        file_path = folder_path / final_filename
        
        # Guardar archivo
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Retornar ruta relativa
        relative_path = str(file_path).replace("\\", "/")
        return relative_path
        
    except Exception as e:
        raise Exception(f"Error al guardar archivo: {str(e)}")


async def delete_file(file_path: str) -> bool:
    """Eliminar un archivo."""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error al eliminar archivo: {e}")
        return False


def get_file_url(file_path: str, base_url: str = "") -> str:
    """Obtener URL pública de un archivo."""
    if not file_path:
        return None
    
    if base_url:
        return f"{base_url}/{file_path}"
    return file_path
