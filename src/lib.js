// src/lib.js
import Database from 'better-sqlite3';
import multer   from 'multer';
import path     from 'path';
import fs       from 'fs';

// — Base de datos
export const db = new Database('adoptlink.db');

// — Middleware para solo administradores
export function isAdmin(req, res, next) {
  if (req.session?.admin) return next();
  res.status(401).json({ ok: false, msg: 'No autorizado' });
}

// — Multer para subir imágenes de mascotas
const DIR_MASC = path.join(process.cwd(), 'img-mascotas');
fs.mkdirSync(DIR_MASC, { recursive: true });
export const uploadMasc = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, DIR_MASC),
    filename:    (_, file, cb) => cb(null, Date.now() + '_' + file.originalname)
  })
});
