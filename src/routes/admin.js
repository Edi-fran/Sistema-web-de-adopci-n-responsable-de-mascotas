// src/routes/admin.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, isAdmin } from '../lib.js';

const router = Router();
router.use(isAdmin);

const DIR_MASC = "C:/Users/phant/Videos/mascotas/img-mascotas";
const DIR_USU = "C:/Users/phant/Videos/mascotas/img-usuarios";

[DIR_MASC, DIR_USU].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];
function esExtensionValida(nombre) {
  return extensionesPermitidas.includes(path.extname(nombre).toLowerCase());
}

const storageMascotas = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR_MASC),
  filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});
const storageUsuarios = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR_USU),
  filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});

const uploadMasc = multer({ storage: storageMascotas });
const uploadUsu = multer({ storage: storageUsuarios });
const upload = multer({ dest: 'temp' });

const tablas = [
  'usuarios',
  'mascotas',
  'postulaciones',
  'citas',
  'likes',
  'mensajes_contacto'
];

function listAll(table) {
  return db.prepare(`SELECT * FROM ${table}`).all();
}
function getById(table, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
}
function deleteById(table, id) {
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}
function updateById(table, id, body) {
  const keys = Object.keys(body);
  if (!keys.length) return;
  const set = keys.map(k => `${k} = ?`).join(',');
  const vals = keys.map(k => body[k]);
  db.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`).run(...vals, id);
}

// =================== CRUD BÁSICO ===================
router.get('/:table', (req, res, next) => {
  const { table } = req.params;
  if (!tablas.includes(table)) return next();
  res.json(listAll(table));
});

router.get('/:table/:id', (req, res, next) => {
  const { table, id } = req.params;
  if (!tablas.includes(table)) return next();
  const row = getById(table, id);
  if (!row) return res.status(404).json({ ok: false, msg: 'No existe' });
  res.json(row);
});

router.delete('/:table/:id', (req, res, next) => {
  const { table, id } = req.params;
  if (!tablas.includes(table)) return next();
  deleteById(table, id);
  res.json({ ok: true });
});

// =================== UPDATE/EDITAR registros (PUT) ===================
router.put('/:table/:id', upload.any(), (req, res, next) => {
  const { table, id } = req.params;
  if (!tablas.includes(table)) return next();

  const campos = { ...req.body };
  let mensajeImagen = '';

  if (req.files && req.files.length) {
    for (const file of req.files) {
      const campo = file.fieldname;
      let destino = '';
      if (!esExtensionValida(file.originalname)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ ok: false, msg: 'Extensión de archivo no permitida' });
      }
      if (file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ ok: false, msg: 'Archivo demasiado grande (máx. 5MB)' });
      }
      if (table === 'mascotas' && campo === 'imagen') destino = DIR_MASC;
      else if (table === 'postulaciones' && campo === 'foto') destino = DIR_USU;
      else destino = 'temp';
      if (!fs.existsSync(destino)) fs.mkdirSync(destino, { recursive: true });
      const nuevoNombre = Date.now() + '_' + file.originalname.replace(/\s+/g, '_');
      const rutaFinal = path.join(destino, nuevoNombre);
      fs.renameSync(file.path, rutaFinal);
      campos[campo] = path.relative(process.cwd(), rutaFinal).replace(/\\/g, '/');
      mensajeImagen = 'Imagen guardada o actualizada';
    }
  }

  // Eliminar campos vacíos o nulos (no sobrescribe con 'null' o '')
  Object.keys(campos).forEach(k => {
    if (campos[k] === '' || campos[k] === undefined || campos[k] === null || campos[k] === 'null') {
      delete campos[k];
    }
  });
  if ('id' in campos) delete campos.id;

  if (!Object.keys(campos).length) {
    return res.status(400).json({ ok: false, msg: 'Nada para actualizar.' });
  }

  updateById(table, id, campos);
  res.json({ ok: true, msg: mensajeImagen || 'Registro actualizado' });
});

// =================== CREAR Mascota ===================
router.post('/mascotas', uploadMasc.single('imagen'), (req, res) => {
  const { nombre, especie, edad, sexo, salud, historia } = req.body;
  if (!nombre || !especie) {
    return res.status(400).json({ ok: false, msg: 'Faltan datos requeridos' });
  }

  if (req.file && !esExtensionValida(req.file.originalname)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ ok: false, msg: 'Extensión de imagen no válida' });
  }
  const imagen = req.file
    ? path.relative(process.cwd(), path.join(DIR_MASC, req.file.filename)).replace(/\\/g, '/')
    : null;

  db.prepare(`
    INSERT INTO mascotas (nombre, especie, edad, sexo, salud, historia, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(nombre, especie, edad, sexo, salud, historia, imagen);
  res.json({ ok: true, msg: 'Mascota registrada con imagen' });
});

// =================== CREAR Postulación ===================
router.post('/postulaciones', uploadUsu.single('foto'), (req, res) => {
  const campos = { ...req.body };

  if (!campos.usuario_id || !campos.mascota_id || !campos.email) {
    return res.status(400).json({ ok: false, msg: 'Faltan datos requeridos' });
  }

  if (req.file && !esExtensionValida(req.file.originalname)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ ok: false, msg: 'Extensión de imagen no válida' });
  }
  if (req.file) {
    campos.foto = path.relative(process.cwd(), path.join(DIR_USU, req.file.filename)).replace(/\\/g, '/');
  }

  // Incluye 'telefono' si existe en la base de datos
  db.prepare(`
    INSERT INTO postulaciones 
    (usuario_id, mascota_id, email, telefono, fecha_form, educacion, foto, direccion, cedula_identidad, estado)
    VALUES 
    (@usuario_id, @mascota_id, @email, @telefono, @fecha_form, @educacion, @foto, @direccion, @cedula_identidad, @estado)
  `).run(campos);

  res.json({ ok: true, msg: 'Postulación registrada correctamente' });
});

// Aprobar postulación (ejemplo)
router.put('/postulaciones/:id/aprobar', (req, res) => {
  updateById('postulaciones', req.params.id, { estado: 'aprobada' });
  res.json({ ok: true });
});

export default router;




