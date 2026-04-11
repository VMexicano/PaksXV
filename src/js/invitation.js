/**
 * Invitation renderer
 * Builds all sections. If inviteToken provided, loads guest from Firestore
 * and personalizes the greeting + RSVP section.
 */

import { db }          from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import { renderHero }       from './sections/hero.js';
import { renderCountdown, initCountdown } from './sections/countdown.js';
import { renderTimeline }   from './sections/timeline.js';
import { renderGallery, initGallery }    from './sections/gallery.js';
import { renderDetails, renderGifts, renderUpload, renderFooter } from './sections/details.js';
import { renderRSVP }       from './sections/rsvp.js';
import { initEnvelope }     from './envelope.js';
import { initUpload }       from './sections/upload.js';

/** Event data — update when venue is confirmed */
export const EVENT = {
  name:       'Diana Yaretzi Hdz Pérez',
  date:       new Date('2026-07-04T19:00:00-06:00'),
  dateLabel:  '04 de Julio de 2026',
  timeLabel:  '7:00 PM',
  venue:      'Jardín Nevado',
  address:    'Av. Nevado 172, Portales Sur, Benito Juárez, CDMX',
  mapsUrl:    'https://maps.google.com/maps?q=Jard%C3%ADn+Nevado%2C+Av.+Nevado+172%2C+Portales+Sur%2C+Benito+Ju%C3%A1rez%2C+03300+Ciudad+de+M%C3%A9xico%2C+CDMX&t=&z=16&ie=UTF8&iwloc=&output=embed',
  whatsapp:   'https://wa.me/5215627234166',
  itinerary: [
    { time: '7:00 PM',        label: 'Recepción',                   icon: '🚪' },
    { time: '7:00 – 7:45',   label: 'Cocktail y bienvenida',       icon: '🥂' },
    { time: '7:45',           label: 'Comida · 3 tiempos + snacks', icon: '🍽️' },
    { time: '8:25',           label: 'Primer baile',                 icon: '💃' },
    { time: '9:00',           label: 'Abre pista',                  icon: '🎶' },
    { time: '9:15',           label: 'Mesa de dulces',              icon: '🍭' },
    { time: '1:00 AM',        label: 'Final de la velada',          icon: '✨' },
  ],
};

/**
 * @param {Object} options
 * @param {string} [options.inviteToken]  - token from #/i/{token}
 * @param {string} [options.scrollTo]    - section id to scroll to
 * @param {HTMLElement} container
 */
export async function renderInvitation({ inviteToken, scrollTo } = {}, container) {
  let guest = null;

  // Load guest by token
  if (inviteToken) {
    guest = await loadGuestByToken(inviteToken);
    // Mark as "visitado" if still "pendiente"
    if (guest && guest.estado === 'pendiente') {
      markVisitado(guest.id);
      guest.estado = 'visitado';
    }
  }

  // Build HTML
  container.innerHTML = `
    ${renderHero(guest)}
    ${renderCountdown()}
    ${renderTimeline()}
    ${renderGallery()}
    ${renderDetails()}
    ${inviteToken ? renderRSVP(guest, inviteToken) : ''}
    ${renderGifts()}
    ${renderUpload()}
    ${renderFooter()}
  `;

  // Init interactive JS for each section
  initEnvelope();
  initCountdown();
  initGallery();
  initUpload();

  // Init RSVP if personalized
  if (inviteToken) {
    const { initRSVP } = await import('./sections/rsvp.js');
    initRSVP(guest, inviteToken);
  }

  // Scroll to section if needed
  if (scrollTo) {
    const el = document.getElementById(scrollTo);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
  }
}

// ── Firestore helpers ────────────────────────────────────────────

async function loadGuestByToken(inviteToken) {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(
      collection(db, 'invitados'),
      where('inviteToken', '==', inviteToken)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error('Error loading guest:', err);
    return null;
  }
}

async function markVisitado(invitadoId) {
  try {
    await updateDoc(doc(db, 'invitados', invitadoId), { estado: 'visitado' });
  } catch {
    // Non-critical
  }
}
