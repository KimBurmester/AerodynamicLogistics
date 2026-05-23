/* ==========================================================================
   ADL – Wareneingang-Feature
   Zuständig für: Wareneingang erfassen, Tabellen-Renderer
   ========================================================================== */

window.ADL = window.ADL || {};

/* ---- Modal-Save --------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalWareneingangSave')?.addEventListener('click', () => {
    const artikel = ADL.getInputValue('we-artikel');
    if (!artikel) { ADL.toast('Bitte Artikel angeben.', 'danger'); return; }
    ADLStore.wareneingaenge.add({
      nr:             ADLStore.wareneingaenge.nextNr('WE'),
      bestellnr:      ADL.getInputValue('we-bestellnr'),
      lieferant:      ADL.getInputValue('we-lieferant'),
      lieferschein:   ADL.getInputValue('we-lieferschein'),
      datum:          ADL.getInputValue('we-datum'),
      artikel,
      mengeBestellt:  ADL.getInputValue('we-menge-bestellt'),
      mengeGeliefert: ADL.getInputValue('we-menge-geliefert'),
      einheit:        ADL.getInputValue('we-einheit'),
      lagerort:       ADL.getInputValue('we-lagerort'),
      charge:         ADL.getInputValue('we-charge'),
      status:         ADL.getInputValue('we-pruefstatus') || 'In Prüfung',
      bemerkung:      ADL.getInputValue('we-bemerkung'),
    });
    ADL.toast(`Wareneingang für „${artikel}" erfasst.`);
  });
});

/* ---- Tabellen-Renderer: Wareneingänge ----------------------------------- */

ADL.renderWareneingaenge = function (tbody) {
  const wareneingaenge = ADLStore.wareneingaenge.getAll();
  tbody.innerHTML = wareneingaenge.length
    ? wareneingaenge.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr)}</td>
        <td class="td-mono">${ADL.escHtml(r.bestellnr || '—')}</td>
        <td>${ADL.escHtml(r.lieferant || '—')}</td>
        <td>${ADL.escHtml(r.artikel || '—')}</td>
        <td>${ADL.escHtml(String(r.mengeGeliefert || '—'))} ${ADL.escHtml(r.einheit || '')}</td>
        <td class="td-mono">${ADL.escHtml(r.lieferschein || '—')}</td>
        <td class="td-mono">${ADL.formatDate(r.datum)}</td>
        <td>${ADL.badge(r.status)}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-sm btn-ghost" data-action="wareneingang-erfassen">${ADL.EDIT_SVG}</button>
          ${ADL.deleteBtn('wareneingaenge', r.id, r.nr)}
        </td>
      </tr>`).join('')
    : ADL.emptyRow(9, 'Keine Wareneingänge gespeichert');
};
