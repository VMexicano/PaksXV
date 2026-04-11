/**
 * Admin shell — shared layout wrapper for all backoffice views
 * Provides: sidebar nav, header, logout
 */
import { auth }    from '../../firebase.js';
import { signOut } from 'firebase/auth';

export function adminShell(container, ctx, activePage, contentHTML) {
  const navItems = [
    { key: 'dashboard',  label: 'Dashboard',   icon: '📊', path: '#/admin/dashboard' },
    { key: 'invitados',  label: 'Invitados',   icon: '👥', path: '#/admin/invitados' },
    ctx.isSuperAdmin
      ? { key: 'hosts',  label: 'Hosts',       icon: '🎪', path: '#/admin/hosts' }
      : null,
    { key: 'scanner',    label: 'Escáner',     icon: '📷', path: '#/admin/scanner' },
    { key: 'fotos',      label: 'Fotos',       icon: '🖼️', path: '#/admin/fotos' },
  ].filter(Boolean);

  const navHTML = navItems.map(item => `
    <a href="${item.path}" class="admin-nav__item ${activePage === item.key ? 'active' : ''}"
       data-page="${item.key}">
      <span class="admin-nav__icon">${item.icon}</span>
      <span class="admin-nav__label">${item.label}</span>
    </a>
  `).join('');

  container.innerHTML = `
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="admin-sidebar__brand">
        <div class="admin-sidebar__title">Diana Yaretzi</div>
        <div class="admin-sidebar__sub">XV Años · Admin</div>
      </div>
      <nav class="admin-nav">${navHTML}</nav>
      <div class="admin-sidebar__footer">
        <div class="admin-sidebar__user">
          <span>${ctx.user.email}</span>
          <span class="admin-role-badge">${ctx.isSuperAdmin ? 'Super Admin' : 'Host'}</span>
        </div>
        <button id="btn-logout" class="admin-logout">Cerrar sesión</button>
      </div>
    </aside>

    <!-- Mobile top bar -->
    <div class="admin-topbar">
      <button id="btn-menu" class="admin-topbar__menu" aria-label="Menú">☰</button>
      <span class="admin-topbar__title">Diana Yaretzi · Admin</span>
      <button id="btn-logout-mobile" style="background:none;border:none;color:#8a8a8a;cursor:pointer;font-size:0.8rem;">Salir</button>
    </div>

    <!-- Content -->
    <main class="admin-content" id="admin-content">
      ${contentHTML}
    </main>
  </div>
  `;

  // Logout
  const logout = async () => {
    await signOut(auth);
    window.location.hash = '#/admin';
  };
  document.getElementById('btn-logout')?.addEventListener('click', logout);
  document.getElementById('btn-logout-mobile')?.addEventListener('click', logout);

  // Mobile menu toggle
  document.getElementById('btn-menu')?.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('open');
  });
}
