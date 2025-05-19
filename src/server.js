// src/server.js
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Importa rutas personalizadas
import contacto from './routes/contacto.js';
import postulaciones from './routes/postulaciones.js';
import citas from './routes/citas.js';
import usuarios from './routes/usuarios.js';
import adminRoutes from './routes/admin.js';
import mascotas from './routes/publicMascotas.js';

import { db } from './lib.js'; // Conexión a SQLite (por si necesitas en alguna ruta)

// --- Definición de carpetas ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR    = path.join(__dirname, '..', 'public');
const DIR_MASCOTAS  = path.join(process.cwd(), 'img-mascotas');
const DIR_USUARIOS  = path.join(process.cwd(), 'img-usuarios');

// Crear carpetas si no existen
if (!fs.existsSync(DIR_MASCOTAS))  fs.mkdirSync(DIR_MASCOTAS, { recursive: true });
if (!fs.existsSync(DIR_USUARIOS))  fs.mkdirSync(DIR_USUARIOS, { recursive: true });

// --- Multer para imágenes (mascotas y usuarios) ---
const storageMasc = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR_MASCOTAS),
  filename:    (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_')),
});
const storageUser = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR_USUARIOS),
  filename:    (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_')),
});

export const uploadMasc = multer({ storage: storageMasc });
export const uploadUser = multer({ storage: storageUser });

// --- Middleware para verificar administrador robusto ---
export function isAdmin(req, res, next) {
  // Mejorado: chequea sesión y rol admin
  if (req.session && req.session.user && req.session.user.rol === 'admin') return next();
  return res.status(403).json({ error: 'No autorizado: solo administradores.' });
}

// --- Inicializa Express ---
const app = express();

// Logger simple y elegante
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- Middlewares globales ---
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '20mb' })); // Para grandes cargas
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// --- Sesiones (usa variable de entorno para producción) ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'adoptlink-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 3 } // 3 horas
}));

// --- Archivos estáticos públicos (frontend) ---
app.use(express.static(PUBLIC_DIR));

// --- Servir imágenes públicas desde carpetas ---
app.use('/imgs/mascotas', express.static(DIR_MASCOTAS));
app.use('/imgs/usuarios', express.static(DIR_USUARIOS));

// --- Enrutadores principales (API REST) ---
app.use('/api/contacto', contacto);
app.use('/api/postulaciones', postulaciones);
app.use('/api/citas', citas);
app.use('/api/usuarios', usuarios);
app.use('/api/admin', adminRoutes);            // El router debe usar isAdmin en las rutas sensibles
app.use('/api/public/mascotas', mascotas);

// --- Ruta de health check ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', now: new Date() }));

// --- Rutas extra de utilidad (puedes agregar más aquí) ---
app.get('/api/version', (req, res) => res.json({ version: '1.0.0', app: 'AdoptLink' }));

// --- Ruta 404 (debe ir después de todas las demás rutas) ---
app.use((req, res) => {
  // Si la petición es HTML, mostrar página 404 amigable (opcional)
  if (req.accepts('html')) {
    // Si existe un 404.html personalizado, muéstralo
    const custom404 = path.join(PUBLIC_DIR, '404.html');
    if (fs.existsSync(custom404)) {
      return res.status(404).sendFile(custom404);
    }
  }
  // Si es JSON, error estructurado
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --- Iniciar servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(` AdoptLink backend escuchando en: http://localhost:${PORT}`);
  console.log(`===========================================\n`);
});

// --- Exporta app para pruebas u otros módulos ---
export default app;
