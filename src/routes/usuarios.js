import express from "express";
import { db } from "../lib.js";

const router = express.Router();

// LOGIN de usuarios y administradores
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ ok: false, error: "Faltan datos" });

  // Busca usuario por email y password
  const user = db.prepare(
    `SELECT * FROM usuarios WHERE email = ? AND password = ?`
  ).get(email, password);

  if (!user)
    return res.json({ ok: false, error: "Usuario o contraseña incorrectos" });

  // Si es usuario normal, debe estar aprobado
  if (user.rol === "user" && user.estado !== "aprobado") {
    return res.json({ ok: false, error: "Usuario pendiente de aprobación" });
  }

  // Opcional: Puedes guardar info en sesión (para admin)
  if (req.session) {
    req.session.userId = user.id;
    req.session.rol = user.rol;
    if (user.rol === 'admin') req.session.admin = true;
  }

  res.json({ ok: true, user });
});

// REGISTRO: solo permite rol 'user', estado 'aprobado' por defecto
router.post("/register", (req, res) => {
  const { nombres_apellidos, email, password } = req.body;
  if (!nombres_apellidos || !email || !password)
    return res.json({ ok: false, error: "Faltan datos" });

  try {
    db.prepare(
      `INSERT INTO usuarios (nombres_apellidos, email, password, rol, estado)
       VALUES (?, ?, ?, 'user', 'aprobado')`
    ).run(nombres_apellidos, email, password);

    res.json({ ok: true });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.json({ ok: false, error: "Correo ya registrado" });
    }
    res.json({ ok: false, error: "Error al registrar" });
  }
});

// LOGOUT (opcional, por si lo necesitas en el frontend)
router.post('/logout', (req, res) => {
  req.session?.destroy?.();
  res.json({ ok: true });
});

export default router;
