const $ = (s, sc = document) => sc.querySelector(s);
const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];

let tablaActual = 'usuarios';

// Utilidad fetch con errores claros
async function jFetch(url, opt = {}) {
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return await r.json();
}

function logout() {
  localStorage.removeItem('admin');
  location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
  const btnMasc = $('#btnNuevaMascota');
  const btnImprimir = $('#btnImprimirPostulacion');
  const formNuevaMascota = $('#formNuevaMascota');
  const formBuscarCedula = $('#formBuscarCedula');

  // Tabs navegación
  $$('#admTabs .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#admTabs .nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabla = btn.dataset.table;
      tablaActual = tabla;
      loadTable(tabla);

      // Mostrar/ocultar botones
      if (btnMasc) btnMasc.style.display = tabla === 'mascotas' ? 'inline-block' : 'none';
      if (btnImprimir) btnImprimir.style.display = tabla === 'postulaciones' ? 'inline-block' : 'none';

      // Ocultar formulario de mascota al cambiar
      if (formNuevaMascota) formNuevaMascota.style.display = 'none';
    });
  });

  // Mostrar formulario de mascota
  btnMasc?.addEventListener('click', () => {
    if (formNuevaMascota) formNuevaMascota.style.display = formNuevaMascota.style.display === 'none' ? 'block' : 'none';
  });

  // Inicial carga de tabla
  loadTable(tablaActual);

  // Registrar nueva mascota
  formNuevaMascota?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    if (!fd.get('imagen')?.name) fd.delete('imagen');
    try {
      const res = await fetch('/api/admin/mascotas', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.msg) mostrarAlertaGuardado(data.msg);
      this.reset();
      this.style.display = 'none';
      loadTable('mascotas');
    } catch (err) {
      alert('Error registrando mascota: ' + err.message);
    }
  });

  // ----------- IMPRIMIR POSTULACIÓN POR CÉDULA (con modal) ----------
  btnImprimir?.addEventListener('click', () => {
    let modal = bootstrap.Modal.getOrCreateInstance($('#imprimirModal'));
    $('#inputCedulaBuscar').value = '';
    modal.show();
  });

  formBuscarCedula?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const cedula = $('#inputCedulaBuscar').value.trim();
    if (!cedula) return;

    try {
      const postulaciones = await jFetch('/api/admin/postulaciones');
      const post = postulaciones.find(p => (p.cedula_identidad || '').toString() === cedula);

      if (!post) {
        alert('No se encontró una postulación con esa cédula.');
        return;
      }

      // Busca usuario y mascota relacionados
      const mascota = await jFetch(`/api/admin/mascotas/${post.mascota_id}`);
      const usuario = await jFetch(`/api/admin/usuarios/${post.usuario_id}`);

      let modal = bootstrap.Modal.getOrCreateInstance($('#imprimirModal'));
      modal.hide();

      await imprimirPostulacionPDF(post, mascota, usuario);
    } catch (e) {
      alert('Error generando el PDF: ' + e.message);
    }
  });
});

// =================== Renderizado de tabla ===================
async function loadTable(tbl) {
  tablaActual = tbl;
  try {
    const rows = await jFetch(`/api/admin/${tbl}`);
    const container = $('#tableContainer');
    if (container) container.innerHTML = renderTable(rows, tbl);
  } catch (e) {
    const container = $('#tableContainer');
    if (container) {
      container.innerHTML = `<div class="alert alert-danger">Error cargando la tabla: ${e.message}</div>`;
    }
  }
}

function renderTable(rows, tbl) {
  if (!rows.length) return '<p class="text-muted">Sin datos</p>';
  const th = Object.keys(rows[0]);
  let html = `<div class="table-responsive"><table class="table table-striped align-middle">
    <thead class="table-dark"><tr>${th.map(h => `<th>${h}</th>`).join('')}<th>Acciones</th></tr></thead><tbody>`;

  rows.forEach(r => {
    html += '<tr>' + th.map(h => {
      if (['imagen', 'foto'].includes(h) && r[h]) {
        const folder = h === 'imagen' ? 'mascotas' : 'usuarios';
        const nombreArchivo = r[h].split(/[\\/]/).pop();
        return `<td><img src="/imgs/${folder}/${nombreArchivo}" height="50"></td>`;
      }
      return `<td>${r[h]}</td>`;
    }).join('');
    html += `<td>
      <button class="btn btn-sm btn-outline-primary me-1" onclick="editRow('${tbl}', ${r.id})" title="Editar">✏️</button>
      <button class="btn btn-sm btn-outline-danger" onclick="delRow('${tbl}', ${r.id})" title="Eliminar">🗑️</button>
    </td></tr>`;
  });

  html += '</tbody></table></div>';
  return html;
}

// ===================== CRUD ======================

window.delRow = async function delRow(tbl, id) {
  if (!confirm('¿Eliminar registro?')) return;
  try {
    await jFetch(`/api/admin/${tbl}/${id}`, { method: 'DELETE' });
    loadTable(tbl);
  } catch (e) {
    alert(`Error al eliminar: ${e.message}`);
  }
};

window.editRow = async function editRow(tbl, id) {
  try {
    const r = await jFetch(`/api/admin/${tbl}/${id}`);
    if (!r || typeof r !== 'object') {
      alert("No se pudo cargar el registro. Puede haber sido eliminado.");
      return;
    }

    const keys = Object.keys(r);
    const editBody = $('#editBody');
    if (!editBody) {
      alert('No se encuentra el modal de edición en el HTML');
      return;
    }
    editBody.innerHTML = keys.map(k => {
      if (['imagen', 'foto'].includes(k)) {
        return `
        <div class="col-md-6 mb-3">
          <label class="form-label">${k}</label>
          <input class="form-control" name="${k}" type="file">
        </div>`;
      }
      return `
      <div class="col-md-6 mb-3">
        <label class="form-label">${k}</label>
        <input class="form-control" name="${k}" value="${r[k] || ''}" ${k === 'id' ? 'readonly' : ''}>
      </div>`;
    }).join('');

    let modal = bootstrap.Modal.getOrCreateInstance($('#editModal'));
    modal.show();

    $('#editForm').onsubmit = async e => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      fd.delete('id');
      $$('input[type="file"]', form).forEach(input => {
        if (!input.files.length) fd.delete(input.name);
      });
      try {
        const res = await fetch(`/api/admin/${tbl}/${r.id}`, { method: 'PUT', body: fd });
        const data = await res.json();
        modal.hide();
        loadTable(tbl);
        if (data.msg) mostrarAlertaGuardado(data.msg);
      } catch (err) {
        alert(`Error al guardar: ${err.message}`);
      }
    };

    $('#btnDelete').onclick = async () => {
      if (confirm('¿Eliminar este registro?')) {
        await jFetch(`/api/admin/${tbl}/${r.id}`, { method: 'DELETE' });
        modal.hide();
        loadTable(tbl);
      }
    };

  } catch (e) {
    alert(`Error cargando datos: ${e.message}`);
  }
};

function mostrarAlertaGuardado(msg) {
  const alerta = document.createElement('div');
  alerta.className = 'alert alert-success position-fixed bottom-0 end-0 m-3 shadow';
  alerta.textContent = msg;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 3000);
}

// =================== Imprimir PDF de Postulación ===================
async function imprimirPostulacionPDF(post, mascota, usuario) {
  async function imgToDataURL(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) { return null; }
  }
  const fotoUserUrl = post.foto ? `/imgs/usuarios/${post.foto.split(/[\\/]/).pop()}` : '';
  const fotoMascotaUrl = mascota.imagen ? `/imgs/mascotas/${mascota.imagen.split(/[\\/]/).pop()}` : '';

  const fotoUserBase64 = fotoUserUrl ? await imgToDataURL(fotoUserUrl) : null;
  const fotoMascotaBase64 = fotoMascotaUrl ? await imgToDataURL(fotoMascotaUrl) : null;

  const telefono = post.telefono || usuario.telefono || '';

  // --- DISEÑO PDF CON MÁS INTERLINEADO ---
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'A4');

  // Encabezado
  doc.setFillColor(33, 37, 41);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('FICHA LEGAL DE POSTULACIÓN DE ADOPCIÓN', 105, 13, { align: 'center' });

  // Interlineado personalizado
  const lineSpacing = 10.5;

  let y = 28;
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);

  // Datos Postulante
  doc.setDrawColor(22, 117, 190);
  doc.setLineWidth(0.5);
  doc.roundedRect(13, y, 185, 56, 4, 4);

  if (fotoUserBase64) doc.addImage(fotoUserBase64, 'JPEG', 175, y + 3, 22, 22);

  doc.setFont(undefined, 'bold');
  doc.text('Datos del Postulante:', 18, y + 12);

  doc.setFont(undefined, 'normal');
  let yp = y + 22;
  let xInfo = 18;
  doc.text(`Nombre: ${usuario.nombres_apellidos || ''}`, xInfo, yp);   yp += lineSpacing;
  doc.text(`Correo: ${post.email || usuario.email || ''}`, xInfo, yp); yp += lineSpacing;
  doc.text(`Cédula: ${post.cedula_identidad || ''}`, xInfo, yp);       yp += lineSpacing;
  doc.text(`Teléfono: ${telefono}`, xInfo, yp);                       yp += lineSpacing;
  doc.text(`Educación: ${post.educacion || ''}`, xInfo, yp);          yp += lineSpacing;
  doc.text(`Dirección: ${post.direccion || ''}`, xInfo, yp);          yp += lineSpacing;
  doc.text(`Fecha Formulario: ${post.fecha_form || ''}`, xInfo, yp);

  // Datos Mascota, más espacio entre bloques
  y += 68;
  doc.setDrawColor(77, 184, 72);
  doc.roundedRect(13, y, 185, 56, 4, 4);

  if (fotoMascotaBase64) doc.addImage(fotoMascotaBase64, 'JPEG', 175, y + 3, 22, 22);

  doc.setFont(undefined, 'bold');
  doc.text('Datos de la Mascota:', 18, y + 12);
  doc.setFont(undefined, 'normal');
  yp = y + 22;
  doc.text(`Nombre: ${mascota.nombre || ''}`, xInfo, yp);        yp += lineSpacing;
  doc.text(`Especie: ${mascota.especie || ''}`, xInfo, yp);      yp += lineSpacing;
  doc.text(`Edad: ${mascota.edad || ''}`, xInfo, yp);            yp += lineSpacing;
  doc.text(`Sexo: ${mascota.sexo || ''}`, xInfo, yp);            yp += lineSpacing;
  doc.text(`Salud: ${mascota.salud || ''}`, xInfo, yp);          yp += lineSpacing;
  doc.text(`Vacunado: ${mascota.vacunado ? 'Sí' : 'No'}`, xInfo, yp);  yp += lineSpacing;
  doc.text(`Esterilizado: ${mascota.esterilizado ? 'Sí' : 'No'}`, xInfo, yp); yp += lineSpacing;
  doc.text(`Historia: ${mascota.historia || ''}`, xInfo, yp);

  // Más espacio antes del estado de la postulación
  y += 70;
  doc.setDrawColor(170, 170, 170);
  doc.roundedRect(13, y, 185, 16, 2.5, 2.5); // Mayor alto aún
  doc.setFont(undefined, 'bold');
  doc.text(`Estado de la postulación:`, 18, y + 11);
  doc.setFont(undefined, 'normal');
  doc.text(`${post.estado || ''}`, 80, y + 11);

  // Pie y firmas
  y += 38;
  doc.setDrawColor(80, 80, 80);
  doc.line(32, y + 30, 90, y + 30);
  doc.line(120, y + 30, 178, y + 30);

  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('Firma del Adoptante', 61, y + 37, { align: 'center' });
  doc.text('Firma de la Organización', 149, y + 37, { align: 'center' });

  doc.setFontSize(8.7);
  doc.setTextColor(120, 120, 120);
  doc.text('Este documento tiene validez legal y debe ser presentado en el refugio o entidad correspondiente.', 105, y + 50, { align: 'center' });

  doc.save(`postulacion_${post.id}.pdf`);
}


