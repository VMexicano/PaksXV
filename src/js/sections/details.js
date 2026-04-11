/** Details, Gifts, Upload, Footer section renderers */
import { EVENT } from '../invitation.js';

// ── Details ──────────────────────────────────────────────────────
export function renderDetails() {
  return `
  <section id="details" class="section">
    <div class="container">
      <div class="text-center reveal">
        <h2 class="section-title">Detalles del Evento</h2>
        <p class="section-subtitle">Todo lo que necesitas saber para ese día</p>
        <div class="ornament"><span class="ornament-icon">✦</span></div>
      </div>
      <div class="details__grid">
        <div class="detail-card reveal delay-1">
          <span class="detail-card__icon">🅿️</span>
          <h3 class="detail-card__title">Estacionamiento</h3>
          <p class="detail-card__text">Información por confirmar</p>
        </div>
        <div class="detail-card reveal delay-2">
          <span class="detail-card__icon">🚗</span>
          <h3 class="detail-card__title">Valet Parking</h3>
          <p class="detail-card__text">Información por confirmar</p>
        </div>
        <div class="detail-card reveal delay-3">
          <span class="detail-card__icon">📍</span>
          <h3 class="detail-card__title">Ubicación</h3>
          <p class="detail-card__text">${EVENT.venue || 'Por confirmar'}</p>
        </div>
      </div>
    </div>
  </section>
  `;
}

// ── Gifts ────────────────────────────────────────────────────────
export function renderGifts() {
  return `
  <section id="regalos" class="section">
    <div class="container-sm">
      <div class="text-center reveal" style="margin-bottom:var(--space-10)">
        <h2 class="section-title light">Mesa de Regalos</h2>
        <p class="section-subtitle light">Sugerencias no obligatorias · Tu presencia es el mejor regalo</p>
      </div>
      <div class="gifts__card reveal delay-2">
        <p class="gifts__note">Si deseas hacerme un regalo, puedes encontrar mi lista en Liverpool:</p>
        <div class="gifts__qr">
          <!-- TODO: Replace with actual Liverpool QR image -->
          <div class="gifts__qr-placeholder">
            QR Liverpool<br/>Por agregar
          </div>
        </div>
        <p class="gifts__label">Escanea el código QR</p>
      </div>
    </div>
  </section>
  `;
}

// ── Upload ───────────────────────────────────────────────────────
export function renderUpload() {
  return `
  <section id="subir-fotos" class="section">
    <div class="container-sm">
      <div class="text-center reveal" style="margin-bottom:var(--space-10)">
        <h2 class="section-title">Comparte tus Fotos</h2>
        <p class="section-subtitle">Captura los mejores momentos de la noche</p>
        <div class="ornament"><span class="ornament-icon">✦</span></div>
      </div>
      <div class="upload__card reveal delay-2">
        <div class="upload__icon" aria-hidden="true">📸</div>
        <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:var(--space-2)">Sube tus fotos</h3>
        <p style="font-style:italic;color:var(--color-text-soft);font-size:0.9rem;">
          Comparte los momentos especiales de la noche con todos
        </p>

        <div class="upload__dropzone" id="upload-dropzone" role="button" aria-label="Seleccionar foto">
          <input type="file" id="upload-input" accept="image/*" capture="environment" multiple />
          <p class="upload__dropzone-text">Toca para tomar foto o seleccionar</p>
          <p class="upload__dropzone-sub">Máximo 10MB por foto · Solo imágenes</p>
        </div>

        <div class="upload__preview" id="upload-preview"></div>
        <div class="upload__progress" id="upload-progress" style="display:none">
          <div class="upload__progress-bar" id="upload-progress-bar"></div>
        </div>

        <button id="btn-upload" class="btn btn-primary" style="width:100%;display:none">
          ⬆ Subir Foto
        </button>
        <p id="upload-status" style="font-size:0.875rem;color:var(--color-text-soft);margin-top:var(--space-2);text-align:center"></p>
      </div>
    </div>
  </section>
  `;
}

// ── Footer ───────────────────────────────────────────────────────
export function renderFooter() {
  const mapSrc = EVENT.mapsUrl || '';
  const mapContent = mapSrc
    ? `<iframe src="${mapSrc}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Ubicación del evento"></iframe>`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--silver-dark);font-style:italic;font-size:0.9rem;">📍 Mapa por confirmar</div>`;

  return `
  <footer id="footer" class="section">
    <div class="container">
      <div class="text-center reveal" style="margin-bottom:var(--space-12)">
        <h2 class="section-title light">¡Te esperamos!</h2>
        <p class="section-subtitle light" style="font-size:1.1rem; font-style:italic; line-height:1.6; max-width:600px; margin: 24px auto; color: #e0e0e0;">
          "Hoy dejo atrás mi niñez para comenzar a escribir mi propia historia."
        </p>
        <div class="ornament" style="--silver:rgba(192,192,192,0.4); margin-top:32px"><span class="ornament-icon" style="color:var(--silver)">✦</span></div>
      </div>

      <div class="footer__grid reveal">
        <div>
          <div class="footer__map" style="margin-bottom: 16px;">${mapContent}</div>
          <a href="https://www.google.com/maps/place/Jard%C3%ADn+Nevado,+Av.+Nevado+172,+Portales+Sur,+Benito+Ju%C3%A1rez,+03300+Ciudad+de+M%C3%A9xico,+CDMX/data=!4m2!3m1!1s0x85d1ffc9c8832681:0x771e6fe525ad51dc!18m1!1e1?utm_source=mstt_1&entry=gps"
             target="_blank" rel="noopener noreferrer" 
             style="display:flex; justify-content:center; align-items:center; gap:8px; padding:12px; background:linear-gradient(135deg, #8a8a8a, #f0f0f0, #8a8a8a); color:#0d2137; text-decoration:none; font-weight:700; border-radius:99px; font-size:0.9rem; transition:transform 0.2s;">
            📍 Abrir GPS o Compartir Ubicación
          </a>
        </div>
        <div class="footer__info">
          <div>
            <h3 class="footer__name">Diana Yaretzi</h3>
            <p class="footer__date">04 de Julio · 2026 · 7:00 PM</p>
          </div>
          ${EVENT.address ? `<p class="footer__address">${EVENT.address}</p>` : '<p class="footer__address" style="font-style:italic;opacity:0.5">Dirección por confirmar</p>'}
          <a href="https://wa.me/5215627234166"
             target="_blank" rel="noopener noreferrer"
             class="footer__whatsapp"
             aria-label="Contactar por WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>

      <div class="footer__credits">
        Con amor · Diana Yaretzi XV Años · 2026
      </div>
    </div>
  </footer>
  `;
}
