from enum import Enum
# Modelo de enums para la competencia
class PruebaType(str, Enum):
    """
    Define la categoría de la prueba dentro del evento.
    """
    COMPETENCIA = "COMPETENCIA"
    NORMAL = "NORMAL"

class TipoClasificacion(str, Enum):
    """
    Niveles de clasificación para los atletas según su rendimiento o categoría.
    """
    A = "A" # Nivel Elite
    B = "B" # Nivel Intermedio
    C = "C" # Nivel Principiante

class TipoMedicion(str, Enum):
    """
    Unidades de medida utilizadas para evaluar el resultado de una prueba.
    """
    TIEMPO = "TIEMPO"
    DISTANCIA = "DISTANCIA"

class Sexo(str, Enum):
    """
    Categorización biológica para la división de los eventos.
    """
    M = "M" # Masculino
    F = "F" # Femenino
