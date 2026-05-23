/* ==========================================================================
   ADL – Toast-Benachrichtigungen
   ========================================================================== */

window.ADL = window.ADL || {};

(function () {
  const style = document.createElement('style');
  style.textContent = `@keyframes adl-slide-in{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`;
  document.head.appendChild(style);
})();

ADL.toast = function (msg, type = 'success') {
  let container = document.getElementById('adl-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adl-toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  const colorMap = {
    success: 'var(--success-text)',
    danger:  'var(--danger-text)',
    info:    'var(--info-text)',
  };

  const t = document.createElement('div');
  t.style.cssText = `
    background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;
    padding:10px 16px;font-size:13px;color:${colorMap[type] || colorMap.success};
    box-shadow:0 4px 16px rgba(0,0,0,.15);min-width:220px;max-width:340px;
    animation:adl-slide-in .2s ease;
  `;
  t.textContent = msg;
  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity    = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 300);
  }, 3000);
};
