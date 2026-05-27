/* ==========================================================================
   ADL – Qualitätssicherung-Feature
   Zuständig für: Prüfbericht speichern, Bearbeiten, Tabellen-Renderer
   ========================================================================== */

window.ADL = window.ADL || {};

const QS_PRO_SEITE = 10;

/* ---- Modal-Save: top-level registriert (läuft vor createModalController) */

document.getElementById('modalNeuerPruefberichtSave')?.addEventListener('click', () => {
  const overlay = document.getElementById('modalNeuerPruefbericht');
  const artikel = ADL.getInputValue('qm-artikel');
  if (!artikel) { ADL.toast('Bitte Artikel angeben.', 'danger'); return; }

  const daten = {
    artikel,
    artikelnr:          ADL.getInputValue('qm-artikelnr'),
    seriennr:           ADL.getInputValue('qm-seriennr'),
    auftrag:            ADL.getInputValue('qm-auftrag'),
    datum:              ADL.getInputValue('qm-datum'),
    pruefer:            ADL.getInputValue('qm-pruefer'),
    pruefart:           ADL.getInputValue('qm-pruefart'),
    pruefmittel:        ADL.getInputValue('qm-pruefmittel'),
    pruefmittelnr:      ADL.getInputValue('qm-pruefmittelnr'),
    kalibrierung:       ADL.getInputValue('qm-kalibrierung'),
    ergebnis:           ADL.getInputValue('qm-ergebnis'),
    fehlerklasse:       ADL.getInputValue('qm-fehlerklasse'),
    abweichung:         ADL.getInputValue('qm-abweichung'),
    fehlerbeschreibung: ADL.getInputValue('qm-fehlerbeschreibung'),
    massnahme:          ADL.getInputValue('qm-massnahme'),
    verantwortlicher:   ADL.getInputValue('qm-verantwortlicher'),
    faelligkeit:        ADL.getInputValue('qm-faelligkeit'),
    referenz:           ADL.getInputValue('qm-referenz'),
    bemerkungen:        ADL.getInputValue('qm-bemerkungen'),
  };

  const editId = overlay?.dataset.qsEditId;
  if (editId) {
    ADLStore.qualitaetspruefungen.update(editId, daten);
    delete overlay.dataset.qsEditId;
    ADL.toast(`Prüfbericht für „${artikel}" aktualisiert.`);
  } else {
    ADLStore.qualitaetspruefungen.add({
      nr: ADLStore.qualitaetspruefungen.nextNr('QS'),
      ...daten,
    });
    ADL.toast(`Prüfbericht für „${artikel}" gespeichert.`);
  }

  queueMicrotask(() => {
    const mc = document.querySelector('.main-content');
    if (mc) ADL.tryRender(mc);
  });
});

/* ---- Edit-Klick: Modal befüllen oder für Neueintrag zurücksetzen -------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action="neuer-pruefbericht"]');
  if (!btn) return;
  const overlay = document.getElementById('modalNeuerPruefbericht');
  if (!overlay) return;

  const titleEl = document.getElementById('modalNeuerPruefberichtTitle');
  const editId  = btn.getAttribute('data-edit-id');

  if (editId) {
    const r = ADLStore.qualitaetspruefungen.getById(editId);
    if (!r) return;
    overlay.dataset.qsEditId = editId;
    if (titleEl) titleEl.textContent = 'Prüfbericht bearbeiten';
    ADL.fillPruefberichtForm(overlay, r);
  } else {
    delete overlay.dataset.qsEditId;
    if (titleEl) titleEl.textContent = 'Neuer Prüfbericht';
    ADL.resetFields(overlay);
  }
});

/* ---- Formular aus Datensatz befüllen ------------------------------------ */

ADL.fillPruefberichtForm = function (overlay, r) {
  const setVal = (id, v) => { const el = overlay.querySelector('#' + id); if (el) el.value = v ?? ''; };
  const setSel = (id, v) => {
    const el = overlay.querySelector('#' + id);
    if (!el || v == null) return;
    const opt = [...el.options].find(o => o.text === v || o.value === v);
    if (opt) el.value = opt.value;
  };
  setVal('qm-artikel',            r.artikel);
  setVal('qm-artikelnr',          r.artikelnr);
  setVal('qm-seriennr',           r.seriennr);
  setSel('qm-auftrag',            r.auftrag);
  setVal('qm-datum',              r.datum);
  setSel('qm-pruefer',            r.pruefer);
  setSel('qm-pruefart',           r.pruefart);
  setVal('qm-pruefmittel',        r.pruefmittel);
  setVal('qm-pruefmittelnr',      r.pruefmittelnr);
  setVal('qm-kalibrierung',       r.kalibrierung);
  setSel('qm-ergebnis',           r.ergebnis);
  setSel('qm-fehlerklasse',       r.fehlerklasse);
  setVal('qm-abweichung',         r.abweichung);
  setVal('qm-fehlerbeschreibung', r.fehlerbeschreibung);
  setSel('qm-massnahme',          r.massnahme);
  setVal('qm-verantwortlicher',   r.verantwortlicher);
  setVal('qm-faelligkeit',        r.faelligkeit);
  setVal('qm-referenz',           r.referenz);
  setVal('qm-bemerkungen',        r.bemerkungen);
};

/* ---- Tabellen-Renderer: Qualitätssicherung ------------------------------ */

ADL.renderQualitaetssicherung = function (root, page = 1) {
  const tbody = root.querySelector('.data-table tbody');
  if (!tbody) return;

  const alle = ADLStore.qualitaetspruefungen.getAll();
  updateQsKpis(alle, root);

  const suchEl     = root.querySelector('#qs-search');
  const auftragEl  = root.querySelector('#qs-filter-auftrag');
  const pruefartEl = root.querySelector('#qs-filter-pruefart');
  const ergebnisEl = root.querySelector('#qs-filter-ergebnis');

  const suchText = (suchEl?.value ?? '').toLowerCase();
  const auftrag  = auftragEl?.value ?? '';
  const pruefart = pruefartEl?.value ?? '';
  const ergebnis = ergebnisEl?.value ?? '';

  let zeilen = alle;
  if (suchText) zeilen = zeilen.filter(r =>
    (r.nr || '').toLowerCase().includes(suchText) ||
    (r.artikel || '').toLowerCase().includes(suchText) ||
    (r.seriennr || '').toLowerCase().includes(suchText)
  );
  if (auftrag)  zeilen = zeilen.filter(r => r.auftrag === auftrag);
  if (pruefart) zeilen = zeilen.filter(r => r.pruefart === pruefart);
  if (ergebnis) zeilen = zeilen.filter(r => r.ergebnis === ergebnis);

  const gesamt       = zeilen.length;
  const seitenAnzahl = Math.max(1, Math.ceil(gesamt / QS_PRO_SEITE));
  page = Math.min(Math.max(1, page), seitenAnzahl);
  const seitenSlice  = zeilen.slice((page - 1) * QS_PRO_SEITE, page * QS_PRO_SEITE);

  tbody.innerHTML = seitenSlice.length
    ? seitenSlice.map(buildQsZeile).join('')
    : ADL.emptyRow(9, 'Keine Prüfberichte vorhanden');

  const infoEl = root.querySelector('.pagination-info');
  if (infoEl) {
    infoEl.textContent = gesamt === 0
      ? 'Keine Prüfberichte'
      : `Zeigt ${(page - 1) * QS_PRO_SEITE + 1}–${Math.min(page * QS_PRO_SEITE, gesamt)} von ${gesamt} ${gesamt === 1 ? 'Prüfbericht' : 'Prüfberichten'}`;
  }

  ADL.buildPagination({
    page,
    totalPages:   seitenAnzahl,
    btnsEl:       root.querySelector('.pagination-buttons'),
    prevAttr:     'data-qs-prev',
    nextAttr:     'data-qs-next',
    pageAttr:     'data-qs-pg',
    onPageChange: p => ADL.renderQualitaetssicherung(root, p),
  });

  if (!root.dataset.qsSearchBound) {
    root.dataset.qsSearchBound = '1';
    suchEl?.addEventListener('input',     () => ADL.renderQualitaetssicherung(root, 1));
    auftragEl?.addEventListener('change',  () => ADL.renderQualitaetssicherung(root, 1));
    pruefartEl?.addEventListener('change', () => ADL.renderQualitaetssicherung(root, 1));
    ergebnisEl?.addEventListener('change', () => ADL.renderQualitaetssicherung(root, 1));
  }
};

function buildQsZeile(r) {
  return `<tr>
    <td class="td-mono">${ADL.escHtml(r.nr || '—')}</td>
    <td>${ADL.escHtml(r.artikel || '—')}</td>
    <td class="td-mono">${ADL.escHtml(r.seriennr || '—')}</td>
    <td>${ADL.escHtml(r.pruefart || '—')}</td>
    <td class="td-mono">${ADL.formatDate(r.datum)}</td>
    <td>${ADL.escHtml(r.pruefer || '—')}</td>
    <td>${ADL.badge(r.ergebnis || '—')}</td>
    <td>${ADL.escHtml(r.massnahme || '–')}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-sm btn-ghost" data-action="neuer-pruefbericht" data-edit-id="${ADL.escHtml(String(r.id))}">${ADL.EDIT_SVG}</button>
      ${ADL.deleteBtn('qualitaetspruefungen', r.id, r.nr || r.artikel)}
    </td>
  </tr>`;
}

function updateQsKpis(alle, root) {
  const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-qs-gesamt',     alle.length);
  set('kpi-qs-bestanden',  alle.filter(r => (r.ergebnis || '').startsWith('i.O')).length);
  set('kpi-qs-nacharbeit', alle.filter(r => (r.ergebnis || '').includes('Nacharbeit')).length);
  set('kpi-qs-niO',        alle.filter(r => (r.ergebnis || '').startsWith('n.i.O')).length);
}
