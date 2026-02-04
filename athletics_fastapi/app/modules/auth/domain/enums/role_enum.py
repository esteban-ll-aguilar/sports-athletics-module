from enum import Enum

class RoleEnum(str, Enum):
    ADMINISTRADOR = "ADMINISTRADOR"
    ATLETA = "ATLETA"
    ENTRENADOR = "ENTRENADOR"
    REPRESENTANTE = "REPRESENTANTE"
    PASANTE = "PASANTE"

class SexoEnum(str, Enum):
    M = "M"
    F = "F"