/**
 * Music module
 * - Shows overlay "Toca para entrar"
 * - On tap: plays MP3 background, hides overlay, shows FAB
 * - FAB toggles mute/unmute
 */

const audio   = () => document.getElementById('bg-music');
const overlay = () => document.getElementById('music-overlay');
const fab     = () => document.getElementById('music-fab');
const iconOn  = () => document.getElementById('icon-music-on');
const iconOff = () => document.getElementById('icon-music-off');

export function initMusic() {
  const overlayEl = overlay();
  if (!overlayEl) return;

  overlayEl.addEventListener('click', handleEntry, { once: true });
}

async function handleEntry() {
  const audioEl   = audio();
  const overlayEl = overlay();
  const fabEl     = fab();

  // Hide overlay
  overlayEl.classList.add('hidden');
  setTimeout(() => { overlayEl.style.display = 'none'; }, 600);

  // Show FAB
  if (fabEl) {
    fabEl.hidden = false;
    fabEl.addEventListener('click', toggleMute);
  }

  // Try to play audio
  if (audioEl?.src && !audioEl.src.includes('background.mp3') === false) {
    try {
      audioEl.volume = 0.4;
      await audioEl.play();
      fabEl?.classList.add('playing');
    } catch {
      // Autoplay blocked — FAB still shown, user can unmute later
    }
  }
}

function toggleMute() {
  const audioEl = audio();
  const fabEl   = fab();
  if (!audioEl) return;

  if (audioEl.paused) {
    audioEl.play().catch(() => {});
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
