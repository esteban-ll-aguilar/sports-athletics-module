"""
Script de prueba para el endpoint de registro de usuario.
Ejecutar con: python test_register_endpoint.py
"""
import requests
import json

BASE_URL = "http://localhost:8080/api/v1/auth"

def test_register_success():
    """Prueba un registro exitoso."""
    print("\n=== Test 1: Registro Exitoso ===")
    payload = {
        "username": "testuser123",
        "email": "test123@example.com",
        "password": "MiPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    data = response.json()
    assert "id" in data or "external_id" in data, "Response debe incluir id"
    assert data["email"] == payload["email"], "Email no coincide"
    assert data["is_active"] == True, "Usuario debe estar activo"
    assert data["role"] == "ATLETA", "Rol debe ser ATLETA"
    assert "password" not in data, "Password no debe estar en la respuesta"
    print("✅ Test 1 PASADO")


def test_register_duplicate_email():
    """Prueba registro con email duplicado."""
    print("\n=== Test 2: Email Duplicado (409) ===")
    payload = {
        "username": "otrousuario",
        "email": "test123@example.com",  # Email ya usado
        "password": "MiPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 409, f"Expected 409, got {response.status_code}"
    assert "email" in response.json()["detail"].lower(), "Debe mencionar email"
    print("✅ Test 2 PASADO")


def test_register_duplicate_username():
    """Prueba registro con username duplicado."""
    print("\n=== Test 3: Username Duplicado (409) ===")
    payload = {
        "username": "testuser123",  # Username ya usado
        "email": "nuevo@example.com",
        "password": "MiPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 409, f"Expected 409, got {response.status_code}"
    assert "username" in response.json()["detail"].lower(), "Debe mencionar username"
    print("✅ Test 3 PASADO")


def test_register_weak_password():
    """Prueba con password débil (sin caracteres especiales)."""
    print("\n=== Test 4: Password Débil (422) ===")
    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "weakpass"  # Sin mayúsculas, números, caracteres especiales
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    print("✅ Test 4 PASADO")


def test_register_invalid_email():
    """Prueba con email inválido."""
    print("\n=== Test 5: Email Inválido (422) ===")
    payload = {
        "username": "newuser2",
        "email": "invalid-email",
        "password": "MiPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    print("✅ Test 5 PASADO")


if __name__ == "__main__":
    print("🚀 Iniciando pruebas del endpoint /api/v1/auth/register")
    print("=" * 60)
    
    try:
        # Test 1: Registro exitoso (crear usuario nuevo cada vez)
        import random
        test_num = random.randint(1000, 9999)
        
        print("\n=== Test 1: Registro Exitoso ===")
        payload = {
            "username": f"testuser{test_num}",
            "email": f"test{test_num}@example.com",
            "password": "MiPassword123!"
        }
        
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Test 1 PASADO")
            saved_email = payload["email"]
            saved_username = payload["username"]
            
            # Test 2: Email duplicado
            test_register_duplicate_email_dynamic(saved_email)
            
            # Test 3: Username duplicado
            test_register_duplicate_username_dynamic(saved_username)
        else:
            print(f"❌ Test 1 FALLIDO: Expected 201, got {response.status_code}")
        
        # Test 4: Password débil
        test_register_weak_password()
        
        # Test 5: Email inválido
        test_register_invalid_email()
        
        print("\n" + "=" * 60)
        print("✅ TODAS LAS PRUEBAS COMPLETADAS")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: No se pudo conectar al servidor")
        print("Asegúrate de que el servidor esté corriendo en http://localhost:8080")
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")


def test_register_duplicate_email_dynamic(email):
    """Prueba registro con email duplicado."""
    print("\n=== Test 2: Email Duplicado (409) ===")
    payload = {
        "username": "otrousuario999",
        "email": email,
        "password": "MiPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 409:
        print("✅ Test 2 PASADO")
    else:
        print(f"❌ Test 2 FALLIDO: Expected 409, got {response.status_code}")


def test_register_duplicate_username_dynamic(username):
    """Prueba registro con username duplicado."""
    print("\n=== Test 3: Username Duplicado (409) ===")
    payload = {
        "username": username,
        "email": "nuevo999@example.com",
        "password": "MiPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 409:
        print("✅ Test 3 PASADO")
    else:
        print(f"❌ Test 3 FALLIDO: Expected 409, got {response.status_code}")
