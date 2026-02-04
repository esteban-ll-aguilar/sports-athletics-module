"""
=================================================================
MAIN LOCUSTFILE - Todos los módulos combinados
=================================================================
Archivo: ci/stress_tests/locust/locustfile.py
Uso: locust -f locustfile.py --host=http://localhost:8080

Este archivo importa y ejecuta TODOS los usuarios de carga
de todos los módulos simultáneamente.

Para pruebas de módulos individuales, usar:
  - auth_load.py
  - atleta_load.py
  - entrenador_load.py
  - competencia_load.py
  - representante_load.py
  - admin_load.py
=================================================================
"""

# Importar todos los usuarios de los módulos
from auth_load import AuthUser, AuthRegistrationUser
from atleta_load import AtletaUser, AtletaReadOnlyUser
from entrenador_load import EntrenadorUser, EntrenadorReadOnlyUser
from competencia_load import CompetenciaUser, CompetenciaReadOnlyUser
from representante_load import RepresentanteUser, RepresentanteReadOnlyUser
from admin_load import AdminUser, AdminAccessDeniedUser

# Los usuarios se registran automáticamente en Locust
# al ser importados. No se necesita código adicional.

# Para configurar los weights (proporciones), se hace
# en cada clase individual con el atributo `weight`.

# Ejemplo de ejecución:
# locust -f locustfile.py --host=http://localhost:8080 -u 10 -r 2 --run-time 60s
