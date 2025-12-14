"""
Script de prueba completo para el módulo de registro de usuarios.
Ejecutar con: python test_registro_completo.py
"""
import requests
import json
from datetime import date

BASE_URL = "http://localhost:8080/api/v1/auth"

def print_header(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_test(test_name, passed):
    status = "✅ PASADO" if passed else "❌ FALLIDO"
    print(f"{status} - {test_name}")

def test_get_roles():
    """Test 1: GET /auth/roles - Listar roles disponibles"""
    print_header("TEST 1: Endpoint GET /auth/roles")
    
    try:
        response = requests.get(f"{BASE_URL}/roles")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = (
            response.status_code == 200 and
            isinstance(response.json(), list) and
            len(response.json()) == 3  # ATLETA, REPRESENTANTE, ENTRENADOR
        )
        print_test("Endpoint /roles retorna lista de roles", passed)
        return passed
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_registro_basico():
    """Test 2: Registro básico con campos mínimos"""
    print_header("TEST 2: Registro básico (solo campos obligatorios)")
    
    import random
    num = random.randint(1000, 9999)
    
    payload = {
        "username": f"usuario{num}",
        "email": f"usuario{num}@test.com",
        "password": "MiPassword123!",
        "role": "ATLETA"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = response.status_code == 201
        print_test("Registro básico exitoso", passed)
        return passed, payload
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, None


def test_registro_completo():
    """Test 3: Registro con todos los campos"""
    print_header("TEST 3: Registro completo (todos los campos)")
    
    import random
    num = random.randint(1000, 9999)
    
    payload = {
        "username": f"atleta{num}",
        "email": f"atleta{num}@test.com",
        "password": "MiPassword123!",
        "role": "REPRESENTANTE",
        "nombre_completo": f"Juan Pérez {num}",
        "cedula": f"12345678-{num}",
        "fecha_nacimiento": "1990-01-15",
        "sexo": "M",
        "telefono": "+1-555-0100"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = response.status_code == 201
        print_test("Registro completo exitoso", passed)
        return passed, payload
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, None


def test_validacion_email_duplicado(email):
    """Test 4: Validación de email duplicado"""
    print_header("TEST 4: Validación - Email duplicado (409)")
    
    payload = {
        "username": "otrouser",
        "email": email,
        "password": "MiPassword123!",
        "role": "ATLETA"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = (
            response.status_code == 409 and
            "email" in response.json()["detail"].lower()
        )
        print_test("Email duplicado retorna 409", passed)
        return passed
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_validacion_cedula_duplicada(cedula):
    """Test 5: Validación de cédula duplicada"""
    print_header("TEST 5: Validación - Cédula duplicada (409)")
    
    import random
    num = random.randint(1000, 9999)
    
    payload = {
        "username": f"user{num}",
        "email": f"user{num}@test.com",
        "password": "MiPassword123!",
        "role": "ATLETA",
        "cedula": cedula
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = (
            response.status_code == 409 and
            "cédula" in response.json()["detail"].lower()
        )
        print_test("Cédula duplicada retorna 409", passed)
        return passed
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_validacion_password_debil():
    """Test 6: Validación de password débil"""
    print_header("TEST 6: Validación - Password débil (422)")
    
    import random
    num = random.randint(1000, 9999)
    
    payload = {
        "username": f"user{num}",
        "email": f"user{num}@test.com",
        "password": "weakpass",  # Sin mayúsculas, números, caracteres especiales
        "role": "ATLETA"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = response.status_code == 422
        print_test("Password débil retorna 422", passed)
        return passed
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_validacion_cedula_formato():
    """Test 7: Validación de formato de cédula"""
    print_header("TEST 7: Validación - Formato de cédula inválido (422)")
    
    import random
    num = random.randint(1000, 9999)
    
    payload = {
        "username": f"user{num}",
        "email": f"user{num}@test.com",
        "password": "MiPassword123!",
        "role": "ATLETA",
        "cedula": "ABC-123-XYZ"  # Formato inválido con letras
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        passed = response.status_code == 422
        print_test("Cédula con formato inválido retorna 422", passed)
        return passed
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_registro_por_roles():
    """Test 8: Registro con diferentes roles"""
    print_header("TEST 8: Registro con diferentes roles")
    
    roles = ["ATLETA", "REPRESENTANTE", "ENTRENADOR"]
    results = []
    
    for role in roles:
        import random
        num = random.randint(1000, 9999)
        
        payload = {
            "username": f"{role.lower()}{num}",
            "email": f"{role.lower()}{num}@test.com",
            "password": "MiPassword123!",
            "role": role
        }
        
        try:
            response = requests.post(f"{BASE_URL}/register", json=payload)
            passed = (
                response.status_code == 201 and
                response.json().get("role") == role
            )
            print_test(f"Registro con rol {role}", passed)
            results.append(passed)
            
        except Exception as e:
            print(f"❌ Error con rol {role}: {e}")
            results.append(False)
    
    return all(results)


def main():
    print("\n" + "🚀 "*30)
    print("  PRUEBAS COMPLETAS - MÓDULO DE REGISTRO DE USUARIOS")
    print("🚀 "*30)
    
    results = {}
    
    try:
        # Test 1: Endpoint /roles
        results['roles'] = test_get_roles()
        
        # Test 2: Registro básico
        passed, payload_basico = test_registro_basico()
        results['registro_basico'] = passed
        
        # Test 3: Registro completo
        passed, payload_completo = test_registro_completo()
        results['registro_completo'] = passed
        
        # Test 4: Email duplicado
        if payload_basico:
            results['email_duplicado'] = test_validacion_email_duplicado(payload_basico['email'])
        
        # Test 5: Cédula duplicada
        if payload_completo and payload_completo.get('cedula'):
            results['cedula_duplicada'] = test_validacion_cedula_duplicada(payload_completo['cedula'])
        
        # Test 6: Password débil
        results['password_debil'] = test_validacion_password_debil()
        
        # Test 7: Formato de cédula
        results['cedula_formato'] = test_validacion_cedula_formato()
        
        # Test 8: Registro por roles
        results['registro_roles'] = test_registro_por_roles()
        
        # Resumen
        print("\n" + "="*70)
        print("  RESUMEN DE PRUEBAS")
        print("="*70)
        
        total = len(results)
        passed = sum(1 for v in results.values() if v)
        
        for test_name, result in results.items():
            status = "✅" if result else "❌"
            print(f"{status} {test_name}")
        
        print("\n" + "="*70)
        print(f"  RESULTADO FINAL: {passed}/{total} pruebas pasadas")
        print("="*70)
        
        if passed == total:
            print("\n🎉 ¡TODAS LAS PRUEBAS PASARON! El módulo de registro está completo.")
        else:
            print(f"\n⚠️  {total - passed} pruebas fallaron. Revisa los detalles arriba.")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: No se pudo conectar al servidor")
        print("Asegúrate de que el servidor esté corriendo en http://localhost:8080")
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")


if __name__ == "__main__":
    main()
