/* AdoptLink – Front-end logic (Bootstrap 5 + Fetch API) */

/* ---------- Constantes LocalStorage ---------- */
const LS_USER = 'currentUser';
const LS_POST = 'ultimaPostulacion';
const LS_LIKES = 'likes';

/* ---------- Helpers ---------- */
const getCurrent = () => JSON.parse(localStorage.getItem(LS_USER) || 'null');
const setCurrent = (u) => localStorage.setItem(LS_USER, JSON.stringify(u));
const getLikes = () => JSON.parse(localStorage.getItem(LS_LIKES) || '{}');
const setLikes = (obj) => localStorage.setItem(LS_LIKES, JSON.stringify(obj));

/* ---------- Placeholder de imagen ---------- */
const PLACE_IMG = 'https://via.placeholder.com/400x300?text=Mascota';

/* ---------- Referencias DOM ---------- */
const btnShowAuth   = document.getElementById('btnShowAuth');
const btnLogout     = document.getElementById('btnLogout');
const logoutItem    = document.getElementById('logoutItem');
const scheduleLink  = document.getElementById('scheduleLink');

// Modal de autenticación
const authModalEl   = document.getElementById('authModal');
const authModal     = authModalEl ? new bootstrap.Modal(authModalEl) : null;
const toggleAuth    = document.getElementById('toggleAuth');
const authTitle     = document.getElementById('authTitle');
const loginFields   = document.getElementById('loginFields');
const registerFields= document.getElementById('registerFields');
const authForm      = document.getElementById('authForm');
const authSubmit    = document.getElementById('authSubmit');
let isLogin = true;

// ---- Modal Mascota ----
const petModalEl    = document.getElementById('petModal');
const petModal      = petModalEl ? new bootstrap.Modal(petModalEl) : null;
const petNameEl     = document.getElementById('pet-name');
const petImgEl      = document.getElementById('pet-image');
const petInfoEl     = document.getElementById('pet-info');
const btnLike       = document.getElementById('likeBtn');
const btnPost       = document.getElementById('applyBtn');

// ---- Postulación ----
const applyModalEl  = document.getElementById('applyModal');
const applyModal    = applyModalEl ? new bootstrap.Modal(applyModalEl) : null;
const applyForm     = document.getElementById('applyForm');
const applyPetName  = document.getElementById('applyPetName');
const petSelected   = document.getElementById('petSelected');

// ---- Agendar Cita ----
const schedModalEl  = document.getElementById('scheduleModal');
const schedModal    = schedModalEl ? new bootstrap.Modal(schedModalEl) : null;
const schedCedula   = document.getElementById('schedCedula');
const schedEmail    = document.getElementById('schedEmail');
const schedPet      = document.getElementById('schedPet');
const schedDatetime = document.getElementById('schedDatetime');
const scheduleForm  = document.getElementById('scheduleForm');

// ---- Contacto ----
const contactForm = document.getElementById('contactForm');

// ---- Mascotas ----
const petGrid = document.getElementById('pet-grid');
let pets = [];

// ====================== AUTENTICACIÓN MODAL ======================

if (btnShowAuth && authModal) {
  btnShowAuth.onclick = () => {
    isLogin = true;
    setAuthForm();
    authModal.show();
  };
}

if (toggleAuth) {
  toggleAuth.onclick = (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    setAuthForm();
  };
}

function setAuthForm() {
  if (!authTitle || !loginFields || !registerFields || !authSubmit || !toggleAuth) return;
  // Limpia el formulario al alternar
  if (authForm) authForm.reset();

  if (isLogin) {
    // Muestra solo campos login
    loginFields.style.display = '';
    registerFields.style.display = 'none';
    Array.from(loginFields.querySelectorAll('input')).forEach(input => input.required = true);
    Array.from(registerFields.querySelectorAll('input')).forEach(input => input.required = false);
    authTitle.textContent = 'Login';
    authSubmit.textContent = 'Entrar';
    toggleAuth.textContent = '¿No tienes cuenta? Regístrate';
  } else {
    registerFields.style.display = '';
    loginFields.style.display = 'none';
    Array.from(registerFields.querySelectorAll('input')).forEach(input => input.required = true);
    Array.from(loginFields.querySelectorAll('input')).forEach(input => input.required = false);
    authTitle.textContent = 'Registro';
    authSubmit.textContent = 'Registrar';
    toggleAuth.textContent = '¿Ya tienes cuenta? Inicia sesión';
  }
}

// Mantener el nombre de usuario tras recarga de página
document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
});

function updateHeader() {
  const cur = getCurrent();
  if (btnShowAuth) {
    if (cur && cur.nombres_apellidos) {
      btnShowAuth.textContent = cur.nombres_apellidos;
      btnShowAuth.classList.replace('btn-outline-secondary','btn-outline-success');
      btnShowAuth.disabled = true;
      if (logoutItem) logoutItem.style.display = '';
      // Mostrar Agendar Cita si está logueado
      if (scheduleLink) scheduleLink.style.display = '';
    } else {
      btnShowAuth.textContent = "Login";
      btnShowAuth.classList.replace('btn-outline-success','btn-outline-secondary');
      btnShowAuth.disabled = false;
      if (logoutItem) logoutItem.style.display = 'none';
      if (scheduleLink) scheduleLink.style.display = 'none';
    }
  }
}

// Submit del modal (login y registro)
if (authForm) {
  authForm.onsubmit = async e => {
    e.preventDefault();

    if (isLogin) {
      // LOGIN
      const email = authForm.elements['email'].value.trim();
      const password = authForm.elements['password'].value.trim();
      try {
        const r = await fetch('/api/usuarios/login', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ email, password })
        });
        const j = await r.json();
        if (j.ok && j.user) {
          if (j.user.rol === 'admin' && j.user.estado !== 'aprobado') {
            alert('Administrador pendiente de aprobación.');
            return;
          }
          setCurrent(j.user);
          if (j.user.rol === 'admin') {
            window.location.href = '/admin.html';
          } else {
            if (authModal) authModal.hide();
            updateHeader();
          }
        } else {
          alert(j.mensaje || j.error || 'Usuario o contraseña incorrectos');
        }
      } catch (err) {
        alert('Error de conexión con el servidor');
      }
    } else {
      // REGISTRO: solo user
      const nombres = authForm.elements['full_name'] ? authForm.elements['full_name'].value.trim() : '';
      const remail = authForm.elements['remail'] ? authForm.elements['remail'].value.trim() : '';
      const rpassword = authForm.elements['rpassword'] ? authForm.elements['rpassword'].value.trim() : '';
      if (!nombres || !remail || !rpassword) return alert('Completa todos los campos');

      try {
        const res = await fetch('/api/usuarios/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombres_apellidos: nombres,
            email: remail,
            password: rpassword,
            rol: 'user'
          })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          alert('Registro exitoso, ahora puedes iniciar sesión');
          isLogin = true;
          setAuthForm();
        } else {
          alert(data.mensaje || data.error || 'Error al registrar');
        }
      } catch (err) {
        alert('Error de conexión');
      }
    }
  };
}

// LOGOUT (cierra sesión en backend y frontend)
if (btnLogout) {
  btnLogout.onclick = async () => {
    try { await fetch('/api/usuarios/logout', { method: 'POST' }); } catch {}
    localStorage.clear();
    updateHeader();
    location.reload();
  };
}

// ====================== LÓGICA DE MASCOTAS ======================

async function loadPets() {
  try {
    pets = await fetch('/api/public/mascotas').then(r => r.json());
    if (!petGrid) return;
    petGrid.innerHTML = '';
    pets.forEach(p => {
      const imgPath = p.imagen ? `/imgs/mascotas/${p.imagen.split('/').pop()}` : PLACE_IMG;
      petGrid.insertAdjacentHTML('beforeend', `
        <div class="col-md-4">
          <div class="card h-100 shadow-sm">
            <img src="${imgPath}" class="card-img-top" alt="${p.nombre}" style="height: 220px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-center">${p.nombre}</h5>
              <p class="text-muted text-center">${p.especie} · ${p.edad || 'Edad desconocida'}</p>
              <button class="btn btn-outline-primary mt-auto mx-auto" data-id="${p.id}" data-bs-toggle="modal" data-bs-target="#petModal">Ver detalles</button>
            </div>
          </div>
        </div>`);
    });
  } catch (e) { /* no-op */ }
}
if (petGrid) loadPets();

if (petModalEl && petModal) {
  petModalEl.addEventListener('show.bs.modal', (ev) => {
    const id = +ev.relatedTarget.dataset.id;
    const p  = pets.find(x => x.id === id);
    if (!p) return;
    if (petNameEl) petNameEl.textContent = p.nombre;
    if (petImgEl) petImgEl.src = p.imagen ? `/imgs/mascotas/${p.imagen.split('/').pop()}` : PLACE_IMG;
    if (petInfoEl) petInfoEl.innerHTML = `
      <p><strong>Especie:</strong> ${p.especie}</p>
      <p><strong>Edad:</strong> ${p.edad}</p>
      <p><strong>Sexo:</strong> ${p.sexo}</p>
      <p><strong>Salud:</strong> ${p.salud}</p>
      <p><strong>Historia:</strong><br>${p.historia}</p>`;
    if (btnLike) {
      const liked = getLikes()[p.id];
      btnLike.textContent = liked ? '💖 Te gusta' : '❤ Me gusta';
    }
    if (applyPetName) applyPetName.value = p.nombre;
    if (petSelected) petSelected.value = p.id;
  });
  if (btnLike) {
    btnLike.onclick = () => {
      if (!petNameEl) return;
      const id = pets.find(p => p.nombre === petNameEl.textContent)?.id;
      if (!id) return;
      const likes = getLikes();
      likes[id] = !likes[id];
      setLikes(likes);
      btnLike.textContent = likes[id] ? '💖 Te gusta' : '❤ Me gusta';
    };
  }
}

// ====================== LÓGICA DE POSTULACIÓN ======================

if (applyForm) {
  applyForm.onsubmit = async e => {
    e.preventDefault();
    const cur = getCurrent();
    if (!cur) return alert('Debes iniciar sesión');
    const fd = new FormData(applyForm);
    const body = {
      usuario_id : cur.id,
      mascota_id : +petSelected.value,
      email      : fd.get('email'),
      fecha_form : fd.get('fecha_form'),
      educacion  : fd.get('educacion'),
      direccion  : fd.get('address')
    };
    const r = await fetch('/api/postulaciones',{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
    });
    const j = await r.json();
    if (!j.ok) return alert(j.mensaje);
    alert('¡Postulación enviada!');
    localStorage.setItem(LS_POST, JSON.stringify({
      id      : j.postulacion.id,
      cedula  : fd.get('cedula') || '---',
      petName : applyPetName.value
    }));
    applyForm.reset();
    if (applyModal) applyModal.hide();
    updateHeader();
  };
}

// ====================== AGENDAR CITA ======================

if (scheduleLink && schedModal && scheduleForm) {
  scheduleLink.onclick = async e => {
    e.preventDefault();
    const cur = getCurrent();
    if (!cur) return alert('Debes iniciar sesión');

    // Verifica postulación aprobada por email
    let postulacionAprobada = null;
    try {
      const resp = await fetch(`/api/postulaciones/aprobada?email=${encodeURIComponent(cur.email)}`);
      if (resp.ok) postulacionAprobada = await resp.json();
    } catch {}
    if (!postulacionAprobada || !postulacionAprobada.ok || !postulacionAprobada.postulacion) {
      alert('Debes tener una postulación aprobada para agendar cita.');
      return;
    }

    // Prepara el modal con datos de la postulación aprobada
    const post = postulacionAprobada.postulacion;
    if (schedCedula) schedCedula.textContent = post.cedula || '---';
    if (schedEmail)  schedEmail.textContent  = cur.email;
    if (schedPet)    schedPet.textContent    = post.nombre_mascota || post.petName || 'Mascota';
    if (schedDatetime) schedDatetime.value   = '';
    schedModal.show();
  };

  scheduleForm.onsubmit = async e => {
    e.preventDefault();

    // Busca postulación aprobada del usuario actual
    const cur = getCurrent();
    let postulacionAprobada = null;
    try {
      const resp = await fetch(`/api/postulaciones/aprobada?email=${encodeURIComponent(cur.email)}`);
      if (resp.ok) postulacionAprobada = await resp.json();
    } catch {}
    if (!postulacionAprobada || !postulacionAprobada.ok || !postulacionAprobada.postulacion) {
      alert('No se encontró una postulación aprobada');
      return;
    }
    const post = postulacionAprobada.postulacion;

    const fecha = schedDatetime ? schedDatetime.value : '';
    if (!fecha) return alert('Selecciona fecha y hora');
    const r = await fetch('/api/citas', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ postulacion_id: post.id, fecha_hora: fecha })
    });
    const j = await r.json();
    if (j.ok) {
      alert('La cita fue enviada a su correo.');
      if (schedModal) schedModal.hide();
    } else {
      alert(j.mensaje || 'Error al registrar la cita');
    }
  };
}

// ====================== CONTACTO ======================

if (contactForm) {
  contactForm.onsubmit = async e => {
    e.preventDefault();
    const data = {
      nombre  : document.getElementById('cname')?.value,
      email   : document.getElementById('cemail')?.value,
      telefono: document.getElementById('cphone')?.value,
      mensaje : document.getElementById('cmessage')?.value
    };
    const r = await fetch('/api/contacto', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
    });
    const j = await r.json();
    alert(j.mensaje || 'Mensaje enviado');
    contactForm.reset();
  };
}

