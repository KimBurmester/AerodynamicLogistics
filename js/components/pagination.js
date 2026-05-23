/* ==========================================================================
   ADL – Pagination-Hilfsfunktion
   Abhängigkeit: ADL.PREV_SVG, ADL.NEXT_SVG (templates/buttons.js)
   ========================================================================== */

window.ADL = window.ADL || {};

/* Gibt das fertige HTML für Seiten-Buttons zurück und bindet Click-Events.
   Optionen:
     page        – aktuelle Seite (1-basiert)
     totalPages  – Gesamtzahl der Seiten
     btnsEl      – Container-Element für die Buttons
     onPageChange – Callback mit neuer Seitenzahl */
ADL.buildPagination = function ({ page, totalPages, btnsEl, prevAttr, nextAttr, pageAttr, onPageChange }) {
  if (!btnsEl) return;

  let pageNums;
  if (totalPages <= 7) {
    pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const seen = new Set(
      [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]
        .filter(p => p >= 1 && p <= totalPages)
    );
    pageNums = [...seen].sort((a, b) => a - b);
  }

  let html = `<button class="btn btn-sm" ${prevAttr} ${page === 1 ? 'disabled' : ''}>${ADL.PREV_SVG}</button>`;
  let prev = null;
  for (const p of pageNums) {
    if (prev !== null && p - prev > 1) html += `<span class="pagination-ellipsis">…</span>`;
    html += `<button class="btn btn-sm${p === page ? ' btn-primary' : ''}" ${pageAttr}="${p}">${p}</button>`;
    prev = p;
  }
  html += `<button class="btn btn-sm" ${nextAttr} ${page === totalPages ? 'disabled' : ''}>${ADL.NEXT_SVG}</button>`;
  btnsEl.innerHTML = html;

  btnsEl.querySelectorAll(`[${pageAttr}]`).forEach(btn =>
    btn.addEventListener('click', () => onPageChange(+btn.getAttribute(pageAttr)))
  );
  btnsEl.querySelector(`[${prevAttr}]`)?.addEventListener('click', () => onPageChange(page - 1));
  btnsEl.querySelector(`[${nextAttr}]`)?.addEventListener('click', () => onPageChange(page + 1));
};
