from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid

class TipoDisciplinaBase(BaseModel):
    """
    Modelo base que define los atributos comunes de un tipo de disciplina deportiva.
    """
    nombre: str
    descripcion: str
    estado: Optional[bool] = True

class TipoDisciplinaCreate(TipoDisciplinaBase):
    """ Esquema utilizado para la creación de un nuevo tipo de disciplina. """
    pass

class TipoDisciplinaUpdate(BaseModel):
    """
    Esquema utilizado para la actualización parcial de un tipo de disciplina.
    Todos los campos son opcionales para permitir modificar únicamente
    los atributos necesarios sin afectar el resto de la información.
    """
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None

class TipoDisciplinaOut(TipoDisciplinaBase):
    """
    Esquema de salida que representa un tipo de disciplina registrado en el sistema.
    Este modelo se utiliza para las respuestas de la API e incluye identificadores
    internos y externos, además de los atributos base de la disciplina.
    """
    id: int
    external_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
