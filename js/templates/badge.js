/* ==========================================================================
   ADL – Badge-Template
   Abhängigkeit: ADL.STATUS_COLORS (config/statusColors.js), ADL.escHtml (utils/dom.js)
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.badge = function (status) {
  const colorClass = ADL.STATUS_COLORS[status] || 'info';
  return `<span class="badge badge-${colorClass}"><span class="dot"></span>${ADL.escHtml(status)}</span>`;
};
