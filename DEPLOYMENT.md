# ☁️ Despliegue Unificado (Todo en Uno)

Este método es el más sencillo: una sola App, una sola URL, y sin líos de conexión.

## 🚀 Despliegue en Render (GRATIS y Sin Tarjeta)

### Paso 1: Sube los cambios a GitHub
Como hemos unificado el código, solo tienes que hacer el commit y el push:
```bash
git add .
git commit -m "feat: app unificada para producción"
git push origin main
```

### Paso 2: Crear el servicio en Render
1.  Ve a [dashboard.render.com](https://dashboard.render.com).
2.  Haz clic en **"New +"** -> **"Web Service"**.
3.  Conecta tu repositorio `Resumer`.
4.  Configura estos campos:
    *   **Name:** `resumer-app`
    *   **Region:** La que quieras (ej: Frankfurt).
    *   **Branch:** `main`.
    *   **Root Directory:** (Déjalo vacío, que use la raíz del proyecto).
    *   **Runtime:** `Node`.
    *   **Build Command:** `npm run build`
    *   **Start Command:** `npm start`
    *   **Plan:** "Free".

### Paso 3: Variables de Entorno (Environment)
Añade las siguientes variables en la pestaña **Environment**:
*   `PORT`: `10000`
*   `DEEPGRAM_API_KEY`: Tu llave.
*   `GROQ_API_KEY`: Tu llave.
*   `GROQ_MODEL`: `llama-3.3-70b-versatile`.
*   `DATABASE_PATH`: `/tmp/app.db`.
*   `MAX_FILE_SIZE`: `209715200` (esto permite hasta 200MB / ~2-3 horas de audio).

### Paso 4: ¡Listo!
Render tardará unos 2-3 minutos en construir todo. Cuando termine, te dará una URL (ej: `https://resumer-app.onrender.com`). 
**Esa URL ya contiene tanto la Web como el Servidor.** No necesitas configurar nada más. 🎉

---

## 🏗️ Estructura Unificada
Ahora tu proyecto funciona así:
1.  El código vive en `backend/` y `frontend/`.
2.  Al hacer el build, el frontend se guarda en `frontend/dist`.
3.  El servidor de Node.js (backend) detecta cualquier visita y le entrega automáticamente los archivos de `frontend/dist`.
4.  Todas las llamadas a la API (`/api/...`) se manejan internamente por el mismo servidor.

**Beneficios:**
*   Menos consumo.
*   Sin errores de CORS (conexión entre sitios).
*   Despliegue atómico (o todo funciona o nada funciona).

