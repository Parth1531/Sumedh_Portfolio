// ===========================================================
// Sumedh Gaikwad — Portfolio
// Builds the artwork grid for a category page from the
// GALLERY_IMAGES list defined in that category's images.js
// file, and wires up the click-to-enlarge lightbox.
//
// Each category page sets, BEFORE this script runs:
//   window.GALLERY_FOLDER = "assets/portraits/";
//   window.GALLERY_IMAGES = [
//     { file: "artwork-01.jpg", caption: "Optional caption" },
//     ...
//   ];
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
  const grid   = document.getElementById('gallery-grid');
  const empty  = document.getElementById('gallery-empty');
  const count  = document.getElementById('gallery-count');
  const toolbar = document.querySelector('.gallery-toolbar');
  if (!grid) return;

  const folder = window.GALLERY_FOLDER || '';
  const baseImages = Array.isArray(window.GALLERY_IMAGES) ? window.GALLERY_IMAGES : [];
  const categoryKey = (folder || 'gallery').replace(/\/+$/, '').split('/').pop() || 'gallery';
  const storageKey = `portfolio-uploads-${categoryKey}`;

  function getStoredUploads() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveStoredUploads(items) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.warn('Unable to save uploads locally:', error);
    }
  }

  function readFileAsObjectUrl(file) {
    return new Promise((resolve, reject) => {
      if (!window.URL || typeof window.URL.createObjectURL !== 'function') {
        reject(new Error('This browser does not support local image preview.'));
        return;
      }
      try {
        resolve(window.URL.createObjectURL(file));
      } catch (error) {
        reject(error);
      }
    });
  }

  let uploadedItems = getStoredUploads();

  if (toolbar && count) {
    const uploadControls = document.createElement('div');
    uploadControls.className = 'upload-controls';
    uploadControls.innerHTML = `
      <button class="upload-button" id="upload-btn-${categoryKey}" type="button">
        <span>⬆</span> Upload
      </button>
      <input class="upload-input" id="upload-${categoryKey}" type="file" accept="image/*" multiple />
      <span class="upload-help">Add photos from this device</span>
    `;
    toolbar.insertBefore(uploadControls, count);

    const uploadBtn = uploadControls.querySelector(`#upload-btn-${categoryKey}`);
    const uploadInput = uploadControls.querySelector('.upload-input');
    const uploadHelp = uploadControls.querySelector('.upload-help');

    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener('click', () => {
        const password = prompt('Enter password to upload artwork:');
        if (password === 'sumedh' || password === 'Sumedh') {
          uploadInput.click();
        } else if (password !== null) {
          alert('Incorrect password. Upload access denied.');
        }
      });

      uploadInput.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const nextUploads = [...uploadedItems];
        let addedCount = 0;

        for (const file of files) {
          if (!file.type.startsWith('image/')) continue;
          try {
            const objectUrl = await readFileAsObjectUrl(file);
            nextUploads.push({
              name: file.name,
              objectUrl,
              caption: file.name.replace(/\.[^.]+$/, '')
            });
            addedCount += 1;
          } catch (error) {
            if (uploadHelp) {
              uploadHelp.textContent = 'Could not add one of the selected files.';
            }
          }
        }

        uploadedItems = nextUploads;
        saveStoredUploads(uploadedItems);
        renderGallery();
        uploadInput.value = '';

        if (uploadHelp && addedCount) {
          uploadHelp.textContent = `${addedCount} image${addedCount > 1 ? 's' : ''} added to this gallery.`;
        }
      });
    }
  }

  function renderGallery() {
    const items = [...baseImages, ...uploadedItems];

    if (count) {
      count.textContent = items.length === 1 ? '1 piece' : items.length + ' pieces';
    }

    if (!items.length) {
      if (empty) empty.style.display = 'block';
      grid.style.display = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';

    const frag = document.createDocumentFragment();

    items.forEach((item) => {
      const src = item.objectUrl || item.dataUrl || (folder + item.file);
      const caption = item.caption || item.name || '';

      const card = document.createElement('div');
      card.className = 'art-card reveal';

      const img = document.createElement('img');
      img.src = src;
      img.alt = caption || item.file || item.name;
      img.loading = 'lazy';
      card.appendChild(img);

      if (caption) {
        const cap = document.createElement('div');
        cap.className = 'caption';
        cap.textContent = caption;
        card.appendChild(cap);
      }

      card.addEventListener('click', () => openLightbox(src, caption));
      frag.appendChild(card);
    });

    grid.appendChild(frag);

    // Re-run reveal-on-scroll for the newly added cards
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    }
  }

  renderGallery();

  /* Lightbox */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  function openLightbox(src, caption) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
});
