/**
 * Hero section renderer
 */
import { EVENT } from '../invitation.js';

export function renderHero(guest = null) {
  // El sobre siempre debe mostrar a la quinceañera.
  // La personalización va en la sección RSV / Confirmación.
  const greeting = `
       <p class="envelope__card-greeting">Celebrando a</p>
       <h2 class="envelope__card-name">Diana<br/>Yaretzi</h2>
  `;
  
  return `
  <section id="hero" class="section">
    <!-- sticky visual container: stays pinned while outer 250vh section scrolls -->
    <div class="hero__sticky">

      <div class="hero__bg"></div>

      <div class="hero__stage" id="envelope-stage">

        <!-- Envelope body -->
        <div class="envelope__body" id="envelope-body">
          <div class="envelope__placeholder" id="envelope-body-img">
            <!-- Replace with: <img src="/src/assets/images/envelope-body.png" alt="Sobre" /> -->
            <div class="envelope__lines"></div>
          </div>
          <div class="envelope__border"></div>

          <!-- Save the Date card (revealed when flap opens) -->
          <div class="envelope__card" id="envelope-card">
            <div class="envelope__card-photo-placeholder" id="card-photo-wrapper">
              <!-- Replace with: <img class="envelope__card-photo" src="/src/assets/images/save-the-date.jpg" alt="Diana Yaretzi" /> -->
              <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
                <circle cx="24" cy="18" r="8" stroke="#c0c0c0" stroke-width="1.5"/>
                <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#c0c0c0" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>

            ${greeting}

            <div class="envelope__card-divider"></div>
            <p class="envelope__card-date">04 · Julio · 2026</p>
            <p class="envelope__card-save">Save the Date</p>
          </div>
        </div>

        <!-- Envelope flap (animates open on scroll) -->
        <div class="envelope__flap" id="envelope-flap">
          <div class="envelope__flap-placeholder"></div>
        </div>

        <!-- Silver seal -->
        <div class="envelope__seal" id="envelope-seal">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="url(#sg)" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="40" cy="40" r="27" stroke="url(#sg)" stroke-width="0.8"/>
            <text x="40" y="37" text-anchor="middle" font-family="Playfair Display,serif" font-size="8" fill="url(#sg)" letter-spacing="2">DIANA</text>
            <text x="40" y="50" text-anchor="middle" font-family="Playfair Display,serif" font-size="6" fill="url(#sg)" letter-spacing="1.5">YARETZI</text>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="80" y2="80">
                <stop offset="0%"   stop-color="#8a8a8a"/>
                <stop offset="50%"  stop-color="#f0f0f0"/>
                <stop offset="100%" stop-color="#8a8a8a"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div><!-- /.hero__stage -->

      <!-- Scroll cue -->
      <div class="hero__scroll-cue" id="scroll-cue">
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>

    </div><!-- /.hero__sticky -->
  </section>
  `;

}
