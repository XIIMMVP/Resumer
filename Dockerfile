# Usar una imagen de Node completa para evitar fallos de compilación con sqlite3
FROM node:20

# Instalar herramientas básicas necesarias para módulos nativos (g++, make, etc.)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración PRIMERO para aprovechar el cache de Docker
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Limpiar cualquier rastro de node_modules locales (por si se subieron por error)
# e instalar dependencias limpias para Linux
RUN rm -rf node_modules backend/node_modules frontend/node_modules
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para el build del frontend
ENV VITE_API_URL=/api

# Construir el frontend y el backend
RUN npm run build

# Crear carpetas necesarias y asegurar permisos
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

# Exponer el puerto que usa Hugging Face (7860)
ENV PORT=7860
EXPOSE 7860

# Comando para arrancar el servidor unificado
CMD ["npm", "start"]
