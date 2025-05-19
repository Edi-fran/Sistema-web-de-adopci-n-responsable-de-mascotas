// src/routes/publicMascotas.js
import { Router } from 'express';
import { db } from '../lib.js';

const router = Router();

// Ruta pública para obtener mascotas
router.get('/', (req, res) => {
  const mascotas = db.prepare('SELECT * FROM mascotas').all();
  res.json(mascotas);
});

export default router;
