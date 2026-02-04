# Casos de Prueba - Módulo de Atleta

## FRONTEND - CREAR PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A01 | Crear perfil atleta válido | Crear un perfil de atleta con todos los campos obligatorios | Nombres: Juan, Apellidos: Perez, Fecha Nacimiento: 2000-05-15, Especialidad: NATACION, Años Experiencia: 5, Categoría: SENIOR | Toast: "Perfil de atleta creado exitosamente". Redirección a Dashboard. | Usuario autenticado con rol ATLETA | |
| TC-A02 | Validar Usuario No Atleta | Intento de crear perfil con rol no ATLETA | Usuario con rol ENTRENADOR intenta crear perfil | Error: "Solo usuarios con rol ATLETA pueden crear perfil deportivo" | Usuario autenticado sin rol ATLETA | |
| TC-A03 | Validar Perfil Duplicado | Intento de crear segundo perfil para mismo usuario | Usuario que ya tiene perfil intenta crear otro | Error: "El atleta ya existe" | Usuario con perfil de atleta existente | |
| TC-A04 | Validar Especialidad | Selección de especialidad deportiva | Especialidad: ATLETISMO | Perfil creado con especialidad asignada correctamente | | |
| TC-A05 | Validar Años Experiencia | Ingreso de años de experiencia | Años Experiencia: -1 (negativo) | Error: "Años de experiencia no válido" | | |
| TC-A06 | Validar Categoría | Selección de categoría de competencia | Categoría: JUNIOR | Perfil creado con categoría asignada | Especialidad seleccionada | |
| TC-A07 | Campos Opcionales | Crear perfil sin llenar datos opcionales | Datos opcionales vacíos | Perfil creado exitosamente | Campos obligatorios completos | |

## BACKEND - CREAR PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A01 | Crear perfil atleta válido | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR"}` | `{"success": true, "message": "Perfil creado exitosamente", "data": {"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR", "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, "errors": null}` (Status 201) | Usuario ATLETA autenticado, sin perfil previo | Exitoso |
| TC-A02 | Validar Usuario No Atleta | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR"}` (Usuario ENTRENADOR) | `{"success": false, "message": "Solo usuarios con rol ATLETA pueden crear perfil deportivo", "errors": null}` (Status 403) | Usuario autenticado con rol ENTRENADOR | Fallido |
| TC-A03 | Validar Perfil Duplicado | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR"}` (Usuario con perfil existente) | `{"success": false, "message": "El atleta ya existe", "errors": null}` (Status 400) | Usuario ATLETA con perfil existente | Fallido |
| TC-A04 | Usuario No Encontrado | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR"}` (user_id inválido) | `{"success": false, "message": "Usuario no encontrado", "errors": null}` (Status 404) | user_id que no existe | Fallido |
| TC-A05 | Validar Especialidad | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "ESPECIALIDAD_INVALIDA", "anios_experiencia": 5, "categoria": "SENIOR"}` | `{"success": false, "message": "Especialidad inválida", "errors": [{"field": "especialidad", "message": "Valor no permitido"}]}` | | Fallido |
| TC-A06 | Validar Años Experiencia | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": -1, "categoria": "SENIOR"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "anios_experiencia", "message": "Debe ser >= 0"}]}` | | Fallido |
| TC-A07 | Crear con datos opcionales | POST /api/v1/atletas/ | `{"nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5}` | `{"success": true, "message": "Perfil creado exitosamente", "data": {"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": null, "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, "errors": null}` | Datos opcionales omitidos | Exitoso |

## FRONTEND - VER PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A08 | Ver mi perfil | Atleta visualiza su propio perfil | Click en "Mi Perfil" | Página carga con datos del perfil del atleta | Usuario autenticado con perfil de atleta | |
| TC-A09 | Ver perfil de otro atleta | Visualizar perfil de otro atleta por ID | ID de otro atleta: 5 | Página carga con datos del otro atleta | Usuario autenticado | |
| TC-A10 | Perfil no encontrado | Intento de ver perfil que no existe | ID: 9999 | Error: "Atleta no encontrado" | | |
| TC-A11 | Listar todos los atletas | Obtener lista de todos los atletas registrados | Página de listado | Tabla con todos los atletas, paginada | | |
| TC-A12 | Paginación | Navegar entre páginas de atletas | Skip: 0, Limit: 10 | Muestra primeros 10 atletas | | |

## BACKEND - VER PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A08 | Ver mi perfil | GET /api/v1/atletas/me | Header: Authorization Bearer token | `{"success": true, "data": {"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR", "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, "errors": null}` (Status 200) | Usuario autenticado con perfil de atleta | Exitoso |
| TC-A09 | Ver perfil de otro atleta | GET /api/v1/atletas/{atleta_id} | atleta_id: 5 | `{"success": true, "data": {"id": 5, "user_id": 12, "nombres": "Carlos", "apellidos": "Gomez", "fecha_nacimiento": "1998-08-20", "especialidad": "ATLETISMO", "anios_experiencia": 8, "categoria": "SENIOR", "external_id": "660e8400-e29b-41d4-a716-446655440001", "created_at": "2025-01-15T14:20:00", "updated_at": "2025-01-15T14:20:00"}, "errors": null}` (Status 200) | Usuario autenticado | Exitoso |
| TC-A10 | Perfil no encontrado | GET /api/v1/atletas/{atleta_id} | atleta_id: 9999 | `{"success": false, "message": "Atleta no encontrado", "errors": null}` (Status 404) | atleta_id no existe | Fallido |
| TC-A11 | Listar todos los atletas | GET /api/v1/atletas/?skip=0&limit=100 | skip: 0, limit: 100 | `{"success": true, "data": [{"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR", "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, {"id": 2, "user_id": 11, "nombres": "Maria", "apellidos": "Lopez", "fecha_nacimiento": "2001-03-10", "especialidad": "ATLETISMO", "anios_experiencia": 3, "categoria": "JUNIOR", "external_id": "770e8400-e29b-41d4-a716-446655440002", "created_at": "2025-01-20T09:15:00", "updated_at": "2025-01-20T09:15:00"}], "errors": null}` (Status 200) | | Exitoso |
| TC-A12 | Paginación | GET /api/v1/atletas/?skip=10&limit=10 | skip: 10, limit: 10 | Retorna atletas del 11 al 20 con estructura: `{"id": ..., "user_id": ..., "nombres": ..., "apellidos": ..., "fecha_nacimiento": ..., "especialidad": ..., "anios_experiencia": ..., "categoria": ..., "external_id": ..., "created_at": ..., "updated_at": ...}` | | Exitoso |
| TC-A13 | Sin perfil de atleta | GET /api/v1/atletas/me | Usuario sin perfil de atleta | `{"success": false, "message": "No tienes perfil de atleta", "errors": null}` (Status 404) | Usuario autenticado sin perfil atleta | Fallido |

## FRONTEND - ACTUALIZAR PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A14 | Actualizar datos básicos | Cambiar especialidad y años de experiencia | Especialidad: ATLETISMO, Años: 10 | Toast: "Perfil actualizado exitosamente" | Perfil de atleta existente | |
| TC-A15 | Actualizar categoría | Cambiar categoría de competencia | Categoría: MASTER | Perfil actualizado con nueva categoría | | |
| TC-A16 | Actualizar parcial | Actualizar solo algunos campos | Solo Especialidad | Perfil actualizado, otros campos sin cambios | | |
| TC-A17 | Actualizar perfil inválido | Intento de actualizar atleta que no existe | ID: 9999 | Error: "Atleta no encontrado" | | |

## BACKEND - ACTUALIZAR PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A14 | Actualizar datos básicos | PUT /api/v1/atletas/{atleta_id} | `{"especialidad": "ATLETISMO", "anios_experiencia": 10}` | `{"success": true, "data": {"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "ATLETISMO", "anios_experiencia": 10, "categoria": "SENIOR", "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T11:45:00"}, "errors": null}` (Status 200) | Atleta existe | Exitoso |
| TC-A15 | Actualizar categoría | PUT /api/v1/atletas/{atleta_id} | `{"categoria": "MASTER"}` | `{"success": true, "data": {"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "MASTER", "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T11:50:00"}, "errors": null}` (Status 200) | | Exitoso |
| TC-A16 | Actualizar parcial | PUT /api/v1/atletas/{atleta_id} | `{"especialidad": "NATACION"}` | Actualiza solo especialidad: `{"id": 1, "user_id": 10, "nombres": "Juan", "apellidos": "Perez", "fecha_nacimiento": "2000-05-15", "especialidad": "NATACION", "anios_experiencia": 5, "categoria": "SENIOR", "external_id": "550e8400-e29b-41d4-a716-446655440000", "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T11:55:00"}` | | Exitoso |
| TC-A17 | Atleta no encontrado | PUT /api/v1/atletas/9999 | `{"especialidad": "ATLETISMO", "anios_experiencia": 10, "categoria": "SENIOR"}` | `{"success": false, "message": "Atleta no encontrado", "errors": null}` (Status 404) | ID no existe | Fallido |
| TC-A18 | Validar especialidad actualizada | PUT /api/v1/atletas/{atleta_id} | `{"especialidad": "INVALIDA"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "especialidad", "message": "Valor no permitido"}]}` (Status 422) | | Fallido |

## FRONTEND - ELIMINAR PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A19 | Eliminar perfil | Eliminar perfil de atleta | Confirmación de eliminación | Modal de confirmación. Toast: "Perfil eliminado exitosamente" | Perfil de atleta existente | |
| TC-A20 | Cancelar eliminación | Cancelar proceso de eliminación | Click en "Cancelar" | Modal se cierra sin cambios | Modal de eliminación abierto | |

## BACKEND - ELIMINAR PERFIL DE ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A19 | Eliminar perfil | DELETE /api/v1/atletas/{atleta_id} | atleta_id: 1 | `{}` (Status 204 No Content) | Atleta existe | Exitoso |
| TC-A20 | Perfil no encontrado | DELETE /api/v1/atletas/9999 | atleta_id: 9999 | `{"success": false, "message": "Atleta no encontrado", "errors": null}` (Status 404) | ID no existe | Fallido |

## FRONTEND - HISTORIAL MÉDICO DEL ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A21 | Crear historial médico | Registrar datos médicos del atleta | Talla: 1.80, Peso: 75, Alergias: "Ninguna", Enfermedades: "Ninguna" | Toast: "Historial médico registrado exitosamente" | Usuario autenticado con rol ATLETA | |
| TC-A22 | Validar IMC | Verificar que el IMC se calcula correctamente | Talla: 1.80, Peso: 75 | IMC mostrado: 23.15 | | |
| TC-A23 | Ver historial médico | Atleta visualiza su historial médico | Click en "Historial Médico" | Página carga con datos médicos del atleta | Historial médico creado | |
| TC-A24 | Actualizar historial | Actualizar datos médicos | Peso: 80 | Toast: "Historial actualizado exitosamente" | Historial médico existente | |
| TC-A25 | Validar dato duplicado | Intento de crear segundo historial | Crear nuevo historial | Error: "El usuario ya tiene historial médico" | Historial médico ya existe | |

## BACKEND - HISTORIAL MÉDICO DEL ATLETA

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A21 | Crear historial médico | POST /api/v1/historiales-medicos/ | `{"talla": 1.80, "peso": 75, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna"}` | `{"success": true, "message": "Historial creado", "data": {"id": 1, "external_id": "880e8400-e29b-41d4-a716-446655440003", "talla": 1.80, "peso": 75, "imc": 23.15, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna", "auth_user_id": 10, "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, "errors": null}` (Status 201) | Usuario ATLETA autenticado, sin historial previo | Exitoso |
| TC-A22 | Validar IMC calculado | POST /api/v1/historiales-medicos/ | `{"talla": 1.80, "peso": 75, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna"}` | IMC retornado: 23.15 (75/(1.80^2)) en `{"id": 1, "imc": 23.15, "talla": 1.80, "peso": 75, ...}` | | Exitoso |
| TC-A23 | Ver historial médico | GET /api/v1/historiales-medicos/me | Header: Authorization Bearer token | `{"success": true, "data": {"id": 1, "external_id": "880e8400-e29b-41d4-a716-446655440003", "talla": 1.80, "peso": 75, "imc": 23.15, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna", "auth_user_id": 10, "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, "errors": null}` (Status 200) | Usuario autenticado con historial médico | Exitoso |
| TC-A24 | Actualizar historial | PUT /api/v1/historiales-medicos/{external_id} | `{"peso": 80}` | `{"success": true, "data": {"id": 1, "external_id": "880e8400-e29b-41d4-a716-446655440003", "talla": 1.80, "peso": 80, "imc": 24.69, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna", "auth_user_id": 10, "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T11:45:00"}, "errors": null}` (Status 200) | Historial médico existe | Exitoso |
| TC-A25 | Validar dato duplicado | POST /api/v1/historiales-medicos/ | `{"talla": 1.80, "peso": 75, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna"}` | `{"success": false, "message": "El usuario ya tiene historial médico", "errors": null}` (Status 400) | Historial médico ya existe | Fallido |
| TC-A26 | Usuario no es ATLETA | POST /api/v1/historiales-medicos/ | `{"talla": 1.80, "peso": 75, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna"}` (Usuario ENTRENADOR) | `{"success": false, "message": "El usuario no existe o no es ATLETA", "errors": null}` (Status 400) | Usuario autenticado sin rol ATLETA | Fallido |
| TC-A27 | Historial no encontrado | GET /api/v1/historiales-medicos/me | Usuario sin historial médico | `{"success": false, "message": "Historial no encontrado", "errors": null}` (Status 404) | Usuario autenticado sin historial médico | Fallido |
| TC-A28 | Listar historiales | GET /api/v1/historiales-medicos/?skip=0&limit=100 | skip: 0, limit: 100 | `{"success": true, "data": [{"id": 1, "external_id": "880e8400-e29b-41d4-a716-446655440003", "talla": 1.80, "peso": 75, "imc": 23.15, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna", "auth_user_id": 10, "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, {"id": 2, "external_id": "990e8400-e29b-41d4-a716-446655440004", "talla": 1.75, "peso": 68, "imc": 22.20, "alergias": "Leche", "enfermedades_hereditarias": "Hipertensión", "enfermedades": "Ninguna", "auth_user_id": 11, "created_at": "2025-01-20T14:20:00", "updated_at": "2025-01-20T14:20:00"}], "errors": null}` (Status 200) | | Exitoso |
| TC-A29 | Ver historial por ID | GET /api/v1/historiales-medicos/{external_id} | external_id: 880e8400-e29b-41d4-a716-446655440003 | `{"success": true, "data": {"id": 1, "external_id": "880e8400-e29b-41d4-a716-446655440003", "talla": 1.80, "peso": 75, "imc": 23.15, "alergias": "Ninguna", "enfermedades_hereditarias": "Ninguna", "enfermedades": "Ninguna", "auth_user_id": 10, "created_at": "2025-01-21T10:30:00", "updated_at": "2025-01-21T10:30:00"}, "errors": null}` (Status 200) | Historial existe | Exitoso |

## FRONTEND - HISTORIAL DE COMPETENCIAS

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A30 | Ver historial de competencias | Atleta visualiza su historial de participaciones | Click en "Mis Competencias" | Tabla con todas las competencias del atleta | Usuario atleta autenticado | |
| TC-A31 | Ver competencia específica | Detalles de una competencia | Click en competencia específica | Muestra: fecha, prueba, resultado, posición final | Historial con competencias | |
| TC-A32 | Filtrar competencias | Filtrar por año o disciplina | Año: 2025 | Muestra solo competencias del 2025 | | |
| TC-A33 | Historial vacío | Atleta sin competencias | Sin participaciones registradas | Mensaje: "No hay competencias registradas" | Atleta nuevo | |

## BACKEND - HISTORIAL DE COMPETENCIAS

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A30 | Ver historial de competencias | GET /api/v1/atletas/historial | Header: Authorization Bearer token | `{"success": true, "data": [{"competencia_id": 1, "fecha": "2025-01-15", "prueba_id": 5, "resultado_id": 101, "puesto_obtenido": 2, "posicion_final": "segundo", "valor_resultado": 12.45, "timestamp": "2025-01-15T14:30:00"}, {"competencia_id": 2, "fecha": "2025-01-08", "prueba_id": 6, "resultado_id": 102, "puesto_obtenido": 1, "posicion_final": "primero", "valor_resultado": 11.95, "timestamp": "2025-01-08T16:00:00"}], "errors": null}` (Status 200) | Usuario autenticado con competencias | Exitoso |
| TC-A31 | Historial vacío | GET /api/v1/atletas/historial | Usuario sin competencias | `{"success": true, "data": [], "errors": null}` (Status 200) | Usuario nuevo | Exitoso |
| TC-A32 | Usuario no autenticado | GET /api/v1/atletas/historial | Sin token | `{"success": false, "message": "No autorizado", "errors": null}` (Status 401) | | Fallido |

## FRONTEND - ESTADÍSTICAS Y DASHBOARD

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A34 | Ver estadísticas | Visualizar resumen de estadísticas | Click en "Mis Estadísticas" | Muestra: Total de competencias, Medallas (oro, plata, bronce), Años de experiencia | Usuario atleta autenticado | |
| TC-A35 | Resumen de medallas | Contar medallas por tipo | Participación en 3 competencias | Oro: 1, Plata: 1, Bronce: 1 | Competencias con resultados | |
| TC-A36 | Experiencia mostrada | Mostrar años de experiencia | Años: 5 | Panel muestra "5 años de experiencia" | | |
| TC-A37 | Estadísticas vacías | Usuario sin competencias | Sin participaciones | Muestra: Total: 0, Medallas: 0/0/0, Experiencia: X años | Atleta nuevo | |

## BACKEND - ESTADÍSTICAS Y DASHBOARD

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-A34 | Ver estadísticas | GET /api/v1/atletas/estadisticas | Header: Authorization Bearer token | `{"success": true, "data": {"total_competencias": 3, "medallas": {"oro": 1, "plata": 1, "bronce": 1}, "experiencia": 5}, "errors": null}` (Status 200) | Usuario autenticado con competencias | Exitoso |
| TC-A35 | Estadísticas vacías | GET /api/v1/atletas/estadisticas | Usuario sin competencias | `{"success": true, "data": {"total_competencias": 0, "medallas": {"oro": 0, "plata": 0, "bronce": 0}, "experiencia": 0}, "errors": null}` (Status 200) | Atleta nuevo | Exitoso |
| TC-A36 | Usuario no autenticado | GET /api/v1/atletas/estadisticas | Sin token | `{"success": false, "message": "No autorizado", "errors": null}` (Status 401) | | Fallido |
| TC-A37 | Sin perfil de atleta | GET /api/v1/atletas/estadisticas | Usuario no atleta | `{"success": false, "message": "No tienes perfil de atleta", "errors": null}` (Status 404) | Usuario autenticado sin perfil atleta | Fallido |
