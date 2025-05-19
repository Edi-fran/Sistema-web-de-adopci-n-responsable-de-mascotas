// src/routes/postulaciones.js
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { db } from '../lib.js';

// Ajusta la ruta según tu sistema operativo y proyecto
const DIR_USUARIOS = path.join(process.cwd(), 'img-usuarios');
if (!fs.existsSync(DIR_USUARIOS)) fs.mkdirSync(DIR_USUARIOS, { recursive: true });

const storageUser = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR_USUARIOS),
  filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});
const uploadUser = multer({ storage: storageUser });

const router = Router();

/**
 * POST /api/postulaciones
 * Recibe una postulación con posible archivo de foto (opcional).
 * Espera campos:
 *  - usuario_id, mascota_id, email, telefono, fecha_form, educacion, direccion, cedula_identidad, estado
 */
router.post('/', uploadUser.single('foto'), (req, res) => {
  try {
    const {
      usuario_id,
      mascota_id,
      email,
      telefono,
      fecha_form,
      educacion,
      direccion,
      cedula_identidad,
      estado = 'pendiente'
    } = req.body;

    // Validación básica
    if (!usuario_id || !mascota_id || !email) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    // Ruta de la foto si se subió
    let foto = null;
    if (req.file) {
      foto = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
    }

    // Inserción
    const result = db.prepare(`
      INSERT INTO postulaciones 
      (usuario_id, mascota_id, email, telefono, fecha_form, educacion, foto, direccion, cedula_identidad, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id, mascota_id, email, telefono, fecha_form, educacion, foto, direccion, cedula_identidad, estado
    );

    res.json({ ok: true, msg: 'Postulación enviada', postulacion_id: result.lastInsertRowid });
  } catch (e) {
    console.error('[POST /postulaciones] ERROR:', e);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

// (Puedes añadir aquí rutas GET para ver postulaciones, etc.)

export default router;
