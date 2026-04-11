/**
 * Admin Hosts — super admin manages host accounts
 */

import { db }              from '../../firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc,
         doc, serverTimestamp }        from 'firebase/firestore';
import { adminShell }      from './shell.js';

export async function renderHosts(container, ctx) {
  adminShell(container, ctx, 'hosts', `
    <div class="admin-page-header">
      <div>
        <h1 class="admin-page-title">Hosts</h1>
        <p class="admin-page-subtitle">Gestión de hosts · Solo super admin</p>
      </div>
      <button id="btn-add-host" class="admin-btn admin-btn-silver">+ Nuevo host</button>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Nombre</th><th>Email</th><th>Estado</th><th>HostId</th><th>Acciones</th>
        </tr></thead>
        <tbody id="hosts-tbody">
          <tr><td colspan="5" style="text-align:center;color:#5a6a7a;padding:32px;">Cargando hosts…</td></tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top:24px;padding:20px;background:rgba(192,192,192,0.05);border:1px solid rgba(192,192,192,0.1);border-radius:12px;">
      <h3 style="font-size:0.875rem;color:#8a8a8a;margin-bottom:8px;">⚙️ Para asignar custom claims a un host:</h3>
      <code style="font-size:0.8rem;color:#c0c0c0;background:rgba(0,0,0,0.3);padding:8px 12px;border-radius:6px;display:block;">
        firebase auth:set-custom-user-claims &lt;UID&gt; '{"role":"host","hostId":"&lt;hostDocId&gt;"}'
      </code>
    </div>

    <div id="host-modal-bg" class="admin-modal-bg" style="display:none"></div>
  `);

  let allHosts = [];

  async function loadHosts() {
    const tbody = document.getElementById('hosts-tbody');
    try {
      const snap = await getDocs(collection(db, 'hosts'));
      allHosts   = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      tbody.innerHTML = allHosts.map(h => `<tr>
        <td style="font-weight:500">${h.nombre}</td>
        <td style="color:#5a6a7a;font-size:0.85rem">${h.email || '—'}</td>
        <td>
          <span style="color:${h.activo !== false ? '#4acc8a' : '#cc4a4a'};font-size:0.8rem">
            ${h.activo !== false ? '✅ Activo' : '⛔ Inactivo'}
          </span>
        </td>
        <td style="color:#5a6a7a;font-size:0.75rem;font-family:monospace">${h.id}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="admin-btn admin-btn-primary admin-btn-sm btn-edit-host" data-id="${h.id}">✏️ Editar</button>
            <button class="admin-btn ${h.activo !== false ? 'admin-btn-danger' : 'admin-btn-success'} admin-btn-sm btn-toggle-host"
              data-id="${h.id}" data-active="${h.activo !== false}">
              ${h.activo !== false ? '⛔ Desactivar' : '✅ Activar'}
            </button>
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="5" style="text-align:center;color:#5a6a7a;padding:32px;">Sin hosts</td></tr>`;

      // Edit
      tbody.querySelectorAll('.btn-edit-host').forEach(btn => {
        btn.addEventListener('click', () => {
          const host = allHosts.find(h => h.id === btn.dataset.id);
          if (host) openHostModal(host, loadHosts);
        });
      });

      // Toggle active
      tbody.querySelectorAll('.btn-toggle-host').forEach(btn => {
        btn.addEventListener('click', async () => {
          const isActive = btn.dataset.active === 'true';
          await updateDoc(doc(db, 'hosts', btn.dataset.id), { activo: !isActive });
          window.showToast?.(`Host ${isActive ? 'desactivado' : 'activado'}`);
          loadHosts();
        });
      });

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:#cc4a4a">Error al cargar hosts</td></tr>`;
    }
  }

  document.getElementById('btn-add-host')?.addEventListener('click', () => openHostModal(null, loadHosts));
  await loadHosts();
}

function openHostModal(host, onSave) {
  const bg = document.getElementById('host-modal-bg');
  if (!bg) return;

  bg.style.display = 'flex';
  bg.innerHTML = `
    <div class="admin-modal">
      <h3>${host ? 'Editar host' : 'Nuevo host'}</h3>
      <form id="host-form">
        <div class="admin-field">
          <label class="admin-label">Nombre del host *</label>
          <input id="hf-nombre" class="admin-input" value="${host?.nombre || ''}" required placeholder="Mamá, Papá, Padrinos…" />
        </div>
        <div class="admin-field">
          <label class="admin-label">Email (para Firebase Auth) *</label>
          <input id="hf-email" class="admin-input" type="email" value="${host?.email || ''}" required placeholder="host@correo.com" />
        </div>
        <div class="admin-modal-footer">
          <button type="button" id="hf-cancel" class="admin-btn admin-btn-primary">Cancelar</button>
          <button type="submit" class="admin-btn admin-btn-silver">${host ? 'Guardar' : 'Crear host'}</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('hf-cancel').addEventListener('click', () => { bg.style.display = 'none'; });
  bg.addEventListener('click', e => { if (e.target === bg) bg.style.display = 'none'; });

  document.getElementById('host-form').addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = document.getElementById('hf-nombre').value.trim();
    const email  = document.getElementById('hf-email').value.trim();
    if (!nombre || !email) return;

    try {
      if (host) {
        await updateDoc(doc(db, 'hosts', host.id), { nombre, email });
      } else {
        await addDoc(collection(db, 'hosts'), { nombre, email, activo: true, creadoEn: serverTimestamp() });
      }
      bg.style.display = 'none';
      window.showToast?.('✅ Host guardado');
      onSave?.();
    } catch (err) {
      window.showToast?.('Error al guardar host');
    }
  });
}
