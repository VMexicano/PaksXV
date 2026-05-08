/**
 * Envelope scroll-driven animation
 *
 * Drives two CSS custom properties on the hero-sticky and envelope-stage:
 *   --open (0 → 1): flap opens, seal splits, inside-card peeks out
 *   --lift (0 → 1): card exits envelope, floats up, then settles at viewport center
 *
 * Phase map over the 700vh scroll runway:
 *   0.00 – 0.08  intro pause (envelope visible, nothing moves)
 *   0.08 – 0.32  envelope opens (--open: 0 → 1)
 *   0.32 – 0.40  hold (envelope open, inside card peek)
 *   0.40 – 0.62  card lifts out and settles (--lift: 0 → 1)
 *   0.62 – 1.00  long hold: final card stays visible while scrolling continues
 */

export function initEnvelope() {
  const hero       = document.querySelector('.hero');
  const stage      = document.getElementById('envelope-stage');
  const stickyHost = document.querySelector('.hero-sticky');
  const scrollHint = document.getElementById('scroll-hint');

  if (!hero || !stage) return;

  function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
  }

  function onScroll() {
    const rect    = hero.getBoundingClientRect();
    const vh      = window.innerHeight;
    const total   = hero.offsetHeight - vh;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const raw     = total > 0 ? scrolled / total : 0;

    // Compute phase progress
    const openProg = clamp((raw - 0.08) / 0.24, 0, 1);
    const liftProg = clamp((raw - 0.40) / 0.22, 0, 1);

    // Set on both hosts so descendants and siblings can read them
    if (stickyHost) {
      stickyHost.style.setProperty('--open', openProg.toFixed(4));
      stickyHost.style.setProperty('--lift', liftProg.toFixed(4));
    }
    stage.style.setProperty('--open', openProg.toFixed(4));
    stage.style.setProperty('--lift', liftProg.toFixed(4));

    // Scroll hint fades out early
    if (scrollHint) {
      scrollHint.classList.toggle('gone', raw > 0.04);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}
