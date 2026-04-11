/**
 * Admin Photos — view uploaded photos from Firebase Storage
 */

import { storage }              from '../../firebase.js';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { adminShell }           from './shell.js';

export async function renderPhotos(container, ctx) {
  adminShell(container, ctx, 'fotos', `
    <div class="admin-page-header">
      <div>
        <h1 class="admin-page-title">Fotos del evento</h1>
        <p class="admin-page-subtitle">Fotos subidas por los invitados</p>
      </div>
    </div>
    <div id="photos-grid" class="photos-grid">
      <p style="color:#5a6a7a;font-style:italic">Cargando fotos…</p>
    </div>
  `);

  const grid = document.getElementById('photos-grid');
  try {
    const folderRef = ref(storage, 'fotos-evento');
    const list      = await listAll(folderRef);

    if (!list.items.length) {
      if (grid) grid.innerHTML = '<p style="color:#5a6a7a;font-style:italic;grid-column:1/-1">Sin fotos aún.</p>';
      return;
    }

    const urls = await Promise.all(list.items.map(item => getDownloadURL(item)));
    if (grid) {
      grid.innerHTML = urls.map(url => `
        <img src="${url}" alt="Foto del evento" loading="lazy"
             onclick="window.open('${url}','_blank')" />
      `).join('');
    }
  } catch (err) {
    console.error(err);
    if (grid) grid.innerHTML = '<p style="color:#cc4a4a">Error al cargar fotos.</p>';
  }
}
