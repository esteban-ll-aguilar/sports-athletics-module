"""Enums relacionados con el dominio del atleta."""
from enum import Enum
# Tipo de estamento al que pertenece el atleta
class TipoEstamento(str, Enum):
    ESTUDIANTE = "ESTUDIANTE"
    DOCENTE = "DOCENTE"
    ADMINISTRATIVO = "ADMINISTRATIVO"
    TRABAJADORES = "TRABAJADORES"
    PARTICULARES = "PARTICULARES"
