/* ==========================================================================
   ADL – Button- & Icon-Templates
   Abhängigkeit: ADL.escHtml (utils/dom.js)
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.EDIT_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
ADL.DELETE_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
ADL.PREV_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
ADL.NEXT_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

ADL.editBtn = function (page, id) {
  const idAttr = id ? ` data-edit-id="${ADL.escHtml(String(id))}"` : '';
  return `<button class="btn btn-sm btn-ghost" data-navigate="${ADL.escHtml(page)}"${idAttr}>${ADL.EDIT_SVG}</button>`;
};

ADL.deleteBtn = function (store, id, label) {
  return `<button class="btn btn-sm btn-ghost" style="color:var(--danger-text)"
    data-delete-id="${ADL.escHtml(String(id))}"
    data-delete-store="${ADL.escHtml(store)}"
    data-delete-label="${ADL.escHtml(String(label))}">${ADL.DELETE_SVG}</button>`;
};

ADL.emptyRow = function (colspan, text = 'Keine Einträge vorhanden') {
  return `<tr><td colspan="${colspan}" style="text-align:center;padding:24px;color:var(--text-tertiary)">${ADL.escHtml(text)}</td></tr>`;
};
