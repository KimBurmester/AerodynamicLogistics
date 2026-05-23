/* ==========================================================================
   ADL – Lieferant-Feature
   Zuständig für: Lieferant speichern, Tabellen-Renderer
   ========================================================================== */

window.ADL = window.ADL || {};

/* ---- Modal-Save --------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalNeuerLieferantSave')?.addEventListener('click', () => {
    const name = ADL.getInputValue('lf-firmenname');
    if (!name) { ADL.toast('Bitte Firmennamen angeben.', 'danger'); return; }
    ADLStore.lieferanten.add({
      nr:                 ADL.getInputValue('lf-lieferantennr') || ADLStore.lieferanten.nextNr('LFR'),
      name,
      warengruppe:        ADL.getInputValue('lf-warengruppe'),
      status:             ADL.getInputValue('lf-status'),
      kontaktperson:      ADL.getInputValue('lf-kontaktperson'),
      email:              ADL.getInputValue('lf-email'),
      telefon:            ADL.getInputValue('lf-telefon'),
      website:            ADL.getInputValue('lf-website'),
      strasse:            ADL.getInputValue('lf-strasse'),
      plz:                ADL.getInputValue('lf-plz'),
      ort:                ADL.getInputValue('lf-ort'),
      land:               ADL.getInputValue('lf-land'),
      zahlungsziel:       ADL.getInputValue('lf-zahlungsziel'),
      skonto:             ADL.getInputValue('lf-skonto'),
      waehrung:           ADL.getInputValue('lf-waehrung'),
      mindestbestellwert: ADL.getInputValue('lf-mindestbestellwert'),
    });
    ADL.toast(`Lieferant „${name}" gespeichert.`);
  });
});

/* ---- Tabellen-Renderer: Lieferantenübersicht ---------------------------- */

ADL.renderLieferanten = function (tbody) {
  const lieferanten = ADLStore.lieferanten.getAll();
  tbody.innerHTML = lieferanten.length
    ? lieferanten.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr)}</td>
        <td>${ADL.escHtml(r.name)}</td>
        <td>${ADL.escHtml(r.warengruppe)}</td>
        <td>${ADL.escHtml(r.kontaktperson || '—')}</td>
        <td class="td-mono">${ADL.escHtml(r.telefon || '—')}</td>
        <td>${ADL.badge(r.bewertung || 'Gut')}</td>
        <td>${ADL.badge(r.status || 'Aktiv')}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-sm btn-ghost" data-action="neuer-lieferant">${ADL.EDIT_SVG}</button>
          ${ADL.deleteBtn('lieferanten', r.id, r.name)}
        </td>
      </tr>`).join('')
    : ADL.emptyRow(8, 'Keine Lieferanten gespeichert');
};
