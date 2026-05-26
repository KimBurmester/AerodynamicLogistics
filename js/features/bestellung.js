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

const BESTELLUNGEN_PRO_SEITE = 8;

ADL.renderBestelldatenbank = function (tbody, page = 1) {
  const alleBestellungen = ADLStore.bestellungen.getAll();
  const gesamt           = alleBestellungen.length;
  const seitenAnzahl     = Math.max(1, Math.ceil(gesamt / BESTELLUNGEN_PRO_SEITE));
  page = Math.min(Math.max(1, page), seitenAnzahl);
  const seitenSlice = alleBestellungen.slice((page - 1) * BESTELLUNGEN_PRO_SEITE, page * BESTELLUNGEN_PRO_SEITE);

  tbody.innerHTML = seitenSlice.length
    ? seitenSlice.map(buildBestellungZeile).join('')
    : ADL.emptyRow(8, 'Keine Bestellungen gespeichert');

  const root = tbody.closest('.container') || tbody.closest('section');
  updateBestellungKpis(alleBestellungen, root);
  updateBestellungPaginationInfo(root, page, gesamt);

  ADL.buildPagination({
    page,
    totalPages:   seitenAnzahl,
    btnsEl:       root?.querySelector('.pagination-buttons'),
    prevAttr:     'data-bst-prev',
    nextAttr:     'data-bst-next',
    pageAttr:     'data-bst',
    onPageChange: p => ADL.renderBestelldatenbank(tbody, p),
  });
};

function buildBestellungZeile(r) {
  return `<tr>
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
  </tr>`;
}

function updateBestellungKpis(alleBestellungen, root) {
  const offen         = alleBestellungen.filter(r => r.status === 'Offen').length;
  const inLieferung   = alleBestellungen.filter(r => r.status === 'In Lieferung').length;
  const abgeschlossen = alleBestellungen.filter(r => r.status === 'Abgeschlossen').length;
  const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-bst-gesamt',       alleBestellungen.length.toLocaleString('de-DE'));
  set('kpi-bst-offen',        offen.toLocaleString('de-DE'));
  set('kpi-bst-lieferung',    inLieferung.toLocaleString('de-DE'));
  set('kpi-bst-abgeschlossen', abgeschlossen.toLocaleString('de-DE'));
}

function updateBestellungPaginationInfo(root, page, gesamt) {
  const infoEl = root?.querySelector('.pagination-info');
  if (!infoEl) return;
  if (gesamt === 0) { infoEl.textContent = 'Keine Bestellungen'; return; }
  const from = (page - 1) * BESTELLUNGEN_PRO_SEITE + 1;
  const to   = Math.min(page * BESTELLUNGEN_PRO_SEITE, gesamt);
  infoEl.textContent = `Zeigt ${from}–${to} von ${gesamt} ${gesamt === 1 ? 'Bestellung' : 'Bestellungen'}`;
}
