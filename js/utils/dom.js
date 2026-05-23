/* ==========================================================================
   ADL – DOM-Hilfsfunktionen
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.getInputValue  = id => (document.getElementById(id)?.value ?? '').trim();
ADL.getSelectValue = id => {
  const el = document.getElementById(id);
  return el ? (el.options[el.selectedIndex]?.value ?? el.value ?? '') : '';
};
ADL.escHtml = s => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

ADL.getById         = id  => document.getElementById(id);
ADL.getMainContent  = ()  => document.querySelector('.main-content');
ADL.queryInContent  = sel => document.querySelector('.main-content')?.querySelector(sel);
ADL.getContextValue = (root, id) => (root.querySelector('#' + id)?.value ?? '').trim();
ADL.getContextSelect = (root, id) => root.querySelector('#' + id)?.value ?? '';

ADL.resetFields = container => {
  container.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
  container.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
};
