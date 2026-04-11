/**
 * RSVP section — render + full confirmation flow
 * States: pendiente/visitado → form → confirmado (disclaimer + re-download)
 *       → rechazado → token inválido
 */

import { db }        from '../../firebase.js';
import { doc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { generateTicketPDF, showQROnScreen } from '../ticket.js';
import { validateLast4, showToast }          from '../utils.js';
import { EVENT }                              from '../invitation.js';

// ── Render ──────────────────────────────────────────────────────
export function renderRSVP(guest, inviteToken) {
  if (!guest) return renderInvalidToken();

  const inner = {
    pendiente: () => renderForm(guest),
    visitado:  () => renderForm(guest),
    confirmado: () => renderConfirmed(guest),
    rechazado:  () => renderRejected(guest),
  }[guest.estado]?.() ?? renderInvalidToken();

  return `
  <section id="rsvp" class="section">
    <div class="container-sm">
      <div class="rsvp__card reveal">
        <div class="text-center" style="margin-bottom:var(--space-6)">
          <h2 class="rsvp__guest-name">${guest.nombre}</h2>
          <div class="rsvp__tickets-badge">
            🎟️ ${guest.numBoletos} ${guest.numBoletos === 1 ? 'boleto' : 'boletos'} asignados
          </div>
        </div>
        <div id="rsvp-body">${inner}</div>
      </div>
    </div>
  </section>
  `;
}

function renderInvalidToken() {
  return `
  <section id="rsvp" class="section">
    <div class="container-sm">
      <div class="rsvp__card reveal">
        <div class="rsvp__invalid">
          <div class="rsvp__invalid-icon">❓</div>
          <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:var(--space-2)">Invitación no válida</h3>
          <p style="color:var(--color-text-soft);font-style:italic;margin-bottom:var(--space-6)">
            Esta invitación no existe o no es válida. Si crees que es un error, contacta al organizador.
          </p>
          <a href="https://wa.me/5215627234166" target="_blank" rel="noopener" class="btn btn-primary">
            💬 Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </section>
  `;
}

function renderForm(guest) {
  return `
    <form id="rsvp-form" novalidate>
      <div class="rsvp__form-section">

        <p style="text-align:center;font-family:var(--font-elegant);font-size:1.1rem;color:var(--color-text-soft);font-style:italic;margin-bottom:var(--space-2)">
          ¿Confirmas tu asistencia?
        </p>

        <div class="rsvp__choice-row">
          <label class="rsvp__choice" id="choice-yes">
            <input type="radio" name="asistencia" value="si" required />
            <span class="rsvp__choice-icon">🎉</span>
            <span class="rsvp__choice-label">¡Sí asistiré!</span>
          </label>
          <label class="rsvp__choice" id="choice-no">
            <input type="radio" name="asistencia" value="no" />
            <span class="rsvp__choice-icon">😔</span>
            <span class="rsvp__choice-label">No podré ir</span>
          </label>
        </div>

        <div>
          <label class="input-label" for="rsvp-phone">Número de teléfono *</label>
          <input id="rsvp-phone" class="input-field" type="tel"
            placeholder="10 dígitos" maxlength="15" required
            inputmode="numeric" autocomplete="tel" />
        </div>

        <div id="rsvp-extra" style="display:none;flex-direction:column;gap:var(--space-4)">
          <div>
            <label class="input-label" for="rsvp-message">Mensaje para Diana Yaretzi (opcional)</label>
            <textarea id="rsvp-message" class="input-field" rows="3"
              placeholder="Escribe un mensaje especial…" maxlength="200" style="resize:vertical"></textarea>
          </div>
          <div>
            <label class="input-label" for="rsvp-song">Sugerencia de canción (opcional)</label>
            <input id="rsvp-song" class="input-field" type="text"
              placeholder="Artista — Canción" maxlength="100" />
          </div>
        </div>

        <button type="submit" id="rsvp-submit" class="btn btn-silver" style="width:100%;margin-top:var(--space-2)">
          Confirmar asistencia
        </button>

      </div>
    </form>

    <div id="rsvp-success" class="rsvp__success">
      <p style="font-family:var(--font-display);font-size:1.5rem;color:var(--color-success)">✅ ¡Asistencia confirmada!</p>
      <p style="font-style:italic;color:var(--color-text-soft);margin-top:var(--space-2)">¡Te esperamos el 04 de Julio!</p>
      <div id="rsvp-qr-canvas" class="rsvp__qr-canvas" style="margin:var(--space-5) auto;display:inline-block"></div>
      <div class="rsvp__download-btns">
        <button id="btn-download-pdf" class="btn btn-silver">⬇ Descargar boleto PDF</button>
        <button id="btn-view-qr"      class="btn btn-outline" style="color:var(--navy);border-color:var(--navy)">Ver en pantalla</button>
      </div>
    </div>
  `;
}

function renderConfirmed(guest) {
  return `
    <div class="rsvp__confirmed">
      <div class="rsvp__confirmed-icon">✅</div>
      <h3 class="rsvp__confirmed-title">¡Asistencia confirmada!</h3>
      <p class="rsvp__confirmed-msg">
        Esta invitación ya fue confirmada por <strong>${guest.nombre}</strong>.<br/>
        ¡Te esperamos el 04 de Julio!
      </p>
      <button id="btn-show-verify" class="btn btn-outline" style="color:var(--navy);border-color:rgba(26,58,92,0.3)">
        🔑 Re-descargar mis boletos
      </button>

      <div class="rsvp__verify" id="rsvp-verify">
        <p style="font-size:0.875rem;color:var(--color-text-soft)">
          Ingresa los últimos 4 dígitos de tu teléfono registrado para verificar tu identidad:
        </p>
        <input id="verify-phone" class="input-field" type="tel"
          placeholder="Últimos 4 dígitos" maxlength="4" inputmode="numeric" />
        <button id="btn-verify" class="btn btn-primary">Verificar y descargar</button>
        <div id="verify-error" style="color:var(--color-error);font-size:0.875rem;display:none">
          ❌ Los dígitos no coinciden. Inténtalo de nuevo.
        </div>
      </div>

      <div id="rsvp-qr-canvas" class="rsvp__qr-canvas" style="margin:var(--space-5) auto;display:none"></div>
      <div class="rsvp__download-btns" id="redownload-btns" style="display:none">
        <button id="btn-download-pdf" class="btn btn-silver">⬇ Descargar boleto PDF</button>
        <button id="btn-view-qr"      class="btn btn-outline" style="color:var(--navy);border-color:var(--navy)">Ver en pantalla</button>
      </div>
    </div>
  `;
}

function renderRejected(guest) {
  return `
    <div class="rsvp__rejected text-center">
      <div style="font-size:3rem;margin-bottom:var(--space-4)">😔</div>
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:var(--space-2)">
        Has indicado que no asistirás
      </h3>
      <p style="font-style:italic;color:var(--color-text-soft);margin-bottom:var(--space-6)">
        Si cambiaste de opinión, contacta al organizador por WhatsApp.
      </p>
      <a href="https://wa.me/5215627234166" target="_blank" rel="noopener" class="btn btn-primary">
        💬 Contactar por WhatsApp
      </a>
    </div>
  `;
}

// ── Init (event listeners) ───────────────────────────────────────
export async function initRSVP(guest, inviteToken) {
  if (!guest) return;

  const state = guest.estado;

  // ---- Pending/Visited → show form ----
  if (state === 'pendiente' || state === 'visitado') {
    initForm(guest, inviteToken);
  }

  // ---- Confirmed → re-download flow ----
  if (state === 'confirmado') {
    initRedownload(guest);
  }
}

function initForm(guest, inviteToken) {
  const form      = document.getElementById('rsvp-form');
  const choiceYes = document.getElementById('choice-yes');
  const choiceNo  = document.getElementById('choice-no');
  const extra     = document.getElementById('rsvp-extra');
  if (!form) return;

  // Toggle extra fields on radio change
  form.querySelectorAll('input[name="asistencia"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      choiceYes.classList.toggle('selected-yes', e.target.value === 'si');
      choiceNo.classList.toggle('selected-no',   e.target.value === 'no');
      extra.style.display = e.target.value === 'si' ? 'flex' : 'none';
    });
  });

  // Label click → select radio
  [choiceYes, choiceNo].forEach(label => {
    label.addEventListener('click', () => {
      label.querySelector('input[type="radio"]').checked = true;
      label.querySelector('input[type="radio"]').dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const asistencia = form.querySelector('input[name="asistencia"]:checked')?.value;
    const phone      = document.getElementById('rsvp-phone')?.value?.trim();
    const message    = document.getElementById('rsvp-message')?.value?.trim();
    const song       = document.getElementById('rsvp-song')?.value?.trim();

    if (!asistencia) { window.showToast?.('Por favor indica si asistirás'); return; }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      window.showToast?.('Ingresa un número de teléfono válido'); return;
    }

    await submitRSVP({ guest, inviteToken, asistencia, phone, message, song });
  });
}

async function submitRSVP({ guest, inviteToken, asistencia, phone, message, song }) {
  const btn = document.getElementById('rsvp-submit');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Confirmando…'; }

  try {
    const { v4: uuidv4 } = await import('uuid');
    const qrToken = uuidv4();

    const estado = asistencia === 'si' ? 'confirmado' : 'rechazado';

    // Firestore transaction
    const ref = doc(db, 'invitados', guest.id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Invitado no encontrado');
      const current = snap.data().estado;
      if (current === 'confirmado') throw new Error('Ya confirmado');

      tx.update(ref, {
        estado,
        telefono:          phone.replace(/\D/g, ''),
        qrToken:           estado === 'confirmado' ? qrToken : null,
        mensaje:           message || '',
        songRequest:       song || '',
        fechaConfirmacion: serverTimestamp(),
      });
    });

    if (estado === 'rechazado') {
      window.showToast?.('Respuesta registrada. ¡Gracias!');
      document.getElementById('rsvp-body').innerHTML = `
        <div class="rsvp__rejected text-center" style="padding-block:var(--space-4)">
          <div style="font-size:3rem;margin-bottom:var(--space-4)">😔</div>
          <p style="font-style:italic;color:var(--color-text-soft)">¡Gracias por avisarnos! Si cambias de opinión,<br/>contáctanos por WhatsApp.</p>
          <a href="https://wa.me/5215627234166" target="_blank" class="btn btn-primary" style="margin-top:var(--space-6)">💬 WhatsApp</a>
        </div>`;
      return;
    }

    // Show success + QR
    const successEl = document.getElementById('rsvp-success');
    if (successEl) successEl.classList.add('visible');
    if (btn) btn.closest('form').style.display = 'none';

    const guestData = { ...guest, qrToken, telefono: phone, numBoletos: guest.numBoletos };
    await showQROnScreen(qrToken, document.getElementById('rsvp-qr-canvas'));

    document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
      generateTicketPDF(guestData);
    });
    document.getElementById('btn-view-qr')?.addEventListener('click', () => {
      window.showToast?.('El QR está visible en pantalla');
    });

    window.showToast?.('🎉 ¡Confirmación registrada!');

  } catch (err) {
    console.error(err);
    window.showToast?.(err.message === 'Ya confirmado'
      ? 'Esta invitación ya fue confirmada anteriormente.'
      : 'Error al confirmar. Intenta de nuevo.');
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar asistencia'; }
  }
}

function initRedownload(guest) {
  document.getElementById('btn-show-verify')?.addEventListener('click', () => {
    document.getElementById('rsvp-verify')?.classList.add('visible');
  });

  document.getElementById('btn-verify')?.addEventListener('click', async () => {
    const input = document.getElementById('verify-phone')?.value?.trim();
    const error = document.getElementById('verify-error');

    if (!validateLast4(input, guest.telefono)) {
      if (error) error.style.display = 'block';
      return;
    }
    if (error) error.style.display = 'none';

    // Show QR + download buttons
    const qrCanvas   = document.getElementById('rsvp-qr-canvas');
    const dlBtns      = document.getElementById('redownload-btns');
    if (qrCanvas) qrCanvas.style.display = 'inline-block';
    if (dlBtns)   dlBtns.style.display   = 'flex';

    await showQROnScreen(guest.qrToken, qrCanvas);

    document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
      generateTicketPDF(guest);
    });

    window.showToast?.('✅ Identidad verificada');
  });
}
