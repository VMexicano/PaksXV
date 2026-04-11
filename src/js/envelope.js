/**
 * Envelope parallax — scroll-pinned pattern
 *
 * How it works:
 * - #hero is 250vh tall → gives 150vh of "scroll room" after the first viewport
 * - .hero__sticky inside uses position:sticky so visuals stay fixed
 * - JS reads how far we've scrolled THROUGH the hero section to get progress 0→1
 * - progress drives: flap rotation, seal opacity/scale, card reveal, scroll-cue fade
 */

export function initEnvelope() {
  const hero  = document.getElementById('hero');
  const flap  = document.getElementById('envelope-flap');
  const seal  = document.getElementById('envelope-seal');
  const card  = document.getElementById('envelope-card');
  const cue   = document.getElementById('scroll-cue');
  const stage = document.getElementById('envelope-stage');

  if (!hero || !flap) return;

  let ticking = false;

  function update() {
    // How far have we scrolled into the hero section?
    // scrolledPast: pixels scrolled past the top of #hero
    const heroTop    = hero.getBoundingClientRect().top + window.scrollY;
    const scrolled   = Math.max(0, window.scrollY - heroTop);
    // animRange: the 150vh of "extra" scroll space we added
    const animRange  = hero.offsetHeight - window.innerHeight;
    // progress: 0 (start) → 1 (envelope fully open)
    const progress   = Math.min(1, Math.max(0, scrolled / animRange));

    // ── Flap: 0° (closed) → -170° (open/folded back) ──────────
    const flapRot = progress * -170;
    flap.style.transform = `rotateX(${flapRot}deg)`;

    // ── Seal: scales down and fades as flap lifts ──────────────
    if (seal) {
      const sealProgress = Math.min(1, progress * 2); // faster than flap
      seal.style.transform   = `translateX(-50%) scale(${1 - sealProgress * 0.5})`;
      seal.style.opacity     = String(Math.max(0, 1 - sealProgress));
    }

    // ── Card reveal: appears at 55% progress ───────────────────
    if (card) {
      card.classList.toggle('revealed', progress > 0.55);
    }

    // ── Scroll cue: fast fade ──────────────────────────────────
    if (cue) {
      cue.style.opacity = String(Math.max(0, 1 - progress * 6));
    }

    // ── Envelope stage: subtle scale-up as it "opens" ──────────
    if (stage) {
      const sc = 1 + progress * 0.04; // 1.0 → 1.04
      stage.style.transform = `scale(${sc})`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Also update on resize (viewport height change)
  window.addEventListener('resize', update, { passive: true });

  update(); // set initial state
}
