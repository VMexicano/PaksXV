/**
 * Utility functions shared across the app
 */

// ── Toast notification ────────────────────────────────────────────
let toastTimer = null;
export function showToast(message, duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ── Normalize text for fuzzy comparison ──────────────────────────
export function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// ── Generate short token (8 chars alphanumeric) ──────────────────
export function generateToken(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let t = '';
  for (let i = 0; i < len; i++) {
    t += chars[Math.floor(Math.random() * chars.length)];
  }
  return t;
}

// ── Copy to clipboard ────────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

// ── Format date ──────────────────────────────────────────────────
export function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── Format time ──────────────────────────────────────────────────
export function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// ── Mask phone (show last 4 digits) ─────────────────────────────
export function maskPhone(phone) {
  if (!phone) return '';
  return '••••••' + phone.slice(-4);
}

// ── Validate last 4 digits ──────────────────────────────────────
export function validateLast4(inputVal, storedPhone) {
  return storedPhone && inputVal.trim() === storedPhone.slice(-4);
}

// ── Debounce ─────────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Status label & color ─────────────────────────────────────────
export const STATUS_LABELS = {
  pendiente:  'Pendiente',
  visitado:   'Visitado',
  confirmado: 'Confirmado',
  rechazado:  'Rechazado',
};
export const STATUS_COLORS = {
  pendiente:  '#8a8a8a',
  visitado:   '#8c7a4a',
  confirmado: '#4a8c6a',
  rechazado:  '#8c4a4a',
};
