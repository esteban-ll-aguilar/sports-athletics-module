from enum import Enum


class TipoIdentificacion(str, Enum):
    PASAPORTE = "PASAPORTE"
    CEDULA = "CEDULA"
    RUC = "RUC"
    
