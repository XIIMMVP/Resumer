#!/bin/bash

# Matar procesos antiguos para que no den problemas
echo "🧹 Limpiando procesos activos..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "🚀 Iniciando Resumer (Backend + Frontend)..."

# Iniciar Backend
(cd "/Users/xi.i.mmv.p/App resumen REUNIONES/backend" && npm run dev) > /dev/null 2>&1 &
BACKEND_PID=$!

# Iniciar Frontend
(cd "/Users/xi.i.mmv.p/App resumen REUNIONES/frontend" && npm run dev) > /dev/null 2>&1 &
FRONTEND_PID=$!

echo "⏳ Esperando 5 segundos a que arranque todo..."
sleep 5

# Abrir el navegador
open "http://localhost:3000"

echo "✅ App lista en: http://localhost:3000"
echo "---"
echo "Presiona Ctrl+C en esta terminal para detener todo."

# Captura el cierre para cerrar los subprocesos
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
