# Casos de Prueba - Módulo de Autenticación

## FRONTEND - REGISTRO DE USUARIO

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-01 | Crear usuario válido | Registro de usuario con todos los campos obligatorios y válidos | Username: juan123, Email: juan@test.com, Pass: Abc123$%, Nombres: Juan, Apellidos: Perez, TipoID: CEDULA, ID: 0912345678, Tel: 0999999999, Estamento: DEPORTISTA | Mensaje: "Usuario registrado exitosamente. Verifique su correo." Redirección a Login. | API Disponible | |
| TC-02 | Validar Cédula | Intento de registro con cédula inválida | ID: 1234567890 (algoritmo inválido) | Error en campo ID: "Cédula inválida." Formulario no se envía. | Algoritmo de validación JS activo | |
| TC-03 | Validar Contraseña (Mayúscula) | Contraseña sin mayúscula | Pass: abc123$% | Error: "La contraseña debe tener al menos una mayúscula." | Reglas de validación activas | |
| TC-04 | Validar Contraseña (Número) | Contraseña sin número | Pass: Abcdef$% | Error: "La contraseña debe tener al menos un número." | Reglas de validación activas | |
| TC-05 | Validar Contraseña (Carácter Especial) | Contraseña sin carácter especial | Pass: Abc12345 | Error: "La contraseña debe tener al menos un carácter especial." | Reglas de validación activas | |
| TC-06 | Validar Rol Permitido | Intento de seleccionar un rol no permitido (ej. ADMIN) | Role: ADMIN | Opción no disponible en UI o Error: "Rol no permitido." | UI filtra roles permitidos | |
| TC-07 | Crear Usuario Atleta | Registro específico para rol Atleta | Role: ATLETA, Datos Adicionales (si aplica) | Mensaje de éxito. Usuario creado con rol ATLETA. | | |
| TC-08 | Envío de Código | Verificar que se informe del envío del código | Email: juan@test.com | Toast/Modal: "Se ha enviado un código de verificación a su correo." | Servicio de correo simulado/real | |
| TC-09 | Validación de Email Duplicado | Registro con email ya existente | Email: user@example.com (ya existe) | Error: "El correo ya está registrado." | Usuario existente en BD | |
| TC-10 | Validación de Username Duplicado | Registro con username ya existente | Username: juan123 (ya existe) | Error: "El nombre de usuario ya está en uso." | Usuario existente en BD | |
| TC-11 | Campos Opcionales | Registro sin llenar campos opcionales | Fecha Nacimiento: Vacio | Registro exitoso. | Campos opcionales definidos | |
| TC-12 | Validar Teléfono | Teléfono con formato o longitud incorrecta | Phone: 12345 | Error: "Número de teléfono inválido." | Validación de longitud | |

## BACKEND - REGISTRO DE USUARIO

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-01 | Crear usuario válido | POST /api/v1/auth/register | `{"username":"juan123", "email":"juan@test.com", "password":"Abc123$%", "first_name":"Juan", "last_name":"Perez", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": true, "message": "Usuario registrado exitosamente. Verifique su correo.", "data": {"username": "juan123", "email": "juan@test.com", "id": 1}, "errors": null}` | Base de datos limpia o usuario inexistente | Exitoso |
| TC-02 | Validar Cédula | POST /api/v1/auth/register | `{"identificacion":"1234567890", ...}` (Cédula inválida) | `{"success": false, "message": "Validation Error", "errors": [{"field": "identificacion", "message": "Cédula inválida"}]}` (Depende de validación Pydantic) | | Fallido |
| TC-03 | Validar Contraseña (Mayúscula) | POST /api/v1/auth/register | `{"password":"abc123$%", ...}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "password", "message": "Falta mayúscula"}]}` | | Fallido |
| TC-04 | Validar Contraseña (Número) | POST /api/v1/auth/register | `{"password":"Abcdef$%", ...}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "password", "message": "Falta número"}]}` | | Fallido |
| TC-05 | Validar Contraseña (Carácter Especial) | POST /api/v1/auth/register | `{"password":"Abc12345", ...}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "password", "message": "Falta carácter especial"}]}` | | Fallido |
| TC-06 | Validar Rol Permitido | POST /api/v1/auth/register | `{"role":"ADMIN", ...}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "role", "message": "Rol no permitido"}]}` | Rol ADMIN restringido | Fallido |
| TC-07 | Crear Usuario Atleta | POST /api/v1/auth/register | `{"role":"ATLETA", "atleta_data": {...}, ...}` | `{"success": true, "message": "Usuario registrado exitosamente...", "data": {"role": "ATLETA", ...}}` | | Exitoso |
| TC-08 | Envío de Código | POST /api/v1/auth/register | `{"email":"juan@test.com", ...}` (Solicitud válida) | `{"success": true, "message": "Usuario registrado exitosamente. Verifique su correo.", "data": {...}}` (El mensaje confirma el envío implícitamente) | Servicio de correo activo | Exitoso |
| TC-09 | Validación Email Duplicado | POST /api/v1/auth/register | `{"email":"existing@test.com", ...}` | `{"success": false, "message": "Email ya registrado", "data": null, "errors": null}` (Status 409) | Usuario existe en BD | Fallido |
| TC-10 | Validación Username Duplicado | POST /api/v1/auth/register | `{"username":"juan123", ...}` | `{"success": false, "message": "Username ya registrado", "data": null, "errors": null}` (Status 409) | Usuario existe en BD | Fallido |
| TC-11 | Campos Opcionales | POST /api/v1/auth/register | `{"fecha_nacimiento": null, ...}` | `{"success": true, "message": "Usuario registrado exitosamente...", "data": {...}}` | | Exitoso |
| TC-12 | Validar Teléfono | POST /api/v1/auth/register | `{"phone":"12345", ...}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "phone", "message": "Número de teléfono inválido"}]}` | Validaciones activas | Fallido |
