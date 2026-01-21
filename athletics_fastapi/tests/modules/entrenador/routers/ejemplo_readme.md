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


## FRONTEND - INICIO DE SESIÓN (LOGIN)

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-L01 | Login Exitoso | Usuario inicia sesión correctamente | User/Email, Password válidos | Redirección a Dashboard. Guardado de tokens en storage/cookies. | Usuario activo | |
| TC-L02 | Credenciales Incorrectas | Usuario ingresa clave errónea | Email válido, Password incorrecto | Mensaje de error: "Credenciales inválidas". No redirección. | | |
| TC-L03 | Campos Vacíos | Intento de login sin datos | Campos vacíos | Mensaje de validación "Campos requeridos". Botón deshabilitado o error. | | |
| TC-L04 | Usuario Inactivo | Login con usuario no verificado | Email válido, Password válido, Usuario inactivo | Mensaje de error: "Usuario inactivo, verifique su email". | | |
| TC-L05 | 2FA Requerido | Login que requiere segundo factor | Datos correctos, usuario con 2FA | Redirección o modal para ingresar código 2FA. | 2FA activo | |

## BACKEND - INICIO DE SESIÓN (LOGIN)

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-L01 | Login Exitoso | Inicio de sesión con credenciales correctas | `{"username":"juan@test.com", "password":"Abc123$%"}` | `{"success": true, "message": "Inicio de sesión exitoso", "data": {"access_token": "...", "refresh_token": "...", "token_type": "bearer"}, "errors": null}` | Usuario activo y verificado | Exitoso |
| TC-L02 | Credenciales Inválidas (Password) | Intento con contraseña incorrecta | `{"username":"juan@test.com", "password":"WrongPassword"}` | `{"success": false, "message": "Credenciales inválidas", "errors": null}` (Status 401) | Usuario existe | Fallido |
| TC-L03 | Credenciales Inválidas (Usuario) | Intento con usuario inexistente | `{"username":"noexiste@test.com", "password":"Abc123$%"}` | `{"success": false, "message": "Credenciales inválidas", "errors": null}` (Status 401) | Usuario no existe | Fallido |
| TC-L04 | Usuario Inactivo | Intento de login sin validar email | `{"username":"inactive@test.com", "password":"Abc123$%"}` | `{"success": false, "message": "Usuario inactivo, por favor verifica tu email", "errors": null}` (Status 401) | Usuario registrado pero no activado | Fallido |
| TC-L05 | 2FA Requerido | Login con usuario que tiene 2FA activo | `{"username":"2fa@test.com", "password":"Abc123$%"}` | `{"success": true, "message": "2FA requerido", "data": {"temp_token": "...", "message": "2FA requerido"}}` | Usuario con 2FA enabled | Exitoso (Parcial) |


## FRONTEND - REFRESH TOKEN

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-R01 | Rotación Silenciosa | Renovación automática de token | Token expirado o próximo a expirar | Nuevo token recibido. Sesión se mantiene activa sin interrumpir usuario. | Refresh token válido | |
| TC-R02 | Sesión Expirada | Refresh token inválido o expirado | Token inválido | Cierre de sesión automático. Redirección al Login. | Refresh token inválido | |



## BACKEND - REFRESH TOKEN

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-R01 | Renovación Exitosa | Renovar token con refresh token válido | `{"refresh_token": "valid_refresh_token"}` | `{"success": true, "message": "Token renovado correctamente", "data": {"access_token": "...", "refresh_token": "..."}, "errors": null}` | Refresh token válido y no expirado | Exitoso |
| TC-R02 | Token Inválido | Intento con token alterado o falso | `{"refresh_token": "invalid_token"}` | `{"success": false, "message": "Token inválido", "errors": null}` (Status 400) | | Fallido |
| TC-R03 | Refresh Reusado/Inválido | Intento con token ya usado o no encontrado en DB | `{"refresh_token": "old_refresh_token"}` | `{"success": false, "message": "Refresh inválido", "errors": null}` (Status 401) | Token ya consumido o no existe | Fallido |


## FRONTEND - VERIFICACIÓN DE EMAIL

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-E01 | Verificación Exitosa | Usuario ingresa código correcto | Código OTP válido (6 dígitos) | Toast: "Email verificado exitosamente". Modal se cierra. Usuario activado. | Modal abierto, código enviado | |
| TC-E02 | Código Inválido | Usuario ingresa código incorrecto | Código incorrecto | Error (Toast/Texto): "Código inválido o expirado". | Modal abierto | |
| TC-E03 | Reenvío Exitoso | Solicitud de nuevo código | Clic en "Reenviar Código" | Toast: "Nuevo código enviado". Contador reinicia. | Cooldown inactivo | |
| TC-E04 | Reenvío Fallido (Cooldown) | Intento de reenvío antes de tiempo | Clic en "Reenviar" durante cooldown | Botón deshabilitado. No acción. | Cooldown activo | |

## BACKEND - VERIFICACIÓN DE EMAIL

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-E01 | Verificación Exitosa | Validar email con código correcto | `{"email": "juan@test.com", "code": "123456"}` | `{"success": true, "message": "Email verificado exitosamente...", "data": {"message": "..."}, "errors": null}` | Código válido en redis/db | Exitoso |
| TC-E02 | Código Inválido | Intento con código erróneo | `{"email": "juan@test.com", "code": "000000"}` | `{"success": false, "message": "Código inválido, expirado o se superaron los intentos máximos", "errors": null}` (Status 400) | | Fallido |
| TC-E03 | Usuario No Encontrado | Verificación para email inexistente | `{"email": "unknown@test.com", "code": "123456"}` | `{"success": false, "message": "Usuario no encontrado", "errors": null}` (Status 404) | Email no registrado | Fallido |
| TC-E04 | Reenvío Exitoso | Reenviar código a usuario inactivo | `{"email": "juan@test.com"}` | `{"success": true, "message": "Nuevo código de verificación enviado al email", ...}` | Usuario inactivo | Exitoso |
| TC-E05 | Reenvío Rate Limit | Reenvío con código aún activo | `{"email": "juan@test.com"}` | `{"success": false, "message": "Ya existe un código activo...", ...}` (Status 429) | Código vigente | Fallido |
| TC-E06 | Cuenta Ya Verificada | Reenvío a cuenta activa | `{"email": "active@test.com"}` | `{"success": false, "message": "Esta cuenta ya está verificada", ...}` (Status 400) | Usuario activo | Fallido |
