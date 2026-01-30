"""Handler para respuestas estandarizadas de las APIs."""
from typing import Any, Dict, Optional
from fastapi import status
from app.utils.response_codes import ResponseCodes


class ResponseHandler:
    """Manejador de respuestas estandarizadas para las APIs."""

    @staticmethod
    def success_response(
        summary: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        status_code: int = status.HTTP_200_OK
    ) -> Dict[str, Any]:
        """
        Genera una respuesta exitosa estandarizada.
        
        Args:
            summary: Resumen breve de la operación
            message: Mensaje descriptivo de la operación
            data: Datos de respuesta (opcional)
            status_code: Código de estado HTTP (por defecto 200)
            
        Returns:
            Diccionario con la respuesta estandarizada
        """
        return {
            "summary": summary,
            "status_code": status_code,
            "errors": {},
            "message": message,
            "data": data or {},
            "status": status_code,
            "code": ResponseCodes.COD_OK
        }

    @staticmethod
    def error_response(
        summary: str,
        message: str,
        errors: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = ResponseCodes.COD_ERROR
    ) -> Dict[str, Any]:
        """
        Genera una respuesta de error estandarizada.
        
        Args:
            summary: Resumen breve del error
            message: Mensaje descriptivo del error
            errors: Diccionario con detalles de errores (opcional)
            data: Datos adicionales (opcional)
            status_code: Código de estado HTTP (por defecto 400)
            error_code: Código de error personalizado
            
        Returns:
            Diccionario con la respuesta de error estandarizada
        """
        return {
            "summary": summary,
            "status_code": status_code,
            "errors": errors or {},
            "message": message,
            "data": data or {},
            "status": status_code,
            "code": error_code
        }

    @staticmethod
    def not_found_response(
        entity: str,
        message: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta de recurso no encontrado.
        
        Args:
            entity: Nombre de la entidad no encontrada
            message: Mensaje personalizado (opcional)
            data: Datos adicionales (opcional)
            
        Returns:
            Diccionario con la respuesta de no encontrado
        """
        default_message = f"{entity} no encontrado"
        return ResponseHandler.error_response(
            summary=f"{entity} no encontrado",
            message=message or default_message,
            data=data,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code=ResponseCodes.COD_NOT_FOUND
        )

    @staticmethod
    def validation_error_response(
        summary: str,
        message: str,
        errors: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta de error de validación.
        
        Args:
            summary: Resumen del error de validación
            message: Mensaje descriptivo del error
            errors: Diccionario con detalles de validación
            data: Datos adicionales (opcional)
            
        Returns:
            Diccionario con la respuesta de error de validación
        """
        return ResponseHandler.error_response(
            summary=summary,
            message=message,
            errors=errors,
            data=data,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code=ResponseCodes.COD_VALIDATION_ERROR
        )

    @staticmethod
    def unauthorized_response(
        message: str = "No autorizado",
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta de no autorizado.
        
        Args:
            message: Mensaje descriptivo
            data: Datos adicionales (opcional)
            
        Returns:
            Diccionario con la respuesta de no autorizado
        """
        return ResponseHandler.error_response(
            summary="No autorizado",
            message=message,
            data=data,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=ResponseCodes.COD_UNAUTHORIZED
        )

    @staticmethod
    def forbidden_response(
        message: str = "Acceso prohibido",
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta de acceso prohibido.
        
        Args:
            message: Mensaje descriptivo
            data: Datos adicionales (opcional)
            
        Returns:
            Diccionario con la respuesta de acceso prohibido
        """
        return ResponseHandler.error_response(
            summary="Acceso prohibido",
            message=message,
            data=data,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=ResponseCodes.COD_FORBIDDEN
        )

    @staticmethod
    def conflict_response(
        summary: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta de conflicto.
        
        Args:
            summary: Resumen del conflicto
            message: Mensaje descriptivo del conflicto
            data: Datos adicionales (opcional)
            
        Returns:
            Diccionario con la respuesta de conflicto
        """
        return ResponseHandler.error_response(
            summary=summary,
            message=message,
            data=data,
            status_code=status.HTTP_409_CONFLICT,
            error_code=ResponseCodes.COD_CONFLICT
        )

    @staticmethod
    def empty_list_response(
        entity: str,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta para listas vacías.
        
        Args:
            entity: Nombre de la entidad
            message: Mensaje personalizado (opcional)
            
        Returns:
            Diccionario con la respuesta de lista vacía
        """
        default_message = f"No hay {entity} en la base de datos"
        return ResponseHandler.success_response(
            summary=f"No hay {entity} en la base de datos",
            message=message or default_message,
            data={},
            status_code=status.HTTP_200_OK
        )
