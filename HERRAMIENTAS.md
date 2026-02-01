# 🛠️ Documentación de Herramientas y Tecnologías

Este documento detalla las herramientas y tecnologías utilizadas en el proyecto **Sports Athletics Module**, explicando el propósito de cada una y la justificación de su elección.

## 🔙 Backend (athletics_fastapi)

El backend está construido sobre **Python**, aprovechando su ecosistema robusto para desarrollo web y ciencia de datos.

### Framework y Servidor
- **[FastAPI](https://fastapi.tiangolo.com/):** Framework web moderno y de alto rendimiento para construir APIs.
  - *Por qué:* Es extremadamente rápido (a la par con NodeJS y Go), ofrece validación automática de datos con Pydantic y genera documentación interactiva (Swagger UI) automáticamente.
- **[Uvicorn](https://www.uvicorn.org/):** Servidor ASGI de alta velocidad.
  - *Por qué:* Necesario para ejecutar aplicaciones asíncronas de Python como FastAPI.

### Base de Datos y ORM
- **[SQLAlchemy (Async)](https://www.sqlalchemy.org/):** ORM (Object Relational Mapper) para interactuar con la base de datos SQL.
  - *Por qué:* Permite trabajar con modelos de objetos en lugar de escribir SQL crudo, facilitando el mantenimiento y la portabilidad. La versión asíncrona maximiza el rendimiento bajo carga.
- **[Alembic](https://alembic.sqlalchemy.org/):** Herramienta de migraciones de base de datos.
  - *Por qué:* Controla las versiones del esquema de la base de datos, permitiendo aplicar y revertir cambios de estructura de manera segura.
- **[Asyncpg](https://github.com/MagicStack/asyncpg):** Driver de base de datos para PostgreSQL.
  - *Por qué:* Es el driver más rápido disponible para PostgreSQL en Python asíncrono.
- **[Redis](https://redis.io/):** Almacenamiento de estructura de datos en memoria.
  - *Por qué:* Utilizado para caché y manejo de sesiones rápidas, reduciendo la carga en la base de datos principal.

### Seguridad y Autenticación
- **[PyJWT](https://pyjwt.readthedocs.io/):** Generación y validación de JSON Web Tokens.
  - *Por qué:* Estándar de industria para autenticación segura sin estado (stateless).
- **[Passlib (Argon2)](https://passlib.readthedocs.io/):** Hasing de contraseñas.
  - *Por qué:* Argon2 es el algoritmo ganador de la Password Hashing Competition, ofreciendo máxima seguridad contra ataques de fuerza bruta.
- **[PyOTP](https://pyauth.github.io/pyotp/):** Implementación de contraseñas de un solo uso (TOTP).
  - *Por qué:* Para implementar autenticación de dos factores (2FA) compatible con Google Authenticator.

### Testing y Calidad
- **[Pytest](https://docs.pytest.org/):** Framework de pruebas.
  - *Por qué:* Sintaxis simple y potente, gran ecosistema de plugins.
- **[Pytest-cov](https://pytest-cov.readthedocs.io/):** Plugin de cobertura de código.
  - *Por qué:* Mide qué porcentaje del código está cubierto por pruebas, asegurando calidad.

---

## 🎨 Frontend (athletics_vite_ui)

El frontend es una Single Page Application (SPA) moderna enfocada en la experiencia de usuario y rendimiento.

### Core y Build
- **[React](https://react.dev/):** Biblioteca para construir interfaces de usuario.
  - *Por qué:* Basado en componentes, enorme comunidad y ecosistema, ideal para aplicaciones interactivas complejas.
- **[Vite](https://vitejs.dev/):** Herramienta de construcción (bundler).
  - *Por qué:* Ofrece tiempos de inicio de servidor de desarrollo casi instantáneos y builds de producción optimizados. Mucho más rápido que Webpack.

### Estilos y UI
- **[TailwindCSS](https://tailwindcss.com/):** Framework CSS "utility-first".
  - *Por qué:* Permite desarrollar diseños personalizados rápidamente sin salir del HTML, garantizando consistencia y fácil mantenimiento.
- **[Flowbite](https://flowbite.com/):** Biblioteca de componentes construida sobre Tailwind.
  - *Por qué:* Proporciona componentes pre-diseñados (modales, navbars, cards) que aceleran el desarrollo sin sacrificar personalización.
- **[Lucide React](https://lucide.dev/) / [React Icons](https://react-icons.github.io/react-icons/):** Bibliotecas de iconos.
  - *Por qué:* Iconos vectoriales (SVG) ligeros y modernos.

### Funcionalidad
- **[Axios](https://axios-http.com/):** Cliente HTTP.
  - *Por qué:* Manejo sencillo de peticiones API, interceptores y transformación automática de JSON.
- **[React Router DOM](https://reactrouter.com/):** Enrutamiento.
  - *Por qué:* Maneja la navegación en la SPA sin recargar la página.
- **[jsPDF](https://github.com/parallax/jsPDF) & [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable):** Generación de PDFs.
  - *Por qué:* Permite generar reportes y tablas exportables directamente desde el navegador.

---

## 🚀 CI/CD e Infraestructura (ci)

Herramientas para integración continua, despliegue y monitoreo.

### Contenedores y Orquestación
- **[Docker](https://www.docker.com/) & Docker Compose:**
  - *Por qué:* Empaqueta la aplicación y sus dependencias en contenedores, garantizando que funcione igual en desarrollo, testing y producción.

### Calidad de Código
- **[SonarQube](https://www.sonarsource.com/products/sonarqube/):** Plataforma de análisis de código estático.
  - *Por qué:* Detecta bugs, vulnerabilidades de seguridad y "code smells" automáticamente, manteniendo la deuda técnica bajo control.

### Pruebas de Carga (Stress Testing)
- **[JMeter](https://jmeter.apache.org/):** Herramienta de pruebas de carga.
  - *Por qué:* Simula múltiples usuarios concurrentes para probar el rendimiento y estabilidad del backend bajo estrés.
- **[Gatling](https://gatling.io/):** Herramienta de pruebas de carga como código.
  - *Por qué:* Alternativa moderna a JMeter, permite escribir escenarios de prueba en código (Scala/Java/Kotlin) de alto rendimiento.

### Monitoreo
- **[Prometheus](https://prometheus.io/):** Sistema de monitoreo y alertas.
  - *Por qué:* Recolecta métricas en tiempo real de los contenedores y servicios.
- **[Grafana](https://grafana.com/):** Plataforma de visualización.
  - *Por qué:* Permite crear dashboards visuales para interpretar las métricas de Prometheus (uso de CPU, memoria, latencia de requests).
- **[cAdvisor](https://github.com/google/cadvisor):** Analizador de uso de recursos de contenedores.
  - *Por qué:* Proporciona métricas detalladas de consumo de recursos por cada contenedor Docker.

---

## 💡 Resumen de Arquitectura

Esta combinación de herramientas sigue una arquitectura moderna:
1.  **Desacople:** Backend y Frontend están separados, comunicándose vía API REST.
2.  **Rendimiento:** Uso de tecnologías asíncronas (FastAPI, Asyncpg) y construcción optimizada (Vite).
3.  **Escalabilidad:** Contenedorización con Docker y diseño stateless.
4.  **Confiabilidad:** CI/CD con pruebas automáticas, análisis estático y monitoreo continuo.
