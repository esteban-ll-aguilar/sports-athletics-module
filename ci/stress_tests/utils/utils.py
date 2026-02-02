import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import string

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


# ============================================================================
# GENERADORES DE NOMBRES Y DATOS PERSONALES
# ============================================================================

NOMBRES_MASCULINOS = [
    "Juan", "Carlos", "Luis", "Miguel", "José", "Fernando", "Diego", "Andrés",
    "Jorge", "Pedro", "Roberto", "Francisco", "Manuel", "Ricardo", "Antonio",
    "Daniel", "Rafael", "Javier", "Eduardo", "Alberto", "Sergio", "Mario",
    "Alejandro", "Pablo", "Víctor", "Raúl", "Óscar", "Enrique", "Gonzalo"
]

NOMBRES_FEMENINOS = [
    "María", "Ana", "Carmen", "Laura", "Patricia", "Sandra", "Rosa", "Verónica",
    "Isabel", "Diana", "Mónica", "Gabriela", "Claudia", "Silvia", "Beatriz",
    "Teresa", "Gloria", "Lucia", "Adriana", "Cristina", "Carolina", "Natalia",
    "Fernanda", "Valentina", "Paola", "Andrea", "Daniela", "Jessica", "Sofía"
]

APELLIDOS = [
    "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez",
    "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno",
    "Álvarez", "Muñoz", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres",
    "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Suárez"
]

PROVINCIAS_ECUADOR = [
    "Pichincha", "Guayas", "Azuay", "Manabí", "El Oro", "Tungurahua", "Los Ríos",
    "Esmeraldas", "Chimborazo", "Imbabura", "Loja", "Cotopaxi", "Santo Domingo",
    "Santa Elena", "Bolívar", "Cañar", "Carchi", "Morona Santiago", "Napo",
    "Pastaza", "Sucumbíos", "Zamora Chinchipe", "Galápagos", "Orellana"
]

CIUDADES_ECUADOR = [
    "Quito", "Guayaquil", "Cuenca", "Portoviejo", "Machala", "Ambato", "Manta",
    "Santo Domingo", "Riobamba", "Ibarra", "Loja", "Latacunga", "Esmeraldas",
    "Salinas", "Guaranda", "Azogues", "Tulcán", "Macas", "Tena", "Puyo",
    "Nueva Loja", "Zamora", "Puerto Baquerizo Moreno", "Francisco de Orellana"
]


def generar_nombre_completo(genero: Optional[str] = None) -> Dict[str, str]:
    """
    Genera un nombre completo ecuatoriano.
    
    Args:
        genero: 'M' para masculino, 'F' para femenino, None para aleatorio
        
    Returns:
        Dict con nombre, segundo_nombre, apellido_paterno, apellido_materno, nombre_completo, genero
    """
    if genero is None:
        genero = random.choice(['M', 'F'])
    
    nombres = NOMBRES_MASCULINOS if genero == 'M' else NOMBRES_FEMENINOS
    
    nombre = random.choice(nombres)
    segundo_nombre = random.choice(nombres) if random.random() > 0.3 else ""
    apellido_paterno = random.choice(APELLIDOS)
    apellido_materno = random.choice(APELLIDOS)
    
    nombre_completo = f"{nombre}"
    if segundo_nombre:
        nombre_completo += f" {segundo_nombre}"
    nombre_completo += f" {apellido_paterno} {apellido_materno}"
    
    return {
        "nombre": nombre,
        "segundo_nombre": segundo_nombre,
        "apellido_paterno": apellido_paterno,
        "apellido_materno": apellido_materno,
        "nombre_completo": nombre_completo,
        "genero": genero
    }


def generar_email(nombre_completo: str, dominio: Optional[str] = None) -> str:
    """
    Genera un email basado en el nombre completo.
    
    Args:
        nombre_completo: Nombre completo de la persona
        dominio: Dominio del email (default: aleatorio entre varios)
        
    Returns:
        Email generado
    """
    if dominio is None:
        dominio = random.choice([
            "gmail.com", "hotmail.com", "yahoo.com", "outlook.com",
            "unl.edu.ec", "test.com", "example.com"
        ])
    
    # Normalizar nombre (quitar acentos y espacios)
    nombre_limpio = nombre_completo.lower()
    nombre_limpio = nombre_limpio.replace('á', 'a').replace('é', 'e').replace('í', 'i')
    nombre_limpio = nombre_limpio.replace('ó', 'o').replace('ú', 'u').replace('ñ', 'n')
    
    partes = nombre_limpio.split()
    
    # Varios formatos de email
    formatos = [
        f"{partes[0]}.{partes[-1]}",  # nombre.apellido
        f"{partes[0]}{partes[-1]}",   # nombreapellido
        f"{partes[0][0]}{partes[-1]}", # napellido
        f"{partes[0]}.{partes[-1]}{random.randint(1, 999)}", # nombre.apellido123
    ]
    
    usuario = random.choice(formatos)
    return f"{usuario}@{dominio}"


def generar_telefono_ecuador() -> str:
    """
    Genera un número de teléfono celular ecuatoriano válido.
    Formato: 09XXXXXXXX (10 dígitos)
    """
    # Celulares en Ecuador empiezan con 09
    return f"09{random.randint(10000000, 99999999)}"


def generar_direccion_ecuador() -> Dict[str, str]:
    """
    Genera una dirección ecuatoriana.
    
    Returns:
        Dict con provincia, ciudad, direccion, codigo_postal
    """
    provincia = random.choice(PROVINCIAS_ECUADOR)
    ciudad = random.choice(CIUDADES_ECUADOR)
    
    # Calles comunes en Ecuador
    calles = ["Av. Amazonas", "Calle Bolívar", "Av. 10 de Agosto", "Calle Sucre",
              "Av. Colón", "Calle Flores", "Av. Patria", "Calle Olmedo"]
    
    calle_principal = random.choice(calles)
    numeracion = random.randint(100, 9999)
    referencia = random.choice(["y", "entre", "esquina"])
    calle_secundaria = random.choice([c for c in calles if c != calle_principal])
    
    direccion = f"{calle_principal} N{numeracion} {referencia} {calle_secundaria}"
    codigo_postal = f"EC{random.randint(100000, 999999)}"
    
    return {
        "provincia": provincia,
        "ciudad": ciudad,
        "direccion": direccion,
        "codigo_postal": codigo_postal
    }


def generar_fecha_nacimiento(edad_min: int = 15, edad_max: int = 65) -> datetime:
    """
    Genera una fecha de nacimiento aleatoria.
    
    Args:
        edad_min: Edad mínima
        edad_max: Edad máxima
        
    Returns:
        Fecha de nacimiento como datetime
    """
    hoy = datetime.now()
    edad = random.randint(edad_min, edad_max)
    anio_nacimiento = hoy.year - edad
    
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)  # Usar 28 para evitar problemas con febrero
    
    return datetime(anio_nacimiento, mes, dia)


# ============================================================================
# GENERADORES DE DATOS DEPORTIVOS
# ============================================================================

ESPECIALIDADES_ATLETISMO = [
    "Velocidad", "Medio Fondo", "Fondo", "Vallas", "Saltos", "Lanzamientos",
    "Marcha", "Pruebas Combinadas", "Relevos", "Cross Country"
]

NIVELES_RENDIMIENTO = ["Principiante", "Intermedio", "Avanzado", "Elite"]

TIPOS_SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]

CATEGORIAS_ATLETISMO = [
    "Sub-14", "Sub-16", "Sub-18", "Sub-20", "Sub-23", "Mayores", "Master"
]


def generar_atleta(cedula: Optional[str] = None) -> Dict:
    """
    Genera datos completos de un atleta.
    
    Args:
        cedula: Cédula específica o None para generar una nueva
        
    Returns:
        Dict con todos los datos del atleta
    """
    if cedula is None:
        cedula = generar_cedula_ecuador()
    
    datos_personales = generar_nombre_completo()
    fecha_nacimiento = generar_fecha_nacimiento(15, 35)
    
    # Datos físicos realistas para atletas
    if datos_personales["genero"] == "M":
        altura = random.uniform(1.60, 1.95)  # metros
        peso = random.uniform(55, 90)  # kg
    else:
        altura = random.uniform(1.50, 1.85)
        peso = random.uniform(45, 75)
    
    return {
        "cedula": cedula,
        **datos_personales,
        "fecha_nacimiento": fecha_nacimiento.strftime("%Y-%m-%d"),
        "edad": (datetime.now() - fecha_nacimiento).days // 365,
        "email": generar_email(datos_personales["nombre_completo"]),
        "telefono": generar_telefono_ecuador(),
        **generar_direccion_ecuador(),
        "altura": round(altura, 2),
        "peso": round(peso, 2),
        "tipo_sangre": random.choice(TIPOS_SANGRE),
        "especialidad": random.choice(ESPECIALIDADES_ATLETISMO),
        "nivel": random.choice(NIVELES_RENDIMIENTO),
        "categoria": random.choice(CATEGORIAS_ATLETISMO),
        "fecha_ingreso": (datetime.now() - timedelta(days=random.randint(0, 730))).strftime("%Y-%m-%d")
    }


def generar_entrenador(cedula: Optional[str] = None) -> Dict:
    """
    Genera datos completos de un entrenador.
    
    Args:
        cedula: Cédula específica o None para generar una nueva
        
    Returns:
        Dict con todos los datos del entrenador
    """
    if cedula is None:
        cedula = generar_cedula_ecuador()
    
    datos_personales = generar_nombre_completo()
    fecha_nacimiento = generar_fecha_nacimiento(25, 65)
    
    return {
        "cedula": cedula,
        **datos_personales,
        "fecha_nacimiento": fecha_nacimiento.strftime("%Y-%m-%d"),
        "edad": (datetime.now() - fecha_nacimiento).days // 365,
        "email": generar_email(datos_personales["nombre_completo"], "unl.edu.ec"),
        "telefono": generar_telefono_ecuador(),
        **generar_direccion_ecuador(),
        "especialidad": random.choice(ESPECIALIDADES_ATLETISMO),
        "anios_experiencia": random.randint(2, 30),
        "certificaciones": random.randint(1, 5),
        "nivel_certificacion": random.choice(["Nivel 1", "Nivel 2", "Nivel 3", "Internacional"]),
        "fecha_contratacion": (datetime.now() - timedelta(days=random.randint(0, 1825))).strftime("%Y-%m-%d")
    }


def generar_entrenamiento() -> Dict:
    """
    Genera datos de un entrenamiento.
    
    Returns:
        Dict con datos del entrenamiento
    """
    fecha = datetime.now() + timedelta(days=random.randint(-30, 60))
    hora_inicio = random.randint(6, 18)
    duracion = random.choice([60, 90, 120, 180])  # minutos
    
    return {
        "nombre": f"Entrenamiento {random.choice(ESPECIALIDADES_ATLETISMO)}",
        "descripcion": f"Sesión de entrenamiento enfocada en {random.choice(['técnica', 'resistencia', 'velocidad', 'fuerza'])}",
        "fecha": fecha.strftime("%Y-%m-%d"),
        "hora_inicio": f"{hora_inicio:02d}:00:00",
        "duracion_minutos": duracion,
        "capacidad_maxima": random.randint(15, 50),
        "lugar": random.choice(["Pista Atlética", "Gimnasio", "Parque La Carolina", "Estadio Olímpico"]),
        "especialidad": random.choice(ESPECIALIDADES_ATLETISMO),
        "nivel_requerido": random.choice(NIVELES_RENDIMIENTO),
        "categoria": random.choice(CATEGORIAS_ATLETISMO)
    }


def generar_competencia() -> Dict:
    """
    Genera datos de una competencia que coinciden con CompetenciaCreate schema.
    
    Returns:
        Dict con datos de la competencia
    """
    fecha = datetime.now() + timedelta(days=random.randint(7, 180))
    
    nombres_competencia = [
        "Campeonato Nacional de Atletismo",
        "Copa Ecuador de Velocidad",
        "Torneo Interuniversitario",
        "Meeting Internacional",
        "Campeonato Regional de Fondo",
        "Copa Ciudad de Quito",
        "Torneo Juvenil de Atletismo",
        "Campeonato Provincial de Velocidad",
        "Copa Universitaria de Atletismo",
        "Torneo Escolar Nacional"
    ]
    
    lugares = [
        "Estadio Olímpico Atahualpa - Quito",
        "Estadio Modelo - Guayaquil",
        "Complejo Deportivo La Villaflora - Ambato",
        "Estadio Alejandro Serrano Aguilar - Cuenca",
        "Pista Atlética UTE - Quito",
        "Polideportivo de Riobamba",
        "Estadio Olímpico - Riobamba",
        "Complejo Deportivo Guanguilquí - Ibarra"
    ]
    
    return {
        "nombre": random.choice(nombres_competencia),
        "descripcion": f"Competencia de atletismo organizada para promover el deporte de alto rendimiento",
        "fecha": fecha.strftime("%Y-%m-%d"),
        "lugar": random.choice(lugares),
        "estado": True
    }


def generar_inscripcion(atleta_id: int, entrenamiento_id: int) -> Dict:
    """
    Genera datos de una inscripción.
    
    Args:
        atleta_id: ID del atleta
        entrenamiento_id: ID del entrenamiento
        
    Returns:
        Dict con datos de la inscripción
    """
    fecha_inscripcion = datetime.now() - timedelta(days=random.randint(0, 30))
    
    estados = ["Confirmada", "Pendiente", "Cancelada", "En Espera"]
    
    return {
        "atleta_id": atleta_id,
        "entrenamiento_id": entrenamiento_id,
        "fecha_inscripcion": fecha_inscripcion.strftime("%Y-%m-%d %H:%M:%S"),
        "estado": random.choice(estados),
        "notas": random.choice(["", "Confirmado por entrenador", "Requiere evaluación previa", ""])
    }


def generar_asistencia(inscripcion_id: int, fecha_entrenamiento: str) -> Dict:
    """
    Genera registro de asistencia.
    
    Args:
        inscripcion_id: ID de la inscripción
        fecha_entrenamiento: Fecha del entrenamiento
        
    Returns:
        Dict con datos de asistencia
    """
    presente = random.random() > 0.15  # 85% de asistencia
    
    return {
        "inscripcion_id": inscripcion_id,
        "fecha": fecha_entrenamiento,
        "presente": presente,
        "justificada": False if presente else random.random() > 0.3,
        "observaciones": "" if presente else random.choice([
            "Enfermedad", "Asunto familiar", "Lesión leve", "Exámenes académicos", ""
        ])
    }


# ============================================================================
# GENERADORES DE USUARIOS Y AUTENTICACIÓN
# ============================================================================

def generar_usuario(rol: str = "atleta", email: Optional[str] = None) -> Dict:
    """
    Genera datos de un usuario para el sistema.
    
    Args:
        rol: Rol del usuario (atleta, entrenador, admin, representante)
        email: Email específico o None para generar uno
        
    Returns:
        Dict con datos del usuario
    """
    datos_personales = generar_nombre_completo()
    
    if email is None:
        email = generar_email(datos_personales["nombre_completo"])
    
    # Password simple para testing: "Password123!"
    return {
        "email": email,
        "password": "Password123!",
        "nombre_completo": datos_personales["nombre_completo"],
        "rol": rol,
        "activo": random.random() > 0.05,  # 95% activos
        "verificado": random.random() > 0.1  # 90% verificados
    }


def generar_usuarios_csv(cantidad: int = 100, archivo: str = "users.csv") -> str:
    """
    Genera un archivo CSV con usuarios para pruebas de carga.
    
    Args:
        cantidad: Cantidad de usuarios a generar
        archivo: Nombre del archivo CSV
        
    Returns:
        Ruta del archivo generado
    """
    import csv
    
    with open(archivo, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['email', 'password', 'nombre_completo', 'rol'])
        
        # Usuarios genéricos
        for i in range(1, cantidad + 1):
            writer.writerow([
                f"user{i}@test.com",
                "Password123!",
                f"Usuario {i} Test",
                "atleta"
            ])
        
        # Usuarios específicos por rol
        roles = [
            ("admin@test.com", "Admin123!", "Administrador Test", "admin"),
            ("entrenador1@test.com", "Entrenador123!", "Entrenador Uno", "entrenador"),
            ("entrenador2@test.com", "Entrenador123!", "Entrenador Dos", "entrenador"),
            ("atleta1@test.com", "Atleta123!", "Atleta Uno", "atleta"),
            ("atleta2@test.com", "Atleta123!", "Atleta Dos", "atleta"),
            ("representante1@test.com", "Rep123!", "Representante Uno", "representante"),
        ]
        
        for user_data in roles:
            writer.writerow(user_data)
    
    return archivo


# ============================================================================
# UTILIDADES DE GENERACIÓN MASIVA
# ============================================================================

def generar_lote_atletas(cantidad: int) -> List[Dict]:
    """Genera múltiples atletas."""
    return [generar_atleta() for _ in range(cantidad)]


def generar_lote_entrenadores(cantidad: int) -> List[Dict]:
    """Genera múltiples entrenadores."""
    return [generar_entrenador() for _ in range(cantidad)]


def generar_lote_entrenamientos(cantidad: int) -> List[Dict]:
    """Genera múltiples entrenamientos."""
    return [generar_entrenamiento() for _ in range(cantidad)]


def generar_lote_competencias(cantidad: int) -> List[Dict]:
    """Genera múltiples competencias."""
    return [generar_competencia() for _ in range(cantidad)]
