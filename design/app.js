/* ==========================================================
   XV Años — interactions
   ========================================================== */

// ----- Scroll-driven envelope opening (manual fallback for cross-browser) -----
const hero = document.querySelector('.hero');
const stage = document.querySelector('.envelope-stage');
const stickyHost = document.querySelector('.hero-sticky');
const scrollHint = document.querySelector('.scroll-hint');

function onScroll() {
  if (!hero || !stage) return;
  const rect = hero.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = hero.offsetHeight - vh;
  const scrolled = Math.min(Math.max(-rect.top, 0), total);
  const raw = total > 0 ? scrolled / total : 0;

  // Phases over the scroll runway:
  //   0.00 - 0.08  intro pause
  //   0.08 - 0.32  envelope opens (--open: 0 → 1)
  //   0.32 - 0.40  hold (envelope abierto, peek interior)
  //   0.40 - 0.62  carta sube, sale y baja al frente (--lift: 0 → 1)
  //   0.62 - 1.00  HOLD largo: carta final visible mientras se sigue scrolleando
  const openProg = clamp((raw - 0.08) / 0.24, 0, 1);
  const liftProg = clamp((raw - 0.40) / 0.22, 0, 1);

  // Set on both hosts so descendants and siblings can read them.
  if (stickyHost) {
    stickyHost.style.setProperty('--open', openProg.toFixed(4));
    stickyHost.style.setProperty('--lift', liftProg.toFixed(4));
  }
  stage.style.setProperty('--open', openProg.toFixed(4));
  stage.style.setProperty('--lift', liftProg.toFixed(4));

  if (scrollHint) {
    scrollHint.classList.toggle('gone', raw > 0.04);
  }
}

function clamp(x, a, b) { return Math.min(Math.max(x, a), b); }

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// ----- Countdown -----
const TARGET = new Date('2026-07-04T19:00:00-06:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  setText('cd-days', String(days).padStart(2, '0'));
  setText('cd-hours', String(hours).padStart(2, '0'));
  setText('cd-mins', String(mins).padStart(2, '0'));
  setText('cd-secs', String(secs).padStart(2, '0'));
}

function setText(id, t) {
  const el = document.getElementById(id);
  if (el && el.textContent !== t) el.textContent = t;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ----- RSVP choices -----
document.querySelectorAll('.choice-row').forEach(row => {
  row.addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (!c) return;
    row.querySelectorAll('.choice').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
  });
});

document.querySelector('#rsvp-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  if (btn) {
    btn.textContent = '✓ Asistencia confirmada';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }
});

// ----- Add to calendar (.ics) -----
document.querySelector('#add-cal')?.addEventListener('click', e => {
  e.preventDefault();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:diana-yaretzi-xv@invitacion',
    'DTSTAMP:20260704T010000Z',
    'DTSTART:20260705T010000Z',
    'DTEND:20260705T070000Z',
    'SUMMARY:XV Años de Diana Yaretzi',
    'LOCATION:Jardín Nevado, Av. Nevado 172, Portales Sur, CDMX',
    'DESCRIPTION:Celebrando los XV años de Diana Yaretzi Hernández Pérez.',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'XV-Diana-Yaretzi.ics';
  a.click();
  URL.revokeObjectURL(url);
});

// ----- Photo upload preview -----
const uploadInput = document.querySelector('#upload-input');
const uploadZone = document.querySelector('#upload-zone');
const uploadCount = document.querySelector('#upload-count');
let uploaded = 0;

uploadZone?.addEventListener('click', () => uploadInput?.click());
uploadInput?.addEventListener('change', e => {
  uploaded += e.target.files.length;
  if (uploadCount) {
    uploadCount.textContent = `${uploaded} foto${uploaded === 1 ? '' : 's'} compartida${uploaded === 1 ? '' : 's'} ✦`;
    uploadCount.style.opacity = '1';
  }
});
