/**
 * Countdown section — render + timer logic + .ics generation
 */
import { EVENT } from '../invitation.js';

export function renderCountdown() {
  return `
  <section id="countdown" class="section">
    <div class="container-sm">

      <div class="countdown__header reveal">
        <p class="countdown__eyebrow">Cuenta regresiva</p>
        <h2 class="countdown__title shimmer">04 · Julio · 2026</h2>
        <p class="countdown__subtitle">7:00 de la tarde</p>
      </div>

      <div class="countdown__timer reveal delay-2" id="countdown-timer">
        <div class="countdown__unit">
          <span class="countdown__number" id="cd-days">00</span>
          <span class="countdown__label">Días</span>
        </div>
        <span class="countdown__separator">:</span>
        <div class="countdown__unit">
          <span class="countdown__number" id="cd-hours">00</span>
          <span class="countdown__label">Horas</span>
        </div>
        <span class="countdown__separator">:</span>
        <div class="countdown__unit">
          <span class="countdown__number" id="cd-minutes">00</span>
          <span class="countdown__label">Minutos</span>
        </div>
        <span class="countdown__separator">:</span>
        <div class="countdown__unit">
          <span class="countdown__number" id="cd-seconds">00</span>
          <span class="countdown__label">Segundos</span>
        </div>
      </div>

      <div class="countdown__actions reveal delay-4">
        <button id="btn-calendar" class="btn-calendar" aria-label="Agregar al calendario">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
          Agregar al calendario
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
    const now  = new Date();
    const diff = target - now;

    if (diff <= 0) {
      ['days','hours','minutes','seconds'].forEach(id => {
        const el = document.getElementById(`cd-${id}`);
        if (el) el.textContent = '00';
      });
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    const pad = n => String(n).padStart(2, '0');

    const el = (id) => document.getElementById(id);
    if (el('cd-days'))    el('cd-days').textContent    = pad(days);
    if (el('cd-hours'))   el('cd-hours').textContent   = pad(hours);
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
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'XV-Diana-Yaretzi.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.showToast?.('📅 Evento agregado al calendario');
}
