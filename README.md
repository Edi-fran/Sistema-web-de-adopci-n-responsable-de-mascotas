# UNIVERSIDAD DE ESPECIALIDADES ESPÍRITU SANTO

**FACULTAD DE INGENIERÍA**  
**CARRERA:** Ingeniería en Ciencias de la Computación  
**ASIGNATURA:** Diseño de Software  
**DOCENTE:** Ing. Vanessa Alexandra Jurado Vite

---

# 🐾 AdoptLink — Sistema Web de Adopción Responsable de Mascotas

## Descripción

**AdoptLink** es un sistema web colaborativo que conecta refugios, rescatistas y usuarios para facilitar la adopción responsable de mascotas. Permite a los refugios publicar animales disponibles, a los usuarios postularse para adoptar y agendar visitas, y a los administradores gestionar postulaciones y seguimiento.  
Desarrollado como parte del proyecto académico de Diseño de Software, con enfoque en arquitectura modular, control de versiones en GitHub y trabajo en equipo.

---

## Equipo de desarrollo

| Rol                                    | Nombre Completo                      | GitHub usuario |
|-----------------------------------------|--------------------------------------|:--------------:|
| **Líder y documentación**               | Alex Xavier Banchon Miranda          |                |
| **Frontend, QA**                        | Edilson Francisco Guillin Carrión    |                |
| **Backend, base de datos**              | Kevin Jordan Vargas Patiño           |                |
| **Soporte, testing y evidencias**       | Oscar Saúl Córdova Zambrano          |                |

---

## Funcionalidades principales

- Registro y autenticación de usuarios.
- Búsqueda y filtrado de mascotas por especie.
- Visualización de detalles y fotos de cada mascota.
- Postulación para adopción a través de un formulario.
- Aprobación de postulaciones por parte del refugio/admin.
- Agendamiento de citas solo para postulaciones aprobadas.
- Notificaciones por correo electrónico al usuario sobre el estado de su postulación y cita.
- Gestión de mascotas (crear, editar, eliminar) para refugios/admin.
- Seguimiento post-adopción (opcional).
- Panel de administración para ver y gestionar usuarios, postulaciones, citas y mascotas.
- Asistente virtual para ayuda rápida a los usuarios.

---

## Tecnologías usadas

- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (Fetch API)
- **Backend:** Node.js, Express.js
- **Base de datos:** SQLite (local, archivos)
- **Control de versiones:** Git, GitHub
- **Colaboración:** GitHub Projects, Issues, Wiki
- **Diagramación:** PlantUML, Draw.io
- **Extras:** Multer (uploads), nodemailer (emails), asistentes tipo chatbot

---

## Instalación local

1. **Clona este repositorio**
    ```bash
    git clone https://github.com/Edi-fran/Sistema-web-de-adopci-n-responsable-de-mascotas.git
    cd Sistema-web-de-adopci-n-responsable-de-mascotas
    ```

2. **Instala dependencias**
    ```bash
    npm install
    ```

3. **Configura las variables necesarias**  
    *(Si necesitas configurar rutas de imágenes, base de datos, etc., edita el archivo `.env` o el archivo de configuración correspondiente).*

4. **Ejecuta la aplicación**
    ```bash
    npm run dev
    # o
    node src/server.js
    ```

5. **Accede desde tu navegador**
    ```
    http://localhost:3000
    ```

---

## Documentación y evidencias

- **Documentación del proyecto:**  
  [Carpeta Google Drive](https://drive.google.com/drive/folders/1aTz-wMxiNe46pwNF0R3J2fx2dUV4k3gO?usp=sharing)

- **Video demostrativo de la funcionalidad:**  
  [Video en Google Drive](https://drive.google.com/file/d/1HkMleTKX66R50edTkEuOs-zwEl5olu5Z/view?usp=sharing)

- **Diagramas y anexos:**  
  [Ver documentación](https://drive.google.com/drive/folders/1aTz-wMxiNe46pwNF0R3J2fx2dUV4k3gO?usp=sharing)

---

## Organización del trabajo colaborativo

- **Flujo Git Flow:**  
  - Ramas por funcionalidad e integrante (`feature/documentacion-alex`, `feature/frontend-edilson`, etc.)
  - Commits descriptivos y consistentes.
  - Pull requests y revisiones cruzadas antes del merge a `main`.

- **Roles y responsables:**  
  ![Roles del equipo](docs/roles.png)

- **Planificación y cronograma:**  
  ![Gantt](docs/gantt.png)

---

## Cómo contribuir

1. **Crea tu rama:**
    ```bash
    git checkout -b feature/nombre-tarea-o-integrante
    ```
2. **Haz tus cambios y commitea:**
    ```bash
    git add .
    git commit -m "Descripción de tu aporte"
    ```
3. **Sube tu rama:**
    ```bash
    git push origin feature/nombre-tarea-o-integrante
    ```
4. **Abre un Pull Request en GitHub.**

---

## Licencia

Proyecto académico. Uso libre para fines educativos y no comerciales.

---

**¡Gracias por revisar nuestro proyecto!**
