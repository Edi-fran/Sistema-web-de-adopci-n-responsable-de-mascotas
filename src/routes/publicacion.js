// src/routes/publicMascotas.js
import { Router } from 'express';
import { db } from '../lib.js';

const router = Router();

router.get('/', async (req, res) => {
  const mascotas = await db.all('SELECT * FROM mascotas');
  res.json(mascotas);
});

export default router;
