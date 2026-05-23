/* ==========================================================================
   ADL – Bestellung-Feature
   Zuständig für: Bestellung speichern, Position hinzufügen, Tabellen-Renderer
   ========================================================================== */

window.ADL = window.ADL || {};

ADL._tempBestellung = ADL._tempBestellung || [];

/* ---- Modal-Saves -------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  /* Bestellposition hinzufügen */
  document.getElementById('modalBestellungPositionSave')?.addEventListener('click', () => {
    const bezeichnung = ADL.getInputValue('bp-bezeichnung');
    if (!bezeichnung) { ADL.toast('Bitte Bezeichnung angeben.', 'danger'); return; }
    const menge       = parseFloat(ADL.getInputValue('bp-menge')) || 0;
    const einzelpreis = parseFloat(ADL.getInputValue('bp-einzelpreis')) || 0;
    ADL._tempBestellung.push({
      pos:          ADL._tempBestellung.length + 1,
      artikelnummer:ADL.getInputValue('bp-artikelnummer'),
      bezeichnung,  menge,
      einheit:      ADL.getInputValue('bp-einheit'),
      einzelpreis,
      gesamtpreis:  menge * einzelpreis,
      lagerort:     ADL.getInputValue('bp-lagerort'),
      lieferdatum:  ADL.getInputValue('bp-lieferdatum'),
      bemerkung:    ADL.getInputValue('bp-bemerkung'),
    });
    ADL.toast(`Position „${bezeichnung}" hinzugefügt.`);
  });
});

/* ---- Seiten-Formular speichern ----------------------------------------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('.form-actions .btn-primary');
  if (!btn) return;
  const mc = document.querySelector('.main-content');
  if (!mc || mc.querySelector('#bestellnummer') === null) return;

  const get = id => (mc.querySelector('#' + id)?.value ?? '').trim();
  const lieferant = document.querySelector('#lieferant')?.value;
  if (!lieferant) { ADL.toast('Bitte Lieferant auswählen.', 'danger'); return; }

  const positionen = [...ADL._tempBestellung];
  const gesamtwert = positionen.reduce((s, p) => s + (p.gesamtpreis || 0), 0);

  ADLStore.bestellungen.add({
    nr:               get('bestellnummer') || ADLStore.bestellungen.nextNr('BST'),
    lieferant,
    bestelldatum:     document.getElementById('bestelldatum')?.value ?? '',
    lieferdatum:      document.getElementById('lieferdatum')?.value ?? '',
    prioritaet:       document.getElementById('prioritaet')?.value ?? '',
    status:           document.getElementById('status')?.value ?? '',
    kostenstelle:     document.getElementById('kostenstelle')?.value ?? '',
    ansprechpartner:  document.getElementById('ansprechpartner')?.value ?? '',
    lieferart:        document.getElementById('lieferart')?.value ?? '',
    versandart:       document.getElementById('versandart')?.value ?? '',
    zahlungsbedingung:document.getElementById('zahlungsbedingung')?.value ?? '',
    lieferadresse:    document.getElementById('lieferadresse')?.value ?? '',
    positionen,
    gesamtwert,
  });
  ADL._tempBestellung = [];
  ADL.toast('Bestellung gespeichert.');
});

/* ---- Tabellen-Renderer: Bestelldatenbank -------------------------------- */

ADL.renderBestelldatenbank = function (tbody) {
  const bestellungen = ADLStore.bestellungen.getAll();
  tbody.innerHTML = bestellungen.length
    ? bestellungen.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr)}</td>
        <td>${ADL.escHtml(r.lieferant)}</td>
        <td class="td-mono">${ADL.formatDate(r.bestelldatum)}</td>
        <td class="td-mono">${ADL.formatDate(r.lieferdatum)}</td>
        <td class="td-mono">${ADL.formatEuro(r.gesamtwert)}</td>
        <td>${r.positionen?.length || 0} Pos.</td>
        <td>${ADL.badge(r.status)}</td>
        <td style="white-space:nowrap">
          ${ADL.editBtn('sites/Bestellung.html')}
          ${ADL.deleteBtn('bestellungen', r.id, r.nr)}
        </td>
      </tr>`).join('')
    : ADL.emptyRow(8, 'Keine Bestellungen gespeichert');
};
