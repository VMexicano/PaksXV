/** Timeline section renderer */
import { EVENT } from '../invitation.js';

export function renderTimeline() {
  const items = EVENT.itinerary.map((item, i) => `
    <div class="timeline__item ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'} delay-${Math.min(i + 1, 7)}">
      <div class="timeline__icon" aria-hidden="true">${item.icon}</div>
      <div class="timeline__content">
        <p class="timeline__time">${item.time}</p>
        <p class="timeline__activity">${item.label}</p>
      </div>
    </div>
  `).join('');

  return `
  <section id="timeline" class="section">
    <div class="container">
      <div class="timeline__header reveal">
        <h2 class="section-title">Itinerario</h2>
        <p class="section-subtitle">Una noche llena de momentos especiales</p>
        <div class="ornament"><span class="ornament-icon">✦</span></div>
      </div>

      <div class="timeline__track">
        ${items}
      </div>

      <div class="timeline__ornament reveal">· · ✦ · ·</div>
    </div>
  </section>
  `;
}
