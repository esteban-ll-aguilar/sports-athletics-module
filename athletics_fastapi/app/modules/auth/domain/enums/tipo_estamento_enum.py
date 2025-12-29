from enum import Enum

class TipoEstamentoEnum(str, Enum):
    ADMINISTRATIVOS = "ADMINISTRATIVOS"
    DOCENTES = "DOCENTES"
    ESTUDIANTES = "ESTUDIANTES"
    TRABAJADORES = "TRABAJADORES"
    EXTERNOS = "EXTERNOS"

    @classmethod
    def values(cls):
        return [item.value for item in cls]
