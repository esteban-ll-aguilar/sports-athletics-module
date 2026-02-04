
import asyncio
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema
from app.modules.auth.domain.enums import RoleEnum, TipoIdentificacionEnum, TipoEstamentoEnum

def test_normalization():
    data = {
        "email": "JairAlejandro@gmail.com ",
        "username": "testuser",
        "password": "Password123!",
        "first_name": "Jair",
        "last_name": "Alejandro",
        "tipo_identificacion": "CEDULA",
        "identificacion": "12345", 
        "tipo_estamento": "ESTUDIANTES",
        "role": "ATLETA"
    }
    schema = UserCreateSchema(**data)
    print(f"Original email: '{data['email']}'")
    print(f"Normalized email: '{schema.email}'")
    assert schema.email == "jairalejandro@gmail.com"
    print("✅ Email normalization verified.")

if __name__ == "__main__":
    test_normalization()
