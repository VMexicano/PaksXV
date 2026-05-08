/**
 * Countdown section — render + timer logic + .ics generation
 */
import { EVENT } from '../invitation.js';

export function renderCountdown() {
  return `
  <section id="countdown" class="section">
    <div class="container-sm">

      <div class="countdown__header reveal">
        <p class="countdown__eyebrow">Cuenta Regresiva</p>
        <h2 class="countdown__date">04 | Julio | 2026</h2>
        <p class="countdown__time">7:00 de la tarde</p>
      </div>

      <div class="countdown__actions reveal delay-4">
        <!-- El contador ahora vive dentro del óvalo (btn-calendar) -->
        <button id="btn-calendar" class="btn-calendar countdown-oval" aria-label="Agregar al calendario">
          <div class="countdown-oval-content">
            <div class="countdown__title shimmer" id="minimal-timer">
              <span id="cd-days">00</span><span class="countdown__sep">|</span><span id="cd-hours">00</span><span class="countdown__sep">|</span><span id="cd-minutes">00</span><span class="countdown__sep">|</span><span id="cd-seconds">00</span>
            </div>
            <p class="countdown__subtitle">Días &nbsp;&nbsp;&middot;&nbsp;&nbsp; Horas &nbsp;&nbsp;&middot;&nbsp;&nbsp; Min &nbsp;&nbsp;&middot;&nbsp;&nbsp; Seg</p>
          </div>
        </button>
      </div>

    </div>
  </section>
  `;
}

export function initCountdown() {
  // Timer
  const target = EVENT.date;

  function tick() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
        const el = document.getElementById(`cd-${id}`);
        if (el) el.textContent = '00';
      });
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = n => String(n).padStart(2, '0');

    const el = (id) => document.getElementById(id);
    if (el('cd-days')) el('cd-days').textContent = pad(days);
    if (el('cd-hours')) el('cd-hours').textContent = pad(hours);
    if (el('cd-minutes')) el('cd-minutes').textContent = pad(minutes);
    if (el('cd-seconds')) el('cd-seconds').textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);

  // Calendar button
  const btn = document.getElementById('btn-calendar');
  if (btn) {
    btn.addEventListener('click', downloadICS);
  }
}

function downloadICS() {
  // Event: July 4 2026, 7:00 PM CST (UTC-6 → UTC: 01:00 July 5)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XV Diana Yaretzi//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'DTSTART:20260704T190000',
    'DTEND:20260705T010000',
    'SUMMARY:XV Años — Diana Yaretzi Hdz Pérez',
    'DESCRIPTION:¡Estás invitado/a a los XV Años de Diana Yaretzi!',
    `LOCATION:${EVENT.venue || 'Por confirmar'}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    // Reminder 2 weeks before
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio: XV Años Diana Yaretzi — faltan 2 semanas',
    'TRIGGER:-P14D',
    'END:VALARM',
    // Reminder 2 days before
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio: XV Años Diana Yaretzi — pasado mañana',
    'TRIGGER:-P2D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'XV-Diana-Yaretzi.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.showToast?.('📅 Evento agregado al calendario');
}
