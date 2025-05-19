// src/routes/postulaciones.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../lib.js';

const router = Router();

const DIR_FOTOS = path.join(process.cwd(), 'img-usuarios');
if (!fs.existsSync(DIR_FOTOS)) fs.mkdirSync(DIR_FOTOS, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR_FOTOS),
  filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

// POST /api/postulaciones
router.post('/', upload.single('foto'), (req, res) => {
  try {
    const {
      usuario_id,
      mascota_id,
      email,
      telefono,
      direccion,
      cedula_identidad,
      educacion
    } = req.body;

    // VALIDACIÓN: campos obligatorios
    if (!usuario_id || !mascota_id || !email) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    // Foto (opcional)
    let foto = null;
    if (req.file) {
      foto = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
    }

    // Guarda la postulación
    db.prepare(`
      INSERT INTO postulaciones
      (usuario_id, mascota_id, email, telefono, direccion, cedula_identidad, educacion, foto, fecha_form, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'), 'pendiente')
    `).run(
      usuario_id, mascota_id, email, telefono || '', direccion || '',
      cedula_identidad || '', educacion || '', foto
    );

    res.json({ ok: true, mensaje: 'Postulación registrada con éxito' });
  } catch (e) {
    console.error('[postulaciones] Error al registrar:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno al registrar postulación.' });
  }
});

export default router;
