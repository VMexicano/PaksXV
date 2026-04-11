import { auth } from '../firebase.js';

export async function renderDS() {
  const app = document.getElementById('app');
  
  // Basic structure for DS
  app.innerHTML = `
    <div class="ds-container">
      <header class="ds-section text-center">
        <h1 class="ds-title">XV Design System</h1>
        <p class="font-elegant">Guía de estilos, componentes e identidad visual para los XV de Diana Yaretzi.</p>
      </header>

      <!-- Typography -->
      <section class="ds-section">
        <h2 class="section-title">Tipografía</h2>
        <div class="ds-typography-sample">
          <span class="ds-typography-label">Heading (Playfair Display)</span>
          <h1 class="font-display">La elegancia de un momento inolvidable</h1>
        </div>
        <div class="ds-typography-sample">
          <span class="ds-typography-label">Elegant (Cormorant Garamond)</span>
          <p class="font-elegant" style="font-size: 2rem;">Estás cordialmente invitado a celebrar con nosotros.</p>
        </div>
        <div class="ds-typography-sample">
          <span class="ds-typography-label">Body (Inter)</span>
          <p class="font-body">Este es el cuerpo de texto principal. Diseñado para ser legible y limpio, utilizando la fuente Inter en sus diferentes pesos para jerarquía visual.</p>
        </div>
      </section>

      <!-- Colors -->
      <section class="ds-section">
        <h2 class="section-title">Paleta de Colores</h2>
        <div class="ds-grid">
          <div class="ds-color-card" style="background: var(--navy);">
            <span>Primary (Navy) #1a3a5c</span>
          </div>
          <div class="ds-color-card" style="background: var(--silver);">
            <span>Accent (Silver) #c0c0c0</span>
          </div>
          <div class="ds-color-card" style="background: var(--cream);">
            <span>Background (Cream) #f5f0e8</span>
          </div>
          <div class="ds-color-card" style="background: #DB2777;">
            <span>Pink (Highlight) #DB2777</span>
          </div>
          <div class="ds-color-card" style="background: #CA8A04;">
            <span>Gold (CTA) #CA8A04</span>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section class="ds-section">
        <h2 class="section-title">Botones e Interacción</h2>
        <div class="ds-component-row">
          <button class="btn btn-primary">Botón Primario</button>
          <button class="btn btn-silver">Botón Plateado</button>
          <button class="btn btn-outline">Botón Outline</button>
          <button class="btn btn-ghost">Botón Ghost</button>
        </div>
        <p class="ds-typography-label" style="margin-top: 2rem;">Efectos de Cursor</p>
        <div class="ds-component-row">
          <div class="glass-card" style="padding: 1rem; cursor: pointer;">Card con cursor-pointer</div>
        </div>
      </section>

      <!-- Components -->
      <section class="ds-section">
        <h2 class="section-title">Componentes Especiales</h2>
        <p class="ds-typography-label">Liquid Glass Card</p>
        <div class="liquid-glass-sample">
          <span>Premium Experience</span>
        </div>
        
        <p class="ds-typography-label" style="margin-top: 2rem;">Ornaments</p>
        <div class="ornament">
          <div class="ornament-icon">✦</div>
        </div>
      </section>

      <!-- Icons (SVG only) -->
      <section class="ds-section">
        <h2 class="section-title">Iconografía (SVG Only)</h2>
        <div class="ds-icon-grid">
          <div class="ds-icon-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span>Home</span>
          </div>
          <div class="ds-icon-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Calendar</span>
          </div>
          <div class="ds-icon-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Location</span>
          </div>
          <div class="ds-icon-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>Love</span>
          </div>
        </div>
      </section>

      <footer class="text-center" style="margin-top: 4rem;">
        <a href="#/" class="btn btn-ghost">Volver a la Invitación</a>
      </footer>
    </div>
  `;
}
