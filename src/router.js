/**
 * Hash-based Router
 * Routes:
 *   #/               → invitation (all sections, no RSVP)
 *   #/i/{token}      → invitation + personalized RSVP (load guest by inviteToken)
 *   #/subir-fotos    → jump to photo upload section
 *   #/admin          → backoffice login
 *   #/admin/*        → backoffice protected pages
 */

import { renderInvitation }    from './js/invitation.js';
import { renderAdmin }         from './js/admin/index.js';
import { initMusic }           from './js/music.js';
import { initAnimations }      from './js/animations.js';
import { renderDS }          from './js/ds.js';

const app = document.getElementById('app');

export async function route() {
  const hash  = window.location.hash || '#/';
  const clean = hash.replace(/^#/, ''); // '/i/abc123' or '/admin/dashboard'

  // ── Design System ──────────────────────────────────────────
  if (clean === '/ds') {
    hideMusicUI();
    await renderDS();
    return;
  }

  // ── Admin routes ──────────────────────────────────────────
  if (clean.startsWith('/admin')) {
    hideMusicUI();
    app.innerHTML = '';
    await renderAdmin(clean, app);
    return;
  }

  // ── Photo upload shortcut (QR from party) ─────────────────
  if (clean === '/subir-fotos') {
    await renderInvitation({ scrollTo: 'subir-fotos' }, app);
    initAnimations();
    return;
  }

  // ── Personalized invitation (with token) ──────────────────
  const tokenMatch = clean.match(/^\/i\/([A-Za-z0-9_-]+)$/);
  if (tokenMatch) {
    const inviteToken = tokenMatch[1];
    await renderInvitation({ inviteToken }, app);
    initAnimations();
    return;
  }

  // ── Generic invitation (no token, no RSVP) ────────────────
  await renderInvitation({}, app);
  initAnimations();
}

function hideMusicUI() {
  const overlay = document.getElementById('music-overlay');
  const fab     = document.getElementById('music-fab');
  if (overlay) { overlay.style.display = 'none'; }
  if (fab)     { fab.hidden = true; }
}

// Listen for hash changes (browser back/forward)
window.addEventListener('hashchange', route);
