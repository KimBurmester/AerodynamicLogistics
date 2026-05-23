/* ==========================================================================
   ADL – Formatierungsfunktionen
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.formatDate = function (iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

ADL.formatDateTime = function (iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

ADL.formatEuro = function (n) {
  if (n == null || n === '') return '—';
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
