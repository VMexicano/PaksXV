/** Gallery section — render + parallax + tap glassmorphism */

const PHOTOS = [
  { src: null, caption: 'Diana Yaretzi' },
  { src: null, caption: 'Un momento especial' },
  { src: null, caption: 'Con cariño' },
  { src: null, caption: 'Recuerdos' },
  { src: null, caption: 'Celebrando' },
  { src: null, caption: 'Familia' },
  { src: null, caption: 'Amor' },
];
// TODO: Replace src with actual image paths e.g. '/src/assets/images/gallery/1.jpg'

export function renderGallery() {
  const items = PHOTOS.map((p, i) => `
    <div class="gallery__item reveal delay-${Math.min(i + 1, 7)}" data-index="${i}">
      ${p.src
        ? `<img src="${p.src}" alt="${p.caption}" loading="lazy" />`
        : `<div class="gallery__placeholder">🌸</div>`
      }
      <div class="gallery__overlay">
        <p class="gallery__caption">${p.caption}</p>
      </div>
    </div>
  `).join('');

  return `
  <section id="gallery" class="section">
    <div class="gallery__header reveal">
      <h2 class="section-title light">Galería</h2>
      <p class="section-subtitle light">Momentos que siempre recordaremos</p>
      <div class="ornament" style="--silver: rgba(192,192,192,0.4)"><span class="ornament-icon" style="color:var(--silver)">✦</span></div>
    </div>
    <div class="gallery__grid" id="gallery-grid">
      ${items}
    </div>
  </section>
  `;
}

export function initGallery() {
  const items = document.querySelectorAll('.gallery__item');
  if (!items.length) return;

  // Mobile: tap to toggle glassmorphism
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i !== item && i.classList.remove('active'));
      item.classList.toggle('active');
    });
  });

  // Parallax on scroll
  const imgs = document.querySelectorAll('.gallery__item img');
  if (!imgs.length) return;

  let ticking = false;
  function updateParallax() {
    imgs.forEach(img => {
      const rect = img.closest('.gallery__item').getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewH  = window.innerHeight;
      const ratio  = (center - viewH / 2) / viewH;
      const shift  = ratio * 20; // max 20px
      img.style.setProperty('--parallax-y', `${shift}px`);
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}
