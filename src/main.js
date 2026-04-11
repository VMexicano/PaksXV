/**
 * Main entry point
 * 1. Import global styles
 * 2. Init music overlay
 * 3. Run router
 */

import './styles/index.css';
import './styles/admin/admin.css';
import { route }      from './router.js';
import { initMusic }  from './js/music.js';
import { showToast }  from './js/utils.js';

// Make showToast globally available for modules
window.showToast = showToast;

// Boot
async function boot() {
  // Init music gate (blocks UI until first tap)
  initMusic();

  // Run router on load
  await route();
}

boot();
