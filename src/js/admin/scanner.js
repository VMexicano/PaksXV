/**
 * Admin Scanner — QR entrance validation with offline cache
 */

import { db }              from '../../firebase.js';
import { collection, getDocs, doc, updateDoc,
         serverTimestamp } from 'firebase/firestore';
import { adminShell }      from './shell.js';
import { formatTime }      from '../utils.js';

export async function renderScanner(container, ctx) {
  adminShell(container, ctx, 'scanner', `
    <div class="admin-page-header">
      <div>
        <h1 class="admin-page-title">Escáner QR</h1>
        <p class="admin-page-subtitle">Validar boletos en la entrada</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span id="online-indicator" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase">
          🟢 Online
        </span>
        <button id="btn-cache-qr" class="admin-btn admin-btn-primary">🔄 Cache offline</button>
      </div>
    </div>

    <div class="scanner-wrap">
      <div id="scanner-reader"></div>
      <div id="scanner-result"></div>
      <div style="margin-top:20px;text-align:center">
        <button id="btn-stop-scanner" class="admin-btn admin-btn-danger" style="display:none">⛔ Detener escáner</button>
        <button id="btn-start-scanner" class="admin-btn admin-btn-silver">▶ Iniciar escáner</button>
      </div>
    </div>
  `);

  let qrCache    = {}; // { qrToken: { nombre, numBoletos, validado } }
  let scannerInst = null;

  // Online/offline indicator
  function updateOnline() {
    const el = document.getElementById('online-indicator');
    if (el) el.textContent = navigator.onLine ? '🟢 Online' : '🟡 Offline';
  }
  window.addEventListener('online',  updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();

  // Cache all QR tokens locally
  async function cacheQRTokens() {
    try {
      const snap = await getDocs(collection(db, 'invitados'));
      qrCache = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.qrToken && data.estado === 'confirmado') {
          qrCache[data.qrToken] = {
            docId:      d.id,
            nombre:     data.nombre,
            numBoletos: data.numBoletos,
            validado:   data.qrValidado || false,
            horaVal:    data.fechaValidacion,
          };
        }
      });
      window.showToast?.(`✅ ${Object.keys(qrCache).length} tokens en caché`);
    } catch (err) {
      window.showToast?.('Error al cachear tokens');
    }
  }

  document.getElementById('btn-cache-qr')?.addEventListener('click', cacheQRTokens);
  await cacheQRTokens(); // Auto-cache on load

  // Results display
  function showResult(ok, title, meta) {
    const el = document.getElementById('scanner-result');
    if (!el) return;
    el.innerHTML = `
      <div class="scanner-result ${ok ? 'scanner-result--ok' : 'scanner-result--error'}">
        <div class="scanner-result__icon">${ok ? '✅' : '❌'}</div>
        <div class="scanner-result__name">${title}</div>
        <div class="scanner-result__meta">${meta}</div>
      </div>
    `;
  }

  // QR scan callback
  async function onScan(qrToken) {
    const entry = qrCache[qrToken];

    if (!entry) {
      showResult(false, 'QR no válido', 'Este código no pertenece a ningún invitado confirmado.');
      return;
    }

    if (entry.validado) {
      showResult(false, `⚠️ ${entry.nombre}`, `Este boleto ya fue utilizado${entry.horaVal ? ' a las ' + formatTime(entry.horaVal) : ''}.`);
      return;
    }

    // Valid! Mark as used
    showResult(true, entry.nombre, `🎟️ ${entry.numBoletos} boleto(s) · Entrada autorizada`);

    // Update Firestore
    try {
      await updateDoc(doc(db, 'invitados', entry.docId), {
        qrValidado:      true,
        fechaValidacion: serverTimestamp(),
      });
      // Update cache
      entry.validado = true;
      window.showToast?.(`✅ ${entry.nombre} — entrada registrada`);
    } catch {
      window.showToast?.('Error al registrar (funciona offline)');
    }
  }

  // Start/stop scanner
  document.getElementById('btn-start-scanner')?.addEventListener('click', async () => {
    const { Html5Qrcode } = await import('html5-qrcode');
    const readerEl = document.getElementById('scanner-reader');
    if (!readerEl) return;

    scannerInst = new Html5Qrcode('scanner-reader');
    try {
      await scannerInst.start(
        { facingMode: 'environment' }, // rear camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScan(decodedText.trim()),
        () => {} // ignore errors
      );
      document.getElementById('btn-start-scanner').style.display = 'none';
      document.getElementById('btn-stop-scanner').style.display  = 'inline-flex';
    } catch (err) {
      window.showToast?.('No se pudo acceder a la cámara.');
    }
  });

  document.getElementById('btn-stop-scanner')?.addEventListener('click', async () => {
    if (scannerInst) {
      await scannerInst.stop().catch(() => {});
      scannerInst = null;
    }
    document.getElementById('btn-start-scanner').style.display = 'inline-flex';
    document.getElementById('btn-stop-scanner').style.display  = 'none';
  });
}
