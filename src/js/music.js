/**
 * Music module
 * - Auto-plays on first user interaction (scroll/click)
 * - FAB toggles mute/unmute
 */

const audio   = () => document.getElementById('bg-music');
const fab     = () => document.getElementById('music-fab');
const iconOn  = () => document.getElementById('icon-music-on');
const iconOff = () => document.getElementById('icon-music-off');

let hasStarted = false;

export function initMusic() {
  const fabEl = fab();
  if (fabEl) {
    fabEl.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering document clicks
      toggleMute();
    });
  }

  // Try to start music on first user interaction anywhere
  const startMusic = async () => {
    if (hasStarted) return;
    
    const audioEl = audio();
    if (!audioEl || audioEl.src.includes('background.mp3') === false) return;

    try {
      audioEl.volume = 0.4;
      await audioEl.play();
      hasStarted = true;
      
      if (fabEl) fabEl.classList.add('playing');
      
      // Cleanup listeners
      ['click', 'touchstart', 'scroll'].forEach(evt => {
        document.removeEventListener(evt, startMusic);
      });
    } catch {
      // Browsers may still block if interaction wasn't "trusted" enough
    }
  };

  // Listen for generic user interactions to unlock autoplay
  ['click', 'touchstart', 'scroll'].forEach(evt => {
    document.addEventListener(evt, startMusic, { once: true, passive: true });
  });
}

function toggleMute() {
  const audioEl = audio();
  const fabEl   = fab();
  if (!audioEl) return;

  if (audioEl.paused) {
    audioEl.play().catch(() => {});
    hasStarted = true;
    iconOn()?.removeAttribute('style');
    iconOff()?.setAttribute('style', 'display:none');
    fabEl?.classList.add('playing');
  } else {
    audioEl.pause();
    iconOn()?.setAttribute('style', 'display:none');
    iconOff()?.removeAttribute('style');
    fabEl?.classList.remove('playing');
  }
}
