/**
 * Admin Dashboard — stats + cancellations
 */

import { db }                               from '../../firebase.js';
import { collection, getDocs, query,
         where, orderBy, onSnapshot }       from 'firebase/firestore';
import { adminShell }                       from './shell.js';
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '../utils.js';

export async function renderDashboard(container, ctx) {
  adminShell(container, ctx, 'dashboard', `
    <div class="admin-page-header">
      <div>
        <h1 class="admin-page-title">Dashboard</h1>
        <p class="admin-page-subtitle">Resumen general del evento</p>
      </div>
    </div>
    <div id="stats-grid" class="admin-stats">
      <div class="admin-stat-card"><div class="admin-stat-card__label">Cargando…</div></div>
    </div>
    <div id="cancellations-section"></div>
    <div style="margin-top:32px">
      <h2 style="font-family:'Playfair Display',serif;color:#c0c0c0;font-size:1.1rem;margin-bottom:16px;">
        Confirmaciones recientes
      </h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr>
            <th>Invitado</th><th>Host</th><th>Estado</th><th>Boletos</th><th>Confirmado</th>
          </tr></thead>
          <tbody id="recent-confirmations">
            <tr><td colspan="5" style="text-align:center;color:#5a6a7a;padding:32px;">Cargando…</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `);

  // Load data
  await loadStats(ctx);
  await loadRecentConfirmations();
}

async function loadStats(ctx) {
  const statsEl = document.getElementById('stats-grid');
  try {
    const snap    = await getDocs(collection(db, 'invitados'));
    const all     = snap.docs.map(d => d.data());

    const MAX_CAPACITY = 200;
    const total      = all.length;
    const pendiente  = all.filter(d => d.estado === 'pendiente').length;
    const visitado   = all.filter(d => d.estado === 'visitado').length;
    const confirmado = all.filter(d => d.estado === 'confirmado').length;
    const rechazado  = all.filter(d => d.estado === 'rechazado').length;
    const validado   = all.filter(d => d.qrValidado).length;
    
    // Contabilizar boletos para la bolsa límite de 200
    // "Asignados" = Todos los que no han sido rechazados
    const boletosAsignados = all
      .filter(d => d.estado !== 'rechazado')
      .reduce((s, d) => s + (d.numBoletos || 0), 0);
    const boletosRestantes = MAX_CAPACITY - boletosAsignados;
    
    const boletosConf  = all.filter(d => d.estado === 'confirmado').reduce((s, d) => s + (d.numBoletos || 0), 0);
    const liberados    = all.filter(d => d.estado === 'rechazado').reduce((s, d) => s + (d.numBoletos || 0), 0);

    if (statsEl) statsEl.innerHTML = `
      <div class="admin-stat-card" style="border: 1px solid rgba(74, 204, 138, 0.5); background: rgba(74, 204, 138, 0.05);">
        <div class="admin-stat-card__label" style="color:#4acc8a">🎟️ Boletos Dispo.</div>
        <div class="admin-stat-card__value" style="color:#e0e0e0; font-size: 2rem;">${boletosRestantes} <span style="font-size: 0.9rem; color:#8a8a8a">/ 200</span></div>
        <div class="admin-stat-card__sub" style="color:#8a8a8a">Te sobran en la bolsa de limite</div>
      </div>
      <div class="admin-stat-card"><div class="admin-stat-card__label">Total invitados</div><div class="admin-stat-card__value">${total}</div><div class="admin-stat-card__sub">${boletosAsignados} boletos asignados</div></div>
      <div class="admin-stat-card"><div class="admin-stat-card__label">Pendientes</div><div class="admin-stat-card__value">${pendiente}</div></div>
      <div class="admin-stat-card admin-stat-card--warning"><div class="admin-stat-card__label">Visitados</div><div class="admin-stat-card__value">${visitado}</div><div class="admin-stat-card__sub">Abrieron el link</div></div>
      <div class="admin-stat-card admin-stat-card--success"><div class="admin-stat-card__label">Confirmados</div><div class="admin-stat-card__value">${confirmado}</div><div class="admin-stat-card__sub">Aseguraron ${boletosConf} boletos</div></div>
      <div class="admin-stat-card admin-stat-card--error"><div class="admin-stat-card__label">Rechazados</div><div class="admin-stat-card__value">${rechazado}</div></div>
      <div class="admin-stat-card admin-stat-card--silver"><div class="admin-stat-card__label">Validados entrada</div><div class="admin-stat-card__value">${validado}</div></div>
    `;

    // Cancellations section (rechazados with numBoletos)
    const cancellations = all.filter(d => d.estado === 'rechazado' && d.numBoletos);
    loadCancellationsSection(cancellations, liberados);

  } catch (err) {
    console.error(err);
    if (statsEl) statsEl.innerHTML = '<p style="color:#cc4a4a">Error al cargar estadísticas.</p>';
  }
}

function loadCancellationsSection(cancellations, liberados) {
  const el = document.getElementById('cancellations-section');
  if (!el || !cancellations.length) return;

  const items = cancellations.map(d => `
    <div class="cancellation-item">
      <div>
        <div class="cancellation-name">❌ ${d.nombre}</div>
        <div class="cancellation-meta">${d.fechaConfirmacion ? formatDate(d.fechaConfirmacion) : 'Sin fecha'}</div>
      </div>
      <div class="cancellation-tickets">🎟️ +${d.numBoletos} liberados</div>
    </div>
  `).join('');

  el.innerHTML = `
    <h2 style="font-family:'Playfair Display',serif;color:#cc4a4a;font-size:1.1rem;margin-bottom:8px;">
      Cancelaciones — ${liberados} boleto(s) liberado(s)
    </h2>
    <div class="cancellation-list">${items}</div>
  `;
}

async function loadRecentConfirmations() {
  const tbody = document.getElementById('recent-confirmations');
  try {
    const q    = query(collection(db, 'invitados'), where('estado', '==', 'confirmado'));
    const snap = await getDocs(q);

    const rows = snap.docs.map(d => {
      const data = d.data();
      return `<tr>
        <td>${data.nombre}</td>
        <td style="color:#5a6a7a;font-size:0.8rem">${data.hostId || '—'}</td>
        <td><span class="status-badge status-confirmado">Confirmado</span></td>
        <td>🎟️ ${data.numBoletos}</td>
        <td style="color:#5a6a7a;font-size:0.8rem">${data.fechaConfirmacion ? formatDate(data.fechaConfirmacion) : '—'}</td>
      </tr>`;
    }).join('');

    if (tbody) tbody.innerHTML = rows || `<tr><td colspan="5" style="text-align:center;color:#5a6a7a;padding:32px;">Sin confirmaciones aún</td></tr>`;
  } catch (err) {
    console.error(err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="color:#cc4a4a">Error al cargar</td></tr>`;
  }
}
