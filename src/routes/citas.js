import express from 'express';
const router = express.Router();
import Database from 'better-sqlite3';
const db = new Database('adoptlink.db');

// Crear una nueva cita
router.post('/', (req, res) => {
  const { postulacion_id, fecha_hora } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO citas (postulacion_id, fecha_hora, estado)
      VALUES (?, ?, 'pendiente')
    `);
    stmt.run(postulacion_id, fecha_hora);

    res.json({ ok: true, mensaje: 'Cita registrada correctamente' });
  } catch (error) {
    console.error('Error al guardar cita:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al guardar la cita' });
  }
});

// (Opcional) Obtener citas existentes
router.get('/', (req, res) => {
  try {
    const citas = db.prepare(`
      SELECT c.id, c.fecha_hora, c.estado, p.email, m.nombre AS mascota
      FROM citas c
      JOIN postulaciones p ON c.postulacion_id = p.id
      JOIN mascotas m ON p.mascota_id = m.id
    `).all();

    res.json({ ok: true, citas });
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener citas' });
  }
});

export default router;
