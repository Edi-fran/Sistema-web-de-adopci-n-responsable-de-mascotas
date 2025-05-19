// src/init-db.js
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Crear conexión
const db = new Database("adoptlink.db");

// Leer el esquema SQL (ajusta la ruta si está en otra carpeta)
const schemaPath = path.join("db", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

// Insertar usuario administrador y normal
db.prepare(`
  INSERT OR IGNORE INTO usuarios (email, password, rol, estado, nombres_apellidos)
  VALUES
    ('admin@adoptlink.com', 'admin123', 'admin', 'aprobado', 'Administrador AdoptLink'),
    ('user1@mail.com', '1234', 'user', 'pendiente', 'Usuario Uno');
`).run();

// Insertar mascotas de prueba
db.prepare(`
  INSERT OR IGNORE INTO mascotas (nombre, especie, edad, sexo, salud, vacunado, esterilizado, historia, imagen)
  VALUES
    ('Luna', 'Perro', '2 años', 'Hembra', 'Buena', 1, 1, 'Rescatada en Quito', 'https://placedog.net/400/300?id=1'),
    ('Mia', 'Gato', '3 años', 'Hembra', 'Excelente', 1, 0, 'Abandonada cerca del bosque', 'https://placekitten.com/400/300');
`).run();

// Obtener IDs para asociar
const userId = db.prepare("SELECT id FROM usuarios WHERE email = ?").get('user1@mail.com')?.id;
const mascotaId = db.prepare("SELECT id FROM mascotas WHERE nombre = ?").get('Luna')?.id;

// Insertar una postulación de prueba
if (userId && mascotaId) {
  db.prepare(`
    INSERT OR IGNORE INTO postulaciones (
      usuario_id, mascota_id, email, fecha_form, educacion, foto,
      direccion, cedula_identidad, estado
    )
    VALUES (?, ?, ?, '2025-05-16', 'Universitaria', 'foto1.jpg',
            'Calle Falsa 123', '1104750123', 'pendiente');
  `).run(userId, mascotaId, 'user1@mail.com');
}

// Mensaje de éxito
console.log("✔ Base de datos creada con datos de prueba");

// Cerrar conexión
db.close();
