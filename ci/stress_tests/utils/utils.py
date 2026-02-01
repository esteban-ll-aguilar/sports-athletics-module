import random

def generar_cedula_ecuador() -> str:
    """
    Genera una cédula ecuatoriana válida (10 dígitos)
    compatible con el algoritmo módulo 10.
    """
    # Provincia válida: 01–24
    provincia = random.randint(1, 24)
    provincia_str = f"{provincia:02d}"

    # Tercer dígito: 0–5 (persona natural)
    tercer_digito = random.randint(0, 5)

    # Dígitos del 4 al 9
    restantes = [random.randint(0, 9) for _ in range(6)]

    # Primeros 9 dígitos
    cedula_base = [int(d) for d in provincia_str] + [tercer_digito] + restantes

    # Coeficientes módulo 10
    coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    suma = 0

    for i in range(9):
        valor = cedula_base[i] * coeficientes[i]
        if valor >= 10:
            valor -= 9
        suma += valor

    residuo = suma % 10
    digito_verificador = 10 - residuo if residuo != 0 else 0

    cedula = "".join(map(str, cedula_base)) + str(digito_verificador)
    return cedula
