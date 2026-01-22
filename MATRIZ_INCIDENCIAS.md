# MATRIZ DE INCIDENCIAS - TESTS MÓDULOS ATLETA Y ENTRENADOR

## Resumen Ejecutivo
- **Total de Defectos Identificados:** 15
- **Módulos Afectados:** 3 (HistorialMédico, Entrenamiento, Horario)
- **Estado General:** 15 en Proceso de Arreglo

---

## MATRIZ DETALLADA DE INCIDENCIAS

| ID Defecto | Caso de Prueba | Módulo | Descripción del Error | Resultado Esperado | Resultado Obtenido | Evidencia | Estado |
|---|---|---|---|---|---|---|---|
| **BUG-HM-01** | TC-A21 | HistorialMédico | AttributeError: 'coroutine' object has no attribute 'scalar_one_or_none' | Cálculo automático de IMC (22.86) | El mock no devuelve el resultado correcto | Mock impropiamente configurado con lambda en side_effect | En Proceso |
| **BUG-HM-02** | TC-A22 | HistorialMédico | AttributeError: type object 'RoleEnum' has no attribute 'ATLETA' | Validación de rol ATLETA | Error al acceder al enum | Importación correcta pero atributo no definido en enum | En Proceso |
| **BUG-HM-03** | TC-A23 | HistorialMédico | AttributeError: 'MagicMock' object has no attribute 'role' | Verificar si usuario tiene rol ATLETA | Mock no tiene propiedad 'role' configurada | Mock incompleto sin propiedades esperadas | En Proceso |
| **BUG-HM-04** | TC-A24 | HistorialMédico | AttributeError: 'coroutine' object has no attribute 'peso' | Obtener historial y verificar peso=70.0 | El objeto devuelto no es accesible correctamente | Mock devuelve corrutina en lugar de objeto | En Proceso |
| **BUG-HM-05** | TC-A25 | HistorialMédico | AttributeError: 'coroutine' object has no attribute 'status_code' | Lanzar HTTPException con status 404 | El mock no devuelve la excepción correctamente | Uso incorrecto de AsyncMock | En Proceso |
| **BUG-HM-06** | TC-A26 | HistorialMédico | AttributeError: 'MagicMock' object has no attribute '__getitem__' | Acceso a user_id del resultado | El objeto mock no es subscriptable | Falta configuración del mock como dict | En Proceso |
| **BUG-HM-07** | TC-A27 | HistorialMédico | AttributeErraor: type object 'RoleEnum' has no attribute 'ATLETA' | Verificación de rol en búsqueda por usuario | Error al validar rol del usuario | RoleEnum.ATLETA no está definido | En Proceso |
| **BUG-HM-08** | TC-A28 | HistorialMédico | AttributeError: 'coroutine' object has no attribute 'scalars' | Listar historiales con paginación | El mock no tiene método scalars() | execute().scalars no funciona correctamente | En Proceso |
| **BUG-HM-09** | TC-A28b | HistorialMédico | AttributeError: 'coroutine' object has no attribute 'scalars' | Paginación con skip=10, limit=10 | El mock no devuelve lista iterables | Problema con configuración de side_effect | En Proceso |
| **BUG-HM-10** | TC-A28c | HistorialMédico | AttributeError: type object has no attribute '__len__' | Lista vacía retorna 0 elementos | El mock no devuelve lista evaluable | Falta inicializar scalars() con lista vacía | En Proceso |
| **BUG-EN-01** | TC-EN-02 | Entrenamiento | NameError: name 'HorarioCreateNested' is not defined | Crear entrenamiento con horarios nested | Importación falta en test | Schema no está importado correctamente | En Proceso |
| **BUG-EN-02** | TC-EN-06 | Entrenamiento | NameError: name 'Entrenamiento' is not defined | Listar entrenamientos del entrenador | Error al retornar objeto Entrenamiento | Falta importar modelo o schema | En Proceso |
| **BUG-EN-03** | TC-EN-12 | Entrenamiento | NameError: name 'Entrenamiento' is not defined | Actualizar entrenamiento | El mock no retorna Entrenamiento válido | Schema o modelo no importado | En Proceso |
| **BUG-HR-01** | TC-HR-02 | Horario | ValidationError: 2 validation errors for Horario | Validación de horas (inicio < fin) | El schema no valida horas correctamente | Falta validador personalizado en schema | En Proceso |
| **BUG-AS-01** | TC-AS-01 | Asistencia | AttributeError: 'coroutine' object has no attribute 'atleta_id' | Registrar atleta en horario exitoso | El mock retorna corrutina en lugar de objeto | AsyncMock no está configurado correctamente | En Proceso |

---

## ANÁLISIS POR MÓDULO

### 📋 MÓDULO: HistorialMédico (8 Defectos)
**Descripción Genérica:** Los tests fallan principalmente por mocking impropio de AsyncMock y side_effect con lambdas.

**Problemas Identificados:**
1. ❌ `mock_db.execute.side_effect = [MagicMock(scalar_one_or_none=lambda: user)]` - **Lambda incorrecto**
2. ❌ Las lambdas no están siendo llamadas correctamente por el mock
3. ❌ Falta retornar objetos mock con métodos `scalar_one_or_none()` y `scalars()`

**Solución:**
```python
# ❌ INCORRECTO
mock_db.execute.side_effect = [
    MagicMock(scalar_one_or_none=lambda: user)
]

# ✅ CORRECTO
user_result = MagicMock()
user_result.scalar_one_or_none = MagicMock(return_value=user)
mock_db.execute.side_effect = [user_result]
```

---

### 📋 MÓDULO: Entrenamiento (3 Defectos)
**Descripción Genérica:** Fallos por importaciones faltantes en tests.

**Problemas Identificados:**
1. ❌ `HorarioCreateNested` no está importado pero se usa en schema
2. ❌ Schema de `Entrenamiento` no importado en algunos tests
3. ❌ Falta validación de modelos

**Solución Propuesta:**
```python
# Agregar al inicio del test:
from app.modules.entrenador.domain.schemas.entrenamiento_schema import (
    EntrenamientoCreate,
    EntrenamientoUpdate,
    HorarioCreateNested  # ← FALTABA
)
```

---

### 📋 MÓDULO: Horario (1 Defecto)
**Descripción Genérica:** Validación de horas no se ejecuta correctamente.

**Problemas Identificados:**
1. ❌ El validator del schema no rechaza `hora_inicio >= hora_fin`
2. ❌ Falta validador personalizado en Pydantic

**Solución Propuesta:**
```python
from pydantic import field_validator

class HorarioCreate(BaseModel):
    nombre: str
    hora_inicio: time
    hora_fin: time
    
    @field_validator('hora_fin')
    @classmethod
    def validar_horas(cls, v, info):
        if 'hora_inicio' in info.data:
            if info.data['hora_inicio'] >= v:
                raise ValueError('hora_fin debe ser después de hora_inicio')
        return v
```

---

### 📋 MÓDULO: Asistencia (1 Defecto)
**Descripción Genérica:** Similar al módulo HistorialMédico - AsyncMock mal configurado.

**Problemas Identificados:**
1. ❌ `mock_registro_asistencias_repository.create.return_value` retorna corrutina
2. ❌ Falta AsyncMock apropiado

---

## PLAN DE ARREGLO

### Fase 1: Correcciones Críticas (Mocking)
- [ ] **BUG-HM-01 a BUG-HM-10:** Reemplazar lambdas con MagicMock correctos
- [ ] **BUG-AS-01:** Aplicar mismo patrón de mocking
- **Prioridad:** ALTA | **Impacto:** 9 defectos

### Fase 2: Importaciones Faltantes
- [ ] **BUG-EN-01 a BUG-EN-03:** Agregar imports de schemas/modelos
- **Prioridad:** MEDIA | **Impacto:** 3 defectos

### Fase 3: Validaciones en Schema
- [ ] **BUG-HR-01:** Agregar validador Pydantic para horas
- **Prioridad:** MEDIA | **Impacto:** 1 defecto

---

## EVIDENCIA TÉCNICA

### Error Common Pattern (HistorialMédico)
```
AttributeError: 'coroutine' object has no attribute 'scalar_one_or_none'
  File "tests/modules/atleta/services/test_historial_medico_service.py", line XX
    result = await historial_service.create(data, user_id=10)
  
Causa: mock_db.execute() retorna corrutina en lugar de resultado evaluable
```

### Error Common Pattern (Entrenamiento)
```
NameError: name 'HorarioCreateNested' is not defined
  File "tests/modules/entrenador/services/test_entrenamiento_service.py", line XX
    horarios=[]
    
Causa: Schema no está importado en el archivo de test
```

---

## RECOMENDACIONES

1. **Usar contexto manager para mocks:** 
   ```python
   with patch('app.modules.atleta.services.historial_medico_service.HistorialMedicoService') as mock:
       # Más seguro y limpio
   ```

2. **Considerar fixtures compartidas:**
   ```python
   # conftest.py
   @pytest.fixture
   def mock_async_db():
       db = AsyncMock()
       # Configuración estándar
       return db
   ```

3. **Validar imports en el inicio de cada test file:**
   ```python
   # Al inicio del archivo
   try:
       from app.modules.entrenador.domain.schemas.entrenamiento_schema import HorarioCreateNested
   except ImportError as e:
       pytest.skip(f"Importación faltante: {e}")
   ```

---

## HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambio | Autor |
|---|---|---|---|
| 2026-01-21 | 1.0 | Creación de matriz inicial | Sistema Automático |

---

**Última Actualización:** 2026-01-21 | **Estado:** En Evaluación
