-- Elimina las tablas si existen, en el orden correcto por claves foráneas
DROP TABLE IF EXISTS mensajes_contacto;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS citas;
DROP TABLE IF EXISTS postulaciones;
DROP TABLE IF EXISTS mascotas;
DROP TABLE IF EXISTS usuarios;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'user',
    estado TEXT NOT NULL DEFAULT 'pendiente',
    nombres_apellidos TEXT NOT NULL DEFAULT 'user'
);

-- Usuario admin por defecto
INSERT OR IGNORE INTO usuarios (email, password, rol, estado, nombres_apellidos)
VALUES ('edilsonguillin@gmail.com', '501914', 'admin', 'aprobado', 'Edilson Francisco Guillin Carrión');

-- Tabla de mascotas
CREATE TABLE mascotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especie TEXT NOT NULL,
    edad TEXT,
    sexo TEXT,
    salud TEXT,
    vacunado INTEGER DEFAULT 0,
    esterilizado INTEGER DEFAULT 0,
    historia TEXT,
    imagen TEXT
);

-- Tabla de postulaciones
CREATE TABLE postulaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    mascota_id INTEGER,
    email TEXT,
    fecha_form TEXT,
    educacion TEXT,
    foto TEXT,
    direccion TEXT,
    cedula_identidad TEXT,
    estado TEXT DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id)
);

-- Tabla de citas
CREATE TABLE citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postulacion_id INTEGER,
    fecha_hora TEXT,
    estado TEXT DEFAULT 'pendiente',
    FOREIGN KEY (postulacion_id) REFERENCES postulaciones(id)
);

-- Tabla de likes
CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    mascota_id INTEGER,
    UNIQUE(usuario_id, mascota_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id)
);

-- Tabla de mensajes de contacto
CREATE TABLE mensajes_contacto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT,
    telefono TEXT,
    mensaje TEXT
);
