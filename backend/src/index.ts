import dotenv from 'dotenv';
// Load environment variables MUST be first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './db/schema';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
// Aumentar el límite para audios largos (200MB para ~2-3 horas)
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Initialize database
initializeDatabase();

// Api Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SERVIR EL FRONTEND (UNA SOLA APP)
// Servir archivos estáticos del frontend de la carpeta dist
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Ruta catch-all para enviar todo lo demás al frontend (Single Page App)
app.get('*', (req: Request, res: Response) => {
  // Solo entregar el index si no es una petición a la API
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UNIFIED APP running on port ${PORT}`);
  console.log(`📁 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Web: http://localhost:${PORT}`);
});

export default app;

