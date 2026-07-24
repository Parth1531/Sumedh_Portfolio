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

  async function getStoredUploads() {
    try {
      const response = await fetch(`/api/gallery/${categoryKey}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data.items) ? data.items : [];
    } catch (error) {
      return [];
    }
  }

  async function saveStoredUploads(items) {
    try {
      await fetch(`/api/gallery/${categoryKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
    } catch (error) {
      console.warn('Unable to save uploads to the server:', error);
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read the selected image.'));
      reader.readAsDataURL(file);
    });
  }

  let uploadedItems = [];
  let selectionMode = false;
  const selectedIds = new Set();

  function updateToolbarSelectionState() {
    const delBtn = document.getElementById(`delete-selected-${categoryKey}`);
    const countBadge = document.getElementById(`selected-count-${categoryKey}`);
    if (delBtn) delBtn.disabled = selectedIds.size === 0;
    if (countBadge) countBadge.textContent = selectedIds.size ? String(selectedIds.size) : '';
  }

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

    // Select toggle and delete-selected button
    const selectToggle = document.createElement('button');
    selectToggle.className = 'select-toggle-btn';
    selectToggle.id = `select-toggle-${categoryKey}`;
    selectToggle.type = 'button';
    selectToggle.title = 'Toggle select mode';
    selectToggle.innerHTML = '<span>☑</span> Select';
    uploadControls.appendChild(selectToggle);

    const deleteSelectedBtn = document.createElement('button');
    deleteSelectedBtn.className = 'delete-selected-btn';
    deleteSelectedBtn.id = `delete-selected-${categoryKey}`;
    deleteSelectedBtn.type = 'button';
    deleteSelectedBtn.disabled = true;
    deleteSelectedBtn.title = 'Delete selected uploaded images';
    deleteSelectedBtn.innerHTML = '<span>🗑</span> Delete Selected <span class="selected-count" id="selected-count-' + categoryKey + '"></span>';
    uploadControls.appendChild(deleteSelectedBtn);

      // (Toolbar delete-all button removed — per-image delete remains)

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
            const dataUrl = await readFileAsDataUrl(file);
            nextUploads.push({
              name: file.name,
              dataUrl,
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
        await saveStoredUploads(uploadedItems);
        renderGallery();
        uploadInput.value = '';

        if (uploadHelp && addedCount) {
          uploadHelp.textContent = `${addedCount} image${addedCount > 1 ? 's' : ''} added to this gallery.`;
        }
      });

      // Select toggle handler
      selectToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        selectionMode = !selectionMode;
        selectToggle.classList.toggle('active', selectionMode);
        if (!selectionMode) {
          selectedIds.clear();
          // clear selected visuals
          grid.querySelectorAll('.art-card.selected').forEach(el => el.classList.remove('selected'));
        }
        // show/hide checkboxes on cards
        grid.classList.toggle('select-mode', selectionMode);
        updateToolbarSelectionState();
      });

      // Delete selected handler — removes only selected uploaded images
      deleteSelectedBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (selectedIds.size === 0) {
          alert('No images selected.');
          return;
        }
        const password = prompt('Enter password to delete selected images:');
        if (password === 'sumedh' || password === 'Sumedh') {
          const confirmDelete = confirm(`Delete ${selectedIds.size} selected image(s)? This cannot be undone.`);
          if (!confirmDelete) return;
          // Remove only selected uploaded items
          uploadedItems = uploadedItems.filter(u => {
            const id = u.dataUrl || u.objectUrl || u.name;
            if (selectedIds.has(id)) {
              return false;
            }
            return true;
          });
          await saveStoredUploads(uploadedItems);
          selectedIds.clear();
          selectionMode = false;
          selectToggle.classList.remove('active');
          grid.classList.remove('select-mode');
          updateToolbarSelectionState();
          renderGallery();
        } else if (password !== null) {
          alert('Incorrect password. Deletion cancelled.');
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
      const src = item.dataUrl || item.objectUrl || (folder + item.file);
      const caption = item.caption || item.name || '';

      const card = document.createElement('div');
      card.className = 'art-card reveal';

      // id for selection / identifying uploaded items
      const itemId = item.dataUrl || item.objectUrl || item.name || (folder + item.file);
      card.dataset.uploadId = itemId;

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

      // If this item is an uploaded image (has an objectUrl), add selection UI and a delete button
      if (item.dataUrl || item.objectUrl) {
        const sel = document.createElement('input');
        sel.type = 'checkbox';
        sel.className = 'select-checkbox';
        sel.addEventListener('click', (e) => {
          e.stopPropagation();
          if (sel.checked) selectedIds.add(itemId); else selectedIds.delete(itemId);
          card.classList.toggle('selected', sel.checked);
          updateToolbarSelectionState();
        });
        // hide checkbox unless selectionMode enabled
        if (!selectionMode) sel.style.display = 'none';
        card.appendChild(sel);

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.type = 'button';
        del.title = 'Delete image';
        del.textContent = '✕';

        del.addEventListener('click', async (e) => {
          e.stopPropagation();
          const password = prompt('Enter password to delete this image:');
          if (password === 'sumedh' || password === 'Sumedh') {
            // Remove this uploaded item from storage
            uploadedItems = uploadedItems.filter(u => {
              const sameDataUrl = u.dataUrl && item.dataUrl && u.dataUrl === item.dataUrl;
              const sameObjectUrl = u.objectUrl && item.objectUrl && u.objectUrl === item.objectUrl;
              const sameName = u.name && item.name && u.name === item.name;
              return !sameDataUrl && !sameObjectUrl && !sameName;
            });
            await saveStoredUploads(uploadedItems);
            renderGallery();
          } else if (password !== null) {
            alert('Incorrect password. Deletion cancelled.');
          }
        });

        card.appendChild(del);
      }

      card.addEventListener('click', () => {
        if (selectionMode) {
          const checkbox = card.querySelector('.select-checkbox');
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            if (checkbox.checked) selectedIds.add(itemId); else selectedIds.delete(itemId);
            card.classList.toggle('selected', checkbox.checked);
            updateToolbarSelectionState();
          }
          return;
        }
        openLightbox(src, caption);
      });
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
