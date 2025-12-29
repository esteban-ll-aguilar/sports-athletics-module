from enum import Enum
# Modelo de enums para la competencia
class PruebaType(str, Enum):
    COMPETENCIA = "COMPETENCIA"
    NORMAL = "NORMAL"

class TipoClasificacion(str, Enum):
    A = "A"
    B = "B"
    C = "C"
