/* ==========================================================================
   ADL – Universeller Modal-Controller
   Ersetzt 12 identische IIFE-Muster in script.js.

   Verwendung:
     ADL.createModalController('modalNeuerArtikel', {
       triggerAction: 'neuer-artikel',      // [data-action="..."] öffnet den Modal
       saveId:        'modalNeuerArtikelSave', // optional: Save-Button mit queueMicrotask
       onSave:        () => {},              // optional: Callback nach dem Speichern
     });
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.createModalController = function (modalId, options = {}) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;

  const { triggerAction, saveId, onSave } = options;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('input, select, textarea')?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetModal() {
    ADL.resetFields(overlay);
  }

  // Öffnen via data-action
  if (triggerAction) {
    document.addEventListener('click', e => {
      if (e.target.closest(`[data-action="${triggerAction}"]`)) openModal();
    });
  }

  // Schließen-Button (X)
  document.getElementById(modalId + 'Close')?.addEventListener('click', closeModal);

  // Abbrechen-Button
  document.getElementById(modalId + 'Cancel')?.addEventListener('click', () => {
    closeModal();
    resetModal();
  });

  // Speichern-Button
  const saveBtn = document.getElementById(saveId || modalId + 'Save');
  if (saveBtn) {
    if (onSave) {
      // forms.js liest Felder synchron – close/reset erst danach als Microtask
      saveBtn.addEventListener('click', () => {
        onSave();
        queueMicrotask(() => { closeModal(); resetModal(); });
      });
    } else {
      saveBtn.addEventListener('click', () => { closeModal(); resetModal(); });
    }
  }

  // Backdrop-Klick schließt Modal
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeModal(); resetModal(); }
  });

  // Escape schließt Modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
      resetModal();
    }
  });

  return { open: openModal, close: closeModal, reset: resetModal };
};
