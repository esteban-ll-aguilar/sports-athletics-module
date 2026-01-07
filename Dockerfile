# # Usa la imagen oficial de Jenkins LTS como base
# FROM jenkins/jenkins:lts

# # Cambia a usuario root para instalar dependencias
# USER root

# # Actualiza e instala dependencias necesarias
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     libssl-dev \
#     zlib1g-dev \
#     libbz2-dev \
#     libreadline-dev \
#     libsqlite3-dev \
#     wget \
#     curl \
#     llvm \
#     libncurses5-dev \
#     libncursesw5-dev \
#     xz-utils \
#     tk-dev \
#     libffi-dev \
#     liblzma-dev \
#     git \
#     ca-certificates \
#     python3-venv \
#     python3.13-venv \
#     lsb-release \
#     gnupg \
#     && rm -rf /var/lib/apt/lists/*

# # Instala Python 3.12
# RUN wget https://www.python.org/ftp/python/3.12.1/Python-3.12.1.tgz && \
#     tar -xf Python-3.12.1.tgz && \
#     cd Python-3.12.1 && \
#     ./configure --enable-optimizations && \
#     make -j$(nproc) && \
#     make altinstall && \
#     cd .. && \
#     rm -rf Python-3.12.1 Python-3.12.1.tgz

# # Crea enlaces simbólicos para python y pip
# RUN ln -sf /usr/local/bin/python3.12 /usr/local/bin/python && \
#     ln -sf /usr/local/bin/pip3.12 /usr/local/bin/pip

# # Actualiza pip y instala virtualenv
# RUN pip install --upgrade pip setuptools wheel virtualenv

# # Instala librerías comunes de Python (opcional, ajusta según necesites)
# RUN pip install \
#     requests \
#     pytest \
#     pylint \
#     black

# # Instalar Docker CLI y Docker Compose
# RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
#     echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
#     $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
#     apt-get update && \
#     apt-get install -y docker-ce-cli docker-compose-plugin && \
#     rm -rf /var/lib/apt/lists/*

# # Agregar jenkins al grupo docker (GID 999 es común para docker)
# RUN groupadd -g 999 docker || true && \
#     usermod -aG docker jenkins

# # Vuelve al usuario jenkins
# USER jenkins

# # Expone el puerto de Jenkins
# EXPOSE 8080
# EXPOSE 50000

# # Define volúmenes para persistencia de datos
# VOLUME /var/jenkins_home

# # Construir la imagen
# # docker build -t jenkins-python312 .

# # Ejecutar el contenedor
# # docker run -d -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home --name jenkins jenkins-python312

# # Obtener la contraseña inicial:
# # bashdocker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword