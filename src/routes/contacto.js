import express from 'express';
const router = express.Router();
import Database from 'better-sqlite3';
const db = new Database('adoptlink.db');

router.post('/', (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body;
  const stmt = db.prepare(`
    INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(nombre, email, telefono, mensaje);
  res.json({ ok: true, mensaje: 'Mensaje enviado' });
});

export default router;
