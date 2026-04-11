/**
 * Admin Login
 * Simple email/password login for hosts and super admin.
 * Super password reset: master password configured here.
 */

import { auth }                        from '../../firebase.js';
import { signInWithEmailAndPassword,
         sendPasswordResetEmail }      from 'firebase/auth';

const SUPER_PASSWORD = 'XV2026Diana'; // Master reset password — change before deploy

export function renderLogin(container) {
  container.innerHTML = `
  <div style="
    min-height:100dvh;
    background:linear-gradient(160deg, #0d2137 0%, #1a3a5c 100%);
    display:flex; align-items:center; justify-content:center;
    padding:var(--space-6);
    font-family:'Inter',sans-serif;
  ">
    <div style="
      width:100%; max-width:380px;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(192,192,192,0.15);
      border-radius:20px;
      padding:40px 32px;
      box-shadow:0 16px 48px rgba(0,0,0,0.4);
    ">
      <!-- Logo -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-family:'Playfair Display',serif;font-size:2rem;color:#e0e0e0;margin-bottom:4px;">
          Diana Yaretzi
        </div>
        <div style="font-size:0.7rem;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;">
          Panel de Administración
        </div>
        <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#c0c0c0,transparent);margin:16px auto 0;"></div>
      </div>

      <!-- Form -->
      <form id="login-form">
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:#8a8a8a;margin-bottom:6px;">
            Correo electrónico
          </label>
          <input id="login-email" type="email" autocomplete="email"
            style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.07);border:1px solid rgba(192,192,192,0.2);border-radius:8px;color:#e0e0e0;font-size:0.95rem;"
            placeholder="tu@correo.com" required />
        </div>
        <div style="margin-bottom:8px;">
          <label style="display:block;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:#8a8a8a;margin-bottom:6px;">
            Contraseña
          </label>
          <input id="login-password" type="password" autocomplete="current-password"
            style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.07);border:1px solid rgba(192,192,192,0.2);border-radius:8px;color:#e0e0e0;font-size:0.95rem;"
            placeholder="••••••••" required />
        </div>

        <div id="login-error" style="color:#c0504a;font-size:0.8rem;margin-bottom:8px;display:none;"></div>

        <button type="submit" id="login-btn"
          style="width:100%;padding:12px;margin-top:8px;background:linear-gradient(135deg,#8a8a8a,#f0f0f0,#8a8a8a);color:#0d2137;border-radius:999px;font-weight:700;font-size:0.875rem;letter-spacing:0.05em;cursor:pointer;border:none;transition:opacity 0.2s;">
          Iniciar sesión
        </button>
      </form>

      <!-- Forgot password -->
      <div style="margin-top:24px;border-top:1px solid rgba(192,192,192,0.1);padding-top:20px;">
        <button id="btn-forgot" style="background:none;border:none;color:#8a8a8a;font-size:0.8rem;cursor:pointer;width:100%;text-align:center;">
          ¿Olvidaste tu contraseña? Usar contraseña maestra
        </button>
        <div id="reset-panel" style="display:none;margin-top:16px;gap:8px;flex-direction:column;">
          <input id="reset-email" type="email"
            style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.07);border:1px solid rgba(192,192,192,0.2);border-radius:8px;color:#e0e0e0;font-size:0.875rem;"
            placeholder="Correo a resetear" />
          <input id="reset-superpass" type="password"
            style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.07);border:1px solid rgba(192,192,192,0.2);border-radius:8px;color:#e0e0e0;font-size:0.875rem;"
            placeholder="Contraseña maestra" />
          <button id="btn-do-reset"
            style="padding:10px;background:rgba(192,192,192,0.1);border:1px solid rgba(192,192,192,0.2);border-radius:8px;color:#c0c0c0;font-size:0.875rem;cursor:pointer;">
            Enviar email de reseteo
          </button>
          <div id="reset-msg" style="font-size:0.8rem;color:#8a8a8a;text-align:center;"></div>
        </div>
      </div>

    </div>
  </div>
  `;

  // Login form submit
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');
    const errEl    = document.getElementById('login-error');
    errEl.style.display = 'none';
    btn.disabled = true; btn.textContent = 'Iniciando…';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will re-render via admin/index.js
      window.location.hash = '#/admin/dashboard';
    } catch (err) {
      errEl.textContent = traducirError(err.code);
      errEl.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Iniciar sesión';
    }
  });

  // Forgot password toggle
  document.getElementById('btn-forgot').addEventListener('click', () => {
    const panel = document.getElementById('reset-panel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  });

  // Reset with super password
  document.getElementById('btn-do-reset').addEventListener('click', async () => {
    const email     = document.getElementById('reset-email').value.trim();
    const superpass = document.getElementById('reset-superpass').value;
    const msgEl     = document.getElementById('reset-msg');

    if (superpass !== SUPER_PASSWORD) {
      msgEl.style.color = '#c0504a';
      msgEl.textContent = 'Contraseña maestra incorrecta.';
      return;
    }
    if (!email) { msgEl.textContent = 'Ingresa el correo.'; return; }

    try {
      await sendPasswordResetEmail(auth, email);
      msgEl.style.color = '#4a8c6a';
      msgEl.textContent = '✅ Email de reseteo enviado.';
    } catch {
      msgEl.style.color = '#c0504a';
      msgEl.textContent = 'Error. Verifica el correo.';
    }
  });
}

function traducirError(code) {
  const map = {
    'auth/user-not-found':  'No existe una cuenta con ese correo.',
    'auth/wrong-password':  'Contraseña incorrecta.',
    'auth/invalid-email':   'Correo no válido.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
  };
  return map[code] || 'Error al iniciar sesión. Inténtalo de nuevo.';
}
