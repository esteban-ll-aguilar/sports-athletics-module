from enum import Enum


class TipoIdentificacionEnum(str, Enum):
    PASAPORTE = "PASAPORTE"
    CEDULA = "CEDULA"
    RUC = "RUC"

    @classmethod
    def values(cls):
        return [item.value for item in cls]
    
