/**
 * Admin backoffice — router entry point
 * Handles #/admin, #/admin/dashboard, #/admin/invitados,
 *         #/admin/hosts, #/admin/scanner, #/admin/fotos
 */

import { auth }              from '../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { renderLogin }       from './login.js';
import { renderDashboard }   from './dashboard.js';
import { renderGuests }      from './guests.js';
import { renderHosts }       from './hosts.js';
import { renderScanner }     from './scanner.js';
import { renderPhotos }      from './photos.js';

export function renderAdmin(path, container) {
  // Inject admin shell immediately (prevents flash)
  container.innerHTML = `<div id="admin-app" style="min-height:100dvh;background:#0d2137"></div>`;
  const adminApp = container.querySelector('#admin-app');

  // Wait for auth state
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();

    // ── Not logged in → show login ──────────────────────────────
    if (!user) {
      renderLogin(adminApp);
      return;
    }

    // ── Logged in → check claims and route ──────────────────────
    user.getIdTokenResult().then(({ claims }) => {
      const role   = claims.role || 'host';
      const hostId = claims.hostId || null;
      const ctx    = { user, role, hostId, isSuperAdmin: role === 'superadmin' };

      const sub = path.replace('/admin', '').replace(/^\//, '') || 'dashboard';

      const views = {
        'dashboard':   () => renderDashboard(adminApp, ctx),
        'invitados':   () => renderGuests(adminApp, ctx),
        'hosts':       () => ctx.isSuperAdmin ? renderHosts(adminApp, ctx) : renderGuests(adminApp, ctx),
        'scanner':     () => renderScanner(adminApp, ctx),
        'fotos':       () => renderPhotos(adminApp, ctx),
        '':            () => renderDashboard(adminApp, ctx),
      };

      (views[sub] || views['dashboard'])();
    });
  });
}
