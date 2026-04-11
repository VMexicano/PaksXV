/**
 * Upload section — Firebase Storage upload
 */
import { storage, auth } from '../../firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

export function initUpload() {
  const dropzone    = document.getElementById('upload-dropzone');
  const inputEl     = document.getElementById('upload-input');
  const previewEl   = document.getElementById('upload-preview');
  const btnUpload   = document.getElementById('btn-upload');
  const progressBar = document.getElementById('upload-progress-bar');
  const progressWrap= document.getElementById('upload-progress');
  const statusEl    = document.getElementById('upload-status');
  if (!dropzone || !inputEl) return;

  let selectedFiles = [];

  dropzone.addEventListener('click', () => inputEl.click());

  // Drag over
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files));
  });

  inputEl.addEventListener('change', () => handleFiles(Array.from(inputEl.files)));

  function handleFiles(files) {
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (valid.length < files.length) {
      window.showToast?.('Solo se permiten imágenes de hasta 10MB');
    }
    selectedFiles = valid;
    renderPreviews(valid);
    if (btnUpload) btnUpload.style.display = valid.length ? 'flex' : 'none';
  }

  function renderPreviews(files) {
    if (!previewEl) return;
    previewEl.innerHTML = '';
    files.forEach(f => {
      const img = document.createElement('img');
      img.className = 'upload__thumb';
      img.src = URL.createObjectURL(f);
      img.alt = f.name;
      previewEl.appendChild(img);
    });
  }

  btnUpload?.addEventListener('click', async () => {
    if (!selectedFiles.length) return;
    btnUpload.disabled = true;
    btnUpload.textContent = 'Subiendo…';
    if (progressWrap) progressWrap.style.display = 'block';

    try {
      // Anonymous auth for upload
      if (!auth.currentUser) await signInAnonymously(auth);

      let uploaded = 0;
      for (const file of selectedFiles) {
        const storageRef  = ref(storage, `fotos-evento/${Date.now()}-${file.name}`);
        const uploadTask  = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snap) => {
              const pct = ((uploaded + snap.bytesTransferred / snap.totalBytes) / selectedFiles.length) * 100;
              if (progressBar) progressBar.style.width = `${pct}%`;
            },
            reject,
            () => { uploaded++; resolve(); }
          );
        });
      }

      if (statusEl) statusEl.textContent = `✅ ${selectedFiles.length} foto(s) subida(s) con éxito`;
      if (progressBar) progressBar.style.width = '100%';
      window.showToast?.('📸 Foto(s) subida(s) con éxito');
      selectedFiles = [];
      if (previewEl) previewEl.innerHTML = '';
    } catch (err) {
      console.error('Upload error:', err);
      window.showToast?.('Error al subir. Intenta de nuevo.');
      if (statusEl) statusEl.textContent = 'Error al subir. Intenta de nuevo.';
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = '⬆ Subir Foto';
    }
  });
}
