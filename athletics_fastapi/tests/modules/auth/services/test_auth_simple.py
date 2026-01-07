"""
Módulo de Pruebas Unitarias para Utilidades de Autenticación.
Verifica el funcionamiento aislado de funciones como el hashing de contraseñas.
"""
import pytest
from app.core.jwt.jwt import PasswordHasher

def test_password_hashing():
    """
    Verifica que el hashing y la verificación de contraseñas funcionen correctamente.
    Comprueba que hash(password) != password y que verify verifica correctamente.
    """
    hasher = PasswordHasher()
    password = "secret_password"
    
    hashed = hasher.hash(password)
    
    assert hashed != password
    assert hasher.verify(password, hashed) is True
    assert hasher.verify("wrong_password", hashed) is False

def test_password_hashing_consistency():
    """
    Verifica la consistencia del hashing.
    Comprueba que el hashing de la misma contraseña produce hashes diferentes (debido al salting)
    pero que la función verify() sigue funcionando para ambos hashes.
    """
    hasher = PasswordHasher()
    password = "consistent_password"
    
    hash1 = hasher.hash(password)
    hash2 = hasher.hash(password)
    
    # Argon2 produce hashes diferentes (salted)
    assert hash1 != hash2
    
    assert hasher.verify(password, hash1) is True
    assert hasher.verify(password, hash2) is True
