/**
 * Hero section renderer — Envelope with scroll-driven animation
 * Adapted from /design/ prototype.
 *
 * Architecture:
 *  - .hero is 700vh tall → gives a long scroll runway for 3 animation phases
 *  - .hero-sticky stays pinned at top:0
 *  - envelope.js sets --open and --lift CSS custom properties
 *  - CSS calc() drives flap rotation, seal split, card-inside slide, and floating card
 */

export function renderHero(guest = null) {
  return `
  <section class="hero" id="hero" data-screen-label="01 Sobre">
    <div class="hero-sticky">

      <!-- Floating title above envelope -->
      <div class="hero-title">
        <div class="eyebrow">Para&nbsp;ti</div>
        <div class="name">Mis XV Años</div>
      </div>

      <!-- The envelope -->
      <div class="envelope-stage" id="envelope-stage">
        <div class="envelope">

          <!-- Back wall -->
          <div class="env-back" aria-hidden="true">
            <!-- Card inside the envelope (clipped by .envelope overflow:hidden) -->
            <div class="card-inside" aria-hidden="true">
              <!-- Layers -->
              <div class="card-layer" style="background-image: url('/src/assets/images/letter/fondo-lago.png'); z-index: 1;"></div>
              <div class="card-layer" style="background-image: url('/src/assets/images/letter/XV-letras.png'); z-index: 2; background-position: center 20%;"></div>
              <div class="card-layer" style="background-image: url('/src/assets/images/letter/foto-diana.png'); z-index: 3;"></div>
              
              <div class="card-overlay" style="z-index: 4;"></div>
              
              <div class="card-content card-content-inside card-content-new" style="z-index: 5;">
                <div class="card-save-container">
                  <span class="card-save">Save the Date</span>
                  <span class="card-mis">Mis XV años</span>
                </div>
                <div class="card-name-new">Diana</div>
                <div class="card-date-new">04 | 07 | 26</div>
              </div>
            </div>
          </div>

          <!-- Front (envelope body that hides bottom of card) -->
          <div class="env-front" aria-hidden="true"></div>

          <!-- Wax seal split into two halves -->
          <div class="seal" aria-hidden="true">
            <div class="seal-half seal-top">
              <div class="seal-disc">
                <div class="seal-content">
                  <div class="seal-monogram">DY</div>
                  <div class="seal-label">XV AÑOS</div>
                </div>
              </div>
            </div>
            <div class="seal-half seal-bottom">
              <div class="seal-disc">
                <div class="seal-content">
                  <div class="seal-monogram">DY</div>
                  <div class="seal-label">XV AÑOS</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top flap (animates open) -->
          <div class="env-flap" aria-hidden="true">
            <div class="env-flap-inner"></div>
          </div>

        </div>
      </div>

      <!-- Final card OUTSIDE the envelope-stage — independent layer -->
      <div class="card" id="floating-card" role="img" aria-label="Tarjeta Save the Date para Diana Yaretzi">
        <!-- Layers -->
        <div class="card-layer" style="background-image: url('/src/assets/images/letter/fondo-lago.png'); z-index: 1;"></div>
        <div class="card-layer" style="background-image: url('/src/assets/images/letter/XV-letras.png'); z-index: 2; background-position: center 20%;"></div>
        <div class="card-layer" style="background-image: url('/src/assets/images/letter/foto-diana.png'); z-index: 3;"></div>
        
        <div class="card-overlay" style="z-index: 4;"></div>
        
        <div class="card-content card-content-new" style="z-index: 5;">
          <div class="card-save-container">
            <span class="card-save">Save the Date</span>
            <span class="card-mis">Mis XV años</span>
          </div>
          <h1 class="card-name-new">Diana</h1>
          <div class="card-date-new">04 | 07 | 26</div>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="scroll-hint" id="scroll-hint">
        <span>Desliza para abrir</span>
        <span class="dot"></span>
      </div>

    </div>
  </section>
  `;
}
