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
| TC-02 | Validar Cédula | POST /api/v1/auth/register | `{"username":"user123", "email":"user@test.com", "password":"Abc123$%", "first_name":"Test", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"1234567890", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "identificacion", "message": "Cédula inválida"}]}` (Depende de validación Pydantic) | | Fallido |
| TC-03 | Validar Contraseña (Mayúscula) | POST /api/v1/auth/register | `{"username":"user123", "email":"user@test.com", "password":"abc123$%", "first_name":"Test", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "password", "message": "Falta mayúscula"}]}` | | Fallido |
| TC-04 | Validar Contraseña (Número) | POST /api/v1/auth/register | `{"username":"user123", "email":"user@test.com", "password":"Abcdef$%", "first_name":"Test", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "password", "message": "Falta número"}]}` | | Fallido |
| TC-05 | Validar Contraseña (Carácter Especial) | POST /api/v1/auth/register | `{"username":"user123", "email":"user@test.com", "password":"Abc12345", "first_name":"Test", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "password", "message": "Falta carácter especial"}]}` | | Fallido |
| TC-06 | Validar Rol Permitido | POST /api/v1/auth/register | `{"username":"admin123", "email":"admin@test.com", "password":"Abc123$%", "first_name":"Admin", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ADMIN"}` | `{"success": false, "message": "Validation Error", "errors": [{"field": "role", "message": "Rol no permitido"}]}` | Rol ADMIN restringido | Fallido |
| TC-07 | Crear Usuario Atleta | POST /api/v1/auth/register | `{"username":"atleta123", "email":"atleta@test.com", "password":"Abc123$%", "first_name":"Atleta", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": true, "message": "Usuario registrado exitosamente. Verifique su correo.", "data": {"username": "atleta123", "email": "atleta@test.com", "id": 2, "role": "ATLETA"}}` | | Exitoso |
| TC-08 | Envío de Código | POST /api/v1/auth/register | `{"username":"juan123", "email":"juan@test.com", "password":"Abc123$%", "first_name":"Juan", "last_name":"Perez", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": true, "message": "Usuario registrado exitosamente. Verifique su correo.", "data": {"username": "juan123", "email": "juan@test.com", "id": 3}}` | Servicio de correo activo | Exitoso |
| TC-09 | Validación Email Duplicado | POST /api/v1/auth/register | `{"username":"newuser", "email":"existing@test.com", "password":"Abc123$%", "first_name":"New", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": false, "message": "Email ya registrado", "data": null, "errors": null}` (Status 409) | Usuario existe en BD | Fallido |
| TC-10 | Validación Username Duplicado | POST /api/v1/auth/register | `{"username":"juan123", "email":"newemail@test.com", "password":"Abc123$%", "first_name":"Juan", "last_name":"Perez", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA"}` | `{"success": false, "message": "Username ya registrado", "data": null, "errors": null}` (Status 409) | Usuario existe en BD | Fallido |
| TC-11 | Campos Opcionales | POST /api/v1/auth/register | `{"username":"opt123", "email":"opt@test.com", "password":"Abc123$%", "first_name":"Opt", "last_name":"User", "tipo_identificacion":"CEDULA", "identificacion":"0912345678", "phone":"0999999999", "tipo_estamento":"DEPORTISTA", "role":"ATLETA", "fecha_nacimiento": null}` | `{"success": true, "message": "Usuario registrado exitosamente. Verifique su correo.", "data": {"username": "opt123", "email": "opt@test.com", "id": 4}}` | | Exitoso |


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
| TC-L01 | Login Exitoso | Inicio de sesión con credenciales correctas | `{"username":"juan@test.com", "password":"Abc123$%"}` | `{"success": true, "message": "Inicio de sesión exitoso", "data": {"access_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c", "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4", "token_type": "bearer"}, "errors": null}` | Usuario activo y verificado | Exitoso |
| TC-L02 | Credenciales Inválidas (Password) | Intento con contraseña incorrecta | `{"username":"juan@test.com", "password":"WrongPassword"}` | `{"success": false, "message": "Credenciales inválidas", "errors": null}` (Status 401) | Usuario existe | Fallido |
| TC-L03 | Credenciales Inválidas (Usuario) | Intento con usuario inexistente | `{"username":"noexiste@test.com", "password":"Abc123$%"}` | `{"success": false, "message": "Credenciales inválidas", "errors": null}` (Status 401) | Usuario no existe | Fallido |
| TC-L04 | Usuario Inactivo | Intento de login sin validar email | `{"username":"inactive@test.com", "password":"Abc123$%"}` | `{"success": false, "message": "Usuario inactivo, por favor verifica tu email", "errors": null}` (Status 401) | Usuario registrado pero no activado | Fallido |
| TC-L05 | 2FA Requerido | Login con usuario que tiene 2FA activo | `{"username":"2fa@test.com", "password":"Abc123$%"}` | `{"success": true, "message": "2FA requerido", "data": {"temp_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InRlbXBfdG9rZW4ifQ.signature", "message": "2FA requerido"}}` | Usuario con 2FA enabled | Exitoso (Parcial) |


## FRONTEND - REFRESH TOKEN

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-R01 | Rotación Silenciosa | Renovación automática de token | Token expirado o próximo a expirar | Nuevo token recibido. Sesión se mantiene activa sin interrumpir usuario. | Refresh token válido | |
| TC-R02 | Sesión Expirada | Refresh token inválido o expirado | Token inválido | Cierre de sesión automático. Redirección al Login. | Refresh token inválido | |



## BACKEND - REFRESH TOKEN

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-R01 | Renovación Exitosa | Renovar token con refresh token válido | `{"refresh_token": "valid_refresh_token"}` | `{"success": true, "message": "Token renovado correctamente", "data": {"access_token": "eyJhbGciOiJIUzI1NiJ9.new_access_token.signature", "refresh_token": "new_refresh_token_string"}, "errors": null}` | Refresh token válido y no expirado | Exitoso |
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
| TC-E01 | Verificación Exitosa | Validar email con código correcto | `{"email": "juan@test.com", "code": "123456"}` | `{"success": true, "message": "Email verificado exitosamente", "data": {"message": "Email verificado exitosamente"}, "errors": null}` | Código válido en redis/db | Exitoso |
| TC-E02 | Código Inválido | Intento con código erróneo | `{"email": "juan@test.com", "code": "000000"}` | `{"success": false, "message": "Código inválido, expirado o se superaron los intentos máximos", "errors": null}` (Status 400) | | Fallido |
| TC-E03 | Usuario No Encontrado | Verificación para email inexistente | `{"email": "unknown@test.com", "code": "123456"}` | `{"success": false, "message": "Usuario no encontrado", "errors": null}` (Status 404) | Email no registrado | Fallido |
| TC-E04 | Reenvío Exitoso | Reenviar código a usuario inactivo | `{"email": "juan@test.com"}` | `{"success": true, "message": "Nuevo código de verificación enviado al email", "data": null, "errors": null}` | Usuario inactivo | Exitoso |
| TC-E05 | Reenvío Rate Limit | Reenvío con código aún activo | `{"email": "juan@test.com"}` | `{"success": false, "message": "Ya existe un código activo. Intenta nuevamente en unos minutos", "data": null, "errors": null}` (Status 429) | Código vigente | Fallido |
| TC-E06 | Cuenta Ya Verificada | Reenvío a cuenta activa | `{"email": "active@test.com"}` | `{"success": false, "message": "Esta cuenta ya está verificada", "data": null, "errors": null}` (Status 400) | Usuario activo | Fallido |

## FRONTEND - RECUPERACIÓN DE CONTRASEÑA

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-P01 | Solicitar Código Exitoso | Usuario solicita código de reset | Email válido | Toast: "Si el correo existe, recibirás un código.". Avanza a Paso 2 (Validar Código). | | |
| TC-P02 | Solicitar Código Inválido | Usuario ingresa email inválido (formato) | Email inválido | Validacion HTML5/JS impide envío. | | |
| TC-P03 | Validar Código Exitoso | Usuario ingresa código correcto | Código 6 dígitos válido | Toast: "Código validado correctamente.". Avanza a Paso 3 (Nueva Contraseña). | Paso 1 completado | |
| TC-P04 | Validar Código Erróneo | Usuario ingresa código incorrecto | Código incorrecto | Error (Toast): "Código inválido, expirado...". No avanza. | Paso 1 completado | |
| TC-P05 | Cambio de Contraseña Exitoso | Usuario define nueva contraseña | Password válido (min 6 chars, coincide confirmación) | Toast: "Contraseña actualizada exitosamente.". Redirección a Login (2s). | Paso 2 completado | |
| TC-P06 | Passwords No Coinciden | Error en confirmación de contraseña | Passwords diferentes | Toast: "Las contraseñas no coinciden". No envía solicitud. | En Paso 3 | |
| TC-P07 | Password Corto | Contraseña muy corta | Password < 6 chars | Toast: "La contraseña debe tener al menos 6 caracteres". No envía solicitud. | En Paso 3 | |

## BACKEND - RECUPERACIÓN DE CONTRASEÑA

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-P01 | Solicitar Reset (Email Existe) | Solicitud válida | `{"email": "juan@test.com"}` | `{"success": true, "message": "Si el email existe...", "data": null}` | Usuario existe | Exitoso |
| TC-P02 | Solicitar Reset (Email No Existe) | Solicitud email inexistente | `{"email": "unknown@test.com"}` | `{"success": true, "message": "Si el email existe...", "data": null}` (Mensaje idéntico por seguridad) | Usuario no existe | Exitoso (Simulado) |
| TC-P03 | Solicitar Reset (Rate Limit) | Solicitud repetida rápida | `{"email": "juan@test.com"}` | `{"success": false, "message": "Ya existe un código activo...", "data": null}` (Status 429) | Código activo | Fallido |
| TC-P04 | Validar Código Correcto | Validación de código | `{"email": "juan@test.com", "code": "VALIDO"}` | `{"success": true, "message": "Código válido...", "data": null}` | Código correcto en DB | Exitoso |
| TC-P05 | Validar Código Incorrecto | Validación con código erróneo | `{"email": "juan@test.com", "code": "MALO"}` | `{"success": false, "message": "Código inválido...", "data": null}` (Status 400) | | Fallido |
| TC-P06 | Completar Reset Exitoso | Cambio de contraseña final | `{"email": "juan@test.com", "code": "VALIDO", "new_password": "NewPass123!"}` | `{"success": true, "message": "Contraseña restablecida exitosamente", "data": null, "errors": null}` | Código validado | Exitoso |
| TC-P07 | Completar Reset (Código Expirado/Usado) | Intento con código viejo | `{"email": "juan@test.com", "code": "USED", "new_password": "NewPass123!"}` | `{"success": false, "message": "Código inválido, expirado o ya utilizado", "data": null}` (Status 400) | Código inválido | Fallido |
| TC-P08 | Usuario No Encontrado (Final) | Intento final con usuario borrado | `{"email": "deleted@test.com", "code": "123456", "new_password": "NewPass123!"}` | `{"success": false, "message": "Usuario no encontrado", "data": null, "errors": null}` (Status 404) | Usuario borrado post-request | Fallido |

## FRONTEND - GESTIÓN DE SESIONES

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-S01 | Listar Sesiones | Carga inicial de sesiones | Carga de componente | Lista de sesiones visible (Device info, fecha, status). Spinner de carga previo. | Usuario autenticado | |
| TC-S02 | Listar Sesiones Vacío | Usuario sin sesiones extra | N/A | Mensaje "No tienes otras sesiones activas" o lista con solo la actual. | | |
| TC-S03 | Revocar Sesión Exitoso | Usuario revoca una sesión | Click en "Cerrar Sesión" de un item | Toast: "Sesión revocada exitosamente". Item desaparece de la lista. | Sesión activa en lista | |
| TC-S04 | Revocar Sesión Fallido | Error al revocar | Click en "Cerrar Sesión" | Toast: "Error al revocar la sesión". Item permanece. | Fallo de red/backend | |
| TC-S05 | Cerrar Todas Exitoso | Usuario revoca todas (menos actual) | Click en "Cerrar todas las sesiones" | Toast: "Se revocaron X sesiones exitosamente". Lista se vacía (salvo actual). | Múltiples sesiones | |
| TC-S06 | Cerrar Todas Error | Error al revocar todas | Click en "Cerrar todas" | Toast: "Error al revocar..." | | |

## BACKEND - GESTIÓN DE SESIONES

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-S01 | Obtener Sesiones | Listado de sesiones activas | Header Auth Token | `{"success": true, "data": {"sessions": [...], "total": 2}}` | Token válido | Exitoso |
| TC-S02 | Revocar Sesión (Asegurado) | Revocar sesión ajena o inexistente | `{"session_id": "bad-id"}` | `{"success": false, "message": "Sesión no encontrada..."}` (Status 404) | | Fallido |
| TC-S03 | Revocar Sesión Exitoso | Revocar sesión propia válida | `{"session_id": "valid-id"}` | `{"success": true, "message": "Sesión revocada exitosamente"}` | Sesión existe | Exitoso |
| TC-S04 | Revocar Todas Exitoso | Revocar todas (excepto actual) | Header Auth Token | `{"success": true, "message": "Se revocaron X sesiones..."}` | Sesiones existen | Exitoso |
| TC-S05 | Revocar Todas (Sin Otras) | Revocar cuando solo hay 1 | Header Auth Token | `{"success": true, "message": "Se revocaron 0 sesiones..."}` | Solo sesión actual | Exitoso |

## FRONTEND - AUTENTICACIÓN DE DOS FACTORES (2FA)

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-2FA-01 | Habilitar 2FA (Inicio) | Usuario hace clic en "Activar 2FA" | Click en botón | Modal con QR Code visible, campo para código de 6 dígitos, spinner previo. | Usuario NO tiene 2FA activado | |
| TC-2FA-02 | Habilitar 2FA (Ya activo) | Usuario con 2FA ya activo intenta activar | Click en "Activar 2FA" | Toast: "2FA ya está habilitado". | 2FA ya activo | |
| TC-2FA-03 | Verificar Código (Éxito) | Usuario ingresa código correcto | Código: "123456" | Toast: "¡2FA Habilitado correctamente!". Vista de códigos de respaldo. | QR escaneado, código válido | |
| TC-2FA-04 | Verificar Código (Erróneo) | Usuario ingresa código incorrecto | Código: "999999" | Toast: "Código incorrecto". Input NO se limpia. | QR escaneado | |
| TC-2FA-05 | Deshabilitar 2FA (Éxito) | Usuario deshabilita con password y código correctos | Password: "Abc123!", Código: "123456" | Toast: "2FA Deshabilitado". Botón "Activar 2FA" visible nuevamente. | 2FA activo | |
| TC-2FA-06 | Deshabilitar 2FA (Password Incorrecto) | Usuario ingresa password erróneo | Password: "Wrong", Código: "123456" | Toast: "Contraseña incorrecta". | 2FA activo | |
| TC-2FA-07 | Deshabilitar 2FA (Código Incorrecto) | Usuario ingresa código erróneo | Password: "Abc123!", Código: "999999" | Toast: "Código TOTP inválido". | 2FA activo | |
| TC-2FA-08 | Copiar Secret | Usuario hace clic en "Copiar" del secret | Click en botón copiar | Toast: "Copiado al portapapeles". | Vista de QR visible | |

## BACKEND - AUTENTICACIÓN DE DOS FACTORES (2FA)

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-2FA-01 | Habilitar 2FA (Éxito) | Usuario sin 2FA solicita activación | `{}` (Header: Auth Token) | `{"secret": "JBSWY3DPEHPK3PXP", "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwFtQAAAABJRU5ErkJggg==", "backup_codes": ["ABCD-1234", "EFGH-5678", "IJKL-9012", "MNOP-3456", "QRST-7890"], "message": "Guarda estos códigos..."}` | 2FA no activo | Exitoso |
| TC-2FA-02 | Habilitar 2FA (Ya Activo) | Usuario con 2FA activo intenta activar | `{}` (Header: Auth Token) | `{"success": false, "message": "2FA ya está habilitado", "data": null}` (Status 400) | 2FA activo | Fallido |
| TC-2FA-03 | Verificar y Activar (Éxito) | Usuario verifica código TOTP | `{"code": "123456"}` | `{"success": true, "message": "2FA activado exitosamente. Ahora necesitarás un código en cada login.", "data": {"message": "2FA activado exitosamente. Ahora necesitarás un código en cada login."}}` | Setup iniciado, código válido | Exitoso |
| TC-2FA-04 | Verificar y Activar (Código Inválido) | Usuario ingresa código incorrecto | `{"code": "999999"}` | `{"success": false, "message": "Código inválido", "data": null}` (Status 400) | Setup iniciado | Fallido |
| TC-2FA-05 | Verificar y Activar (Sin Setup Previo) | Usuario intenta verificar sin /enable | `{"code": "123456"}` | `{"success": false, "message": "Primero debes iniciar el proceso con /enable", "data": null}` (Status 400) | No ejecutó /enable | Fallido |
| TC-2FA-06 | Deshabilitar 2FA (Éxito) | Usuario válido deshabilita | `{"password": "Abc123!", "code": "123456"}` | `{"success": true, "message": "2FA deshabilitado exitosamente", "data": {"message": "2FA deshabilitado exitosamente"}}` | 2FA activo, credenciales correctas | Exitoso |
| TC-2FA-07 | Deshabilitar 2FA (Password Incorrecto) | Password erróneo | `{"password": "WrongPass", "code": "123456"}` | `{"success": false, "message": "Contraseña incorrecta", "data": null}` (Status 401) | 2FA activo | Fallido |
| TC-2FA-08 | Deshabilitar 2FA (Código Incorrecto) | Código TOTP incorrecto | `{"password": "Abc123!", "code": "999999"}` | `{"success": false, "message": "Código TOTP inválido", "data": null}` (Status 400) | 2FA activo | Fallido |
| TC-2FA-09 | Deshabilitar 2FA (NO Activo) | Usuario intenta deshabilitar sin tener 2FA | `{"password": "Abc123!", "code": "123456"}` | `{"success": false, "message": "2FA no está habilitado", "data": null}` (Status 400) | 2FA no activo | Fallido |
| TC-2FA-10 | Login 2FA (Éxito) | Login con código TOTP correcto | `{"email": "test@test.com", "code": "123456", "temp_token": "eyJhbGciOiJIUzI1NiJ9.valid_temp_token.signature"}` | `{"success": true, "message": "Login exitoso", "data": {"access_token": "eyJhbGciOiJIUzI1NiJ9.access_token.signature", "refresh_token": "eyJhbGciOiJIUzI1NiJ9.refresh_token.signature"}}` | temp_token válido, 2FA activo | Exitoso |
| TC-2FA-11 | Login 2FA (Código Incorrecto) | Código TOTP inválido | `{"email": "test@test.com", "code": "999999", "temp_token": "eyJhbGciOiJIUzI1NiJ9.valid_temp_token.signature"}` | `{"success": false, "message": "Código 2FA inválido", "data": null}` (Status 401) | temp_token válido | Fallido |
| TC-2FA-12 | Login 2FA (Token Expirado) | temp_token expirado o inválido | `{"email": "test@test.com", "code": "123456", "temp_token": "invalid_token_string"}` | `{"success": false, "message": "Token temporal inválido o expirado", "data": null}` (Status 401) | | Fallido |
| TC-2FA-13 | Login 2FA (Rate Limit) | Más de 5 intentos fallidos | `{"email": "test@test.com", "code": "wrong", "temp_token": "eyJhbGciOiJIUzI1NiJ9.valid_temp_token.signature"}` | `{"success": false, "message": "Demasiados intentos fallidos. Espera 15 minutos.", "data": null}` (Status 429) | 5+ intentos previos | Fallido |
| TC-2FA-14 | Login Backup Code (Éxito) | Login con backup code válido | `{"email": "test@test.com", "backup_code": "ABCD-1234", "temp_token": "eyJhbGciOiJIUzI1NiJ9.valid_temp_token.signature"}` | `{"success": true, "message": "Login exitoso", "data": {"access_token": "eyJhbGciOiJIUzI1NiJ9.access_token.signature", "refresh_token": "eyJhbGciOiJIUzI1NiJ9.refresh_token.signature"}}` | temp_token válido, código no usado | Exitoso |
| TC-2FA-15 | Login Backup Code (Código Usado/Inválido) | Backup code ya consumido | `{"email": "test@test.com", "backup_code": "USED-CODE", "temp_token": "eyJhbGciOiJIUzI1NiJ9.valid_temp_token.signature"}` | `{"success": false, "message": "Código de respaldo inválido o ya usado", "data": null}` (Status 401) | Código previamente usado | Fallido |



## FRONTEND - GESTIÓN DE USUARIOS (ADMIN)

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-UM-01 | Listar Usuarios (Carga Inicial) | Admin carga lista de usuarios | Navegación a página | Tabla con usuarios, spinner previo. Paginación visible. | Admin autenticado | |
| TC-UM-02 | Listar Usuarios Vacío | No hay usuarios para mostrar | N/A | Mensaje "No hay usuarios registrados" o tabla vacía. | BD sin usuarios | |
| TC-UM-03 | Filtrar por Rol | Admin filtra usuarios por rol específico | Selección de rol (ATLETA) | Tabla muestra solo usuarios con rol ATLETA. | Usuarios existen | |
| TC-UM-04 | Paginación | Admin navega entre páginas | Click en "Página 2" | Carga página 2 de resultados. Spinner breve. | Más de 20 usuarios | |
| TC-UM-05 | Actualizar Rol (Éxito) | Admin cambia rol de usuario | Selección de nuevo rol + Confirmar | Toast: "Rol actualizado exitosamente". Tabla se refresca. | Permisos de admin | |
| TC-UM-06 | Actualizar Rol (Usuario No Encontrado) | Intento de actualizar usuario inexistente | Click en actualizar (usuario borrado) | Toast: "Usuario no encontrado". | Usuario fue eliminado | |
| TC-UM-07 | Actualizar Rol (Sin Permisos) | Usuario no-admin intenta acceder | Navegación a ruta admin | Redirección a página de acceso denegado. Toast: "No autorizado". | Usuario no-admin | |
| TC-UM-08 | Error de Red | Fallo de conexión al listar | Carga inicial con red caída | Toast: "Error al cargar usuarios". Estado de error visible. | Red desconectada | |

## BACKEND - GESTIÓN DE USUARIOS (ADMIN)

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-UM-01 | Listar Usuarios (Éxito) | Admin obtiene lista paginada | `GET /api/v1/auth/user-management/?page=1&size=20` (Header: Admin Token) | `{"success": true, "message": "Usuarios obtenidos correctamente", "data": {"items": [{"id": 1, "username": "user1", "email": "user1@test.com", "role": "ATLETA", "is_active": true}], "total": 1, "page": 1, "size": 20, "pages": 1}}` | Admin autenticado | Exitoso |
| TC-UM-02 | Listar Usuarios con Filtro de Rol | Filtrar solo ATLETA | `GET /api/v1/auth/user-management/?page=1&size=20&role=ATLETA` (Header: Admin Token) | `{"success": true, "message": "Usuarios obtenidos correctamente", "data": {"items": [{"id": 1, "username": "atleta1", "role": "ATLETA"}], "total": 1, "page": 1, "size": 20, "pages": 1}}` | Usuarios con rol ATLETA existen | Exitoso |
| TC-UM-03 | Listar Usuarios Vacío | No hay usuarios que cumplan filtro | `GET /api/v1/auth/user-management/?page=1&size=20&role=ENTRENADOR` (Header: Admin Token) | `{"success": true, "message": "Usuarios obtenidos correctamente", "data": {"items": [], "total": 0, "page": 1, "size": 20, "pages": 0}}` | No hay entrenadores | Exitoso |
| TC-UM-04 | Listar Usuarios (No Admin) | Usuario no-admin intenta listar | `GET /api/v1/auth/user-management/?page=1&size=20` (Header: Non-Admin Token) | `{"success": false, "message": "No autorizado. Se requieren permisos de administrador", "data": null}` (Status 403) | Usuario no-admin | Fallido |
| TC-UM-05 | Actualizar Rol de Usuario (Éxito) | Admin actualiza rol a ENTRENADOR | `PUT /api/v1/auth/user-management/1/role` con `{"role": "ENTRENADOR"}` (Header: Admin Token) | `{"success": true, "message": "Rol actualizado exitosamente", "data": {"id": 1, "username": "user1", "email": "user1@test.com", "role": "ENTRENADOR", "is_active": true}}` | Usuario existe | Exitoso |
| TC-UM-06 | Actualizar Rol (Usuario No Encontrado) | Intento con user_id inexistente | `PUT /api/v1/auth/user-management/99999/role` con `{"role": "ATLETA"}` (Header: Admin Token) | `{"success": false, "message": "Usuario no encontrado", "data": null}` (Status 404) | Usuario no existe | Fallido |
| TC-UM-07 | Actualizar Rol (Sin Permisos Admin) | Usuario regular intenta actualizar rol | `PUT /api/v1/auth/user-management/1/role` con `{"role": "ADMIN"}` (Header: Non-Admin Token) | `{"success": false, "message": "No autorizado. Se requieren permisos de administrador", "data": null}` (Status 403) | Usuario no-admin | Fallido |
| TC-UM-08 | Actualizar Rol (Validación Rol Inválido) | Rol no existente en enum | `PUT /api/v1/auth/user-management/1/role` con `{"role": "INVALID_ROLE"}` (Header: Admin Token) | `{"success": false, "message": "Validation Error", "errors": [{"field": "role", "message": "Rol inválido"}]}` (Status 422) | | Fallido |

## FRONTEND - PERFIL DE USUARIO & GESTIÓN

| ID | Funcionalidad | Descripción | Datos de Entrada | Salida Esperada | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-UP-01 | Ver Perfil | Usuario accede a "Mi Perfil" | Click en Avatar -> Perfil | Carga de formulario con datos del usuario (Nombre, Email, Rol). Avatar visible. | Usuario autenticado | |
| TC-UP-02 | Actualizar Datos Básicos | Usuario modifica nombre y teléfono | Input Nombre: "NuevoNombre", Tel: "0987654321" -> Guardar | Toast: "Perfil actualizado correctamente". Formulario muestra nuevos datos. | | |
| TC-UP-03 | Actualizar Imagen | Usuario sube nueva foto de perfil | Selección de archivo (JPG/PNG) -> Guardar | Toast: "Perfil actualizado correctamente". Nuevo avatar visible en header y formulario. | | |
| TC-UP-04 | Error Validación | Usuario deja campos requeridos vacíos | Nombre: "" -> Guardar | Mensaje de error en input o Toast: "El nombre es requerido". No envía request. | | |
| TC-UP-05 | Ver Otro Perfil (Admin) | Admin ve perfil de otro usuario | Navegación a `/users/123-uuid` | Carga de datos de usuario en modo edición (si tiene permisos) o lectura. | Admin autenticado | |

## BACKEND - PERFIL DE USUARIO & GESTIÓN

| ID | Funcionalidad | Descripción | Datos de Entrada (JSON) | Salida Esperada (JSON) | Condiciones Previas | Resultado (Exitoso/Fallido) |
|---|---|---|---|---|---|---|
| TC-UP-01 | Obtener Perfil (Me) | Usuario solicita su propio perfil | `GET /api/v1/auth/users/me` (Header: Auth Token) | `{"success": true, "message": "Perfil obtenido exitosamente", "data": {"id": 1, "username": "user1", "email": "user1@test.com", "first_name": "Juan", "last_name": "Perez", "role": "ATLETA", "profile_image": "path/to/img.jpg", "tipo_identificacion": "CEDULA", "identificacion": "0999999999"}}` | Usuario autenticado | Exitoso |
| TC-UP-02 | Actualizar Perfil (Me) | Actualizar datos básicos | `PUT /api/v1/auth/users/me` (Multipart/Form-Data)<br>Fields: `first_name="Nuevo"`, `phone="0988888888"` | `{"success": true, "message": "Perfil actualizado correctamente", "data": {"id": 1, "first_name": "Nuevo", "phone": "0988888888"}}` | Usuario autenticado | Exitoso |
| TC-UP-03 | Actualizar Perfil (Me) - Imagen | Actualizar con imagen | `PUT /api/v1/auth/users/me` (Multipart)<br>File: `profile_image` (binary) | `{"success": true, "message": "Perfil actualizado correctamente", "data": {"id": 1, "profile_image": "uploads/profiles/new_img.jpg"}}` | Usuario autenticado | Exitoso |
| TC-UP-04 | Obtener Usuario por ID | Obtener datos de otro usuario por ID externo (UUID) | `GET /api/v1/auth/users/users/{external_id}` (Header: Admin Token) | `{"success": true, "message": "Usuario encontrado exitosamente", "data": {"id": 2, "external_id": "uuid-123", "username": "other", "email": "other@test.com"}}` | Usuario existe | Exitoso |
| TC-UP-05 | Obtener Usuario (No Encontrado) | ID inexistente | `GET /api/v1/auth/users/users/uuid-fake` | `{"success": false, "message": "Usuario no encontrado", "data": null}` (Status 404) | | Fallido |
| TC-UP-06 | Actualizar Usuario por ID (Admin) | Admin actualiza datos de otro usuario | `PUT /api/v1/auth/users/{user_id}`<br>JSON: `{"first_name": "EditedByAdmin"}` | `{"success": true, "message": "Usuario actualizado correctamente", "data": {"id": 2, "first_name": "EditedByAdmin"}}` | Es Admin | Exitoso |
| TC-UP-07 | Actualizar Usuario (Forbidden) | Usuario normal intenta editar a otro | `PUT /api/v1/auth/users/{other_user_id}`<br>JSON: `{"first_name": "Hacker"}` | `{"success": false, "message": "No tienes permisos para editar este usuario", "data": null}` (Status 403) | No es self ni admin | Fallido |
