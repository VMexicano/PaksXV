/**
 * Admin Guests — CRUD + copy link + send tickets
 */

import { db }              from '../../firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc,
         doc, query, orderBy, where, serverTimestamp }
                           from 'firebase/firestore';
import { adminShell }      from './shell.js';
import { generateToken, copyToClipboard, STATUS_LABELS } from '../utils.js';
import { generateTicketPDF } from '../ticket.js';

const HOST_ORIGIN = window.location.origin;

export async function renderGuests(container, ctx) {
  adminShell(container, ctx, 'invitados', `
    <div class="admin-page-header">
      <div>
        <h1 class="admin-page-title">Invitados</h1>
        <p class="admin-page-subtitle">Todos los invitados · filtrar por host o estado</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button id="btn-export-csv" class="admin-btn admin-btn-primary">⬇ Exportar CSV</button>
        <button id="btn-add-guest"  class="admin-btn admin-btn-silver">+ Nuevo invitado</button>
      </div>
    </div>

    <div class="admin-toolbar">
      <input id="search-guests" class="admin-search" type="search" placeholder="Buscar por nombre…" />
      <select id="filter-status" class="admin-filter-select">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="visitado">Visitado</option>
        <option value="confirmado">Confirmado</option>
        <option value="rechazado">Rechazado</option>
      </select>
      <select id="filter-host" class="admin-filter-select">
        <option value="">Todos los hosts</option>
      </select>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Nombre</th><th>Host</th><th>Estado</th><th>Boletos</th><th>Teléfono</th><th>Acciones</th>
        </tr></thead>
        <tbody id="guests-tbody">
          <tr><td colspan="6" style="text-align:center;color:#5a6a7a;padding:32px;">Cargando invitados…</td></tr>
        </tbody>
      </table>
    </div>

    <div id="guest-modal-bg" class="admin-modal-bg" style="display:none"></div>
  `);

  let allGuests = [];
  let hosts     = {};

  // Load hosts for filter
  try {
    const hSnap = await getDocs(collection(db, 'hosts'));
    const hostSelect = document.getElementById('filter-host');
    hSnap.docs.forEach(d => {
      hosts[d.id] = d.data().nombre;
      if (hostSelect) {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.data().nombre;
        hostSelect.appendChild(opt);
      }
    });
  } catch {}

  // Load guests
  async function loadGuests() {
    const tbody = document.getElementById('guests-tbody');
    try {
      const snap = await getDocs(query(collection(db, 'invitados'), orderBy('nombre')));
      allGuests  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderTable(applyFilters());
    } catch (err) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color:#cc4a4a">Error al cargar</td></tr>`;
    }
  }

  function applyFilters() {
    const search = document.getElementById('search-guests')?.value.toLowerCase() || '';
    const status = document.getElementById('filter-status')?.value || '';
    const hostF  = document.getElementById('filter-host')?.value || '';
    return allGuests.filter(g =>
      (!search || g.nombre.toLowerCase().includes(search)) &&
      (!status || g.estado === status) &&
      (!hostF  || g.hostId === hostF)
    );
  }

  function renderTable(guests) {
    const tbody = document.getElementById('guests-tbody');
    if (!tbody) return;
    if (!guests.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#5a6a7a;padding:32px;">Sin resultados</td></tr>`;
      return;
    }

    tbody.innerHTML = guests.map(g => {
      const hostName = hosts[g.hostId] || g.hostId || '—';
      const link     = `${HOST_ORIGIN}/#/i/${g.inviteToken}`;
      return `<tr>
        <td style="font-weight:500">${g.nombre}</td>
        <td style="color:#5a6a7a;font-size:0.8rem">${hostName}</td>
        <td><span class="status-badge status-${g.estado}">${STATUS_LABELS[g.estado] || g.estado}</span></td>
        <td>🎟️ ${g.numBoletos}</td>
        <td style="color:#5a6a7a;font-size:0.8rem">${g.telefono ? '••' + g.telefono.slice(-4) : '—'}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="admin-btn admin-btn-primary admin-btn-sm btn-copy-link" data-link="${link}" title="Copiar link">🔗 Link</button>
            ${g.estado === 'confirmado' ? `<button class="admin-btn admin-btn-primary admin-btn-sm btn-send-ticket" data-id="${g.id}" title="Enviar boleto">🎟️</button>` : ''}
            <button class="admin-btn admin-btn-primary admin-btn-sm btn-edit-guest" data-id="${g.id}">✏️</button>
            ${g.estado === 'pendiente' || g.estado === 'visitado' ? `<button class="admin-btn admin-btn-danger admin-btn-sm btn-delete-guest" data-id="${g.id}">🗑️</button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('');

    // Copy link
    tbody.querySelectorAll('.btn-copy-link').forEach(btn => {
      btn.addEventListener('click', async () => {
        await copyToClipboard(btn.dataset.link);
        window.showToast?.('🔗 Link copiado al portapapeles');
      });
    });

    // Send ticket (host sends to guest)
    tbody.querySelectorAll('.btn-send-ticket').forEach(btn => {
      btn.addEventListener('click', async () => {
        const guest = allGuests.find(g => g.id === btn.dataset.id);
        if (guest) {
          await generateTicketPDF(guest);
          window.showToast?.('🎟️ Boleto generado — compártelo manualmente');
        }
      });
    });

    // Edit
    tbody.querySelectorAll('.btn-edit-guest').forEach(btn => {
      btn.addEventListener('click', () => {
        const guest = allGuests.find(g => g.id === btn.dataset.id);
        if (guest) openModal('edit', guest, loadGuests);
      });
    });

    // Delete (pendiente/visitado only)
    tbody.querySelectorAll('.btn-delete-guest').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este invitado?')) return;
        await deleteDoc(doc(db, 'invitados', btn.dataset.id));
        window.showToast?.('Invitado eliminado');
        loadGuests();
      });
    });
  }

  // Filters
  ['search-guests','filter-status','filter-host'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => renderTable(applyFilters()));
  });

  // Add guest
  document.getElementById('btn-add-guest')?.addEventListener('click', () => {
    openModal('add', null, loadGuests);
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => exportCSV(allGuests, hosts));

  await loadGuests();
}

// ── Modal ────────────────────────────────────────────────────────
function openModal(mode, guest, onSave) {
  const bg = document.getElementById('guest-modal-bg');
  if (!bg) return;

  const title = mode === 'add' ? 'Nuevo invitado' : 'Editar invitado';

  bg.style.display = 'flex';
  bg.innerHTML = `
    <div class="admin-modal">
      <h3>${title}</h3>
      <form id="guest-form">
        <div class="admin-field">
          <label class="admin-label">Nombre completo *</label>
          <input id="gf-nombre" class="admin-input" type="text" value="${guest?.nombre || ''}" required placeholder="Juan Pérez García" />
        </div>
        <div class="admin-field">
          <label class="admin-label">Número de boletos *</label>
          <input id="gf-boletos" class="admin-input" type="number" min="1" max="20" value="${guest?.numBoletos || 2}" required />
        </div>
        ${mode === 'add' ? `
        <div class="admin-field">
          <label class="admin-label">Host ID (opcional)</label>
          <input id="gf-host" class="admin-input" type="text" placeholder="hostId" value="" />
        </div>` : ''}
        ${mode === 'add' ? `
        <div id="gf-link-preview" style="margin-top:8px;display:none">
          <label class="admin-label">Link personalizado</label>
          <div class="invite-link-box">
            <input id="gf-link-val" type="text" readonly />
            <button type="button" id="gf-copy-link">Copiar</button>
          </div>
        </div>` : ''}
        <div class="admin-modal-footer">
          <button type="button" id="gf-cancel" class="admin-btn admin-btn-primary">Cancelar</button>
          <button type="submit" class="admin-btn admin-btn-silver">
            ${mode === 'add' ? 'Crear invitado' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('gf-cancel')?.addEventListener('click', () => { bg.style.display = 'none'; });
  bg.addEventListener('click', (e) => { if (e.target === bg) bg.style.display = 'none'; });

  document.getElementById('guest-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre  = document.getElementById('gf-nombre').value.trim();
    const boletos = parseInt(document.getElementById('gf-boletos').value, 10);
    const hostId  = document.getElementById('gf-host')?.value.trim() || '';

    if (!nombre || isNaN(boletos)) return;

    try {
      if (mode === 'add') {
        const token = generateToken(8);
        const ref   = await addDoc(collection(db, 'invitados'), {
          nombre, numBoletos: boletos, hostId: hostId || null,
          inviteToken: token, estado: 'pendiente',
          qrToken: null, qrValidado: false,
          telefono: null, mensaje: '', songRequest: '',
          creadoEn: serverTimestamp(),
        });

        // Show link
        const link    = `${window.location.origin}/#/i/${token}`;
        const preview = document.getElementById('gf-link-preview');
        const val     = document.getElementById('gf-link-val');
        if (preview) preview.style.display = 'block';
        if (val) val.value = link;

        document.getElementById('gf-copy-link')?.addEventListener('click', async () => {
          await copyToClipboard(link);
          window.showToast?.('🔗 Link copiado');
        });

        window.showToast?.('✅ Invitado creado');
      } else {
        await updateDoc(doc(db, 'invitados', guest.id), { nombre, numBoletos: boletos });
        bg.style.display = 'none';
        window.showToast?.('✅ Invitado actualizado');
      }
      onSave?.();
    } catch (err) {
      console.error(err);
      window.showToast?.('Error al guardar');
    }
  });
}

// ── CSV Export ───────────────────────────────────────────────────
function exportCSV(guests, hosts) {
  const header = ['Nombre','Host','Estado','Boletos','Teléfono','Token','Confirmado','Validado'];
  const rows   = guests.map(g => [
    g.nombre,
    hosts[g.hostId] || g.hostId || '',
    g.estado,
    g.numBoletos,
    g.telefono || '',
    g.inviteToken || '',
    g.fechaConfirmacion ? 'Sí' : 'No',
    g.qrValidado ? 'Sí' : 'No',
  ]);

  const csv  = [header, ...rows].map(r => r.map(val => `"${String(val).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url;
  a.download = 'invitados-xv-diana-yaretzi.csv';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  window.showToast?.('⬇ CSV descargado');
}
