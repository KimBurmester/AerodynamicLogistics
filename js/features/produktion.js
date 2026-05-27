/* ==========================================================================
   ADL – Produktion-Feature
   Zuständig für: Produktionsauftrag, Zuweisung, Stückliste, Prüfbericht
   ========================================================================== */

window.ADL = window.ADL || {};

const PRD_PRO_SEITE = 10;

/* ---- tempPositionen für Stueckliste ------------------------------------- */

ADL._tempStueckliste = ADL._tempStueckliste || [];

/* ---- Formular aus Datensatz befüllen ------------------------------------ */

ADL.fillProduktionsauftragForm = function (mc, r) {
  const setVal = (id, v) => { const el = mc.querySelector('#' + id); if (el) el.value = v ?? ''; };
  const setSel = (id, v) => {
    const el = mc.querySelector('#' + id);
    if (!el || v == null) return;
    const opt = [...el.options].find(o => o.text === v || o.value === v);
    if (opt) el.value = opt.value;
  };
  setVal('prd-auftragsnr',   r.nr);
  setVal('produktname',      r.bezeichnung);
  setVal('artikelnummer',    r.artikelnr);
  setVal('produktionsmenge', String(r.menge || '').replace(/\s*Stück/i, '').trim());
  setSel('produktionslinie', r.linie);
  setVal('prd-start',        r.start);
  setVal('prd-ende',         r.ende);
  setSel('prd-status',       r.status);
  setVal('seriennummer',     r.seriennr);
  setVal('chargennummer',    r.charge);
  setVal('version',          r.version);
  setVal('bom',              r.bom);
  setVal('spezifikationen',  r.spezifikation);
  setVal('zertifizierung',   r.zertifizierung);
  setVal('qualitaet',        r.qualitaet);
  setVal('sicherheit',       r.sicherheit);
  setVal('maschine',         r.maschine);
  setVal('werkzeuge',        r.werkzeuge);
  setSel('schicht',          r.schicht);
  setVal('ressourcenbedarf', r.ressourcenbedarf);
  setVal('pruefschritte',    r.pruefschritte);
};

function readProduktionsauftragData(mc) {
  const get = id => (mc.querySelector('#' + id)?.value ?? '').trim();
  const sel = id => mc.querySelector('#' + id)?.value ?? '';
  return {
    bezeichnung:      get('produktname'),
    artikelnr:        get('artikelnummer'),
    menge:            get('produktionsmenge') ? get('produktionsmenge') + ' Stück' : '',
    linie:            sel('produktionslinie'),
    start:            get('prd-start'),
    ende:             get('prd-ende'),
    status:           sel('prd-status') || 'Planung',
    seriennr:         get('seriennummer'),
    charge:           get('chargennummer'),
    version:          get('version'),
    bom:              get('bom'),
    spezifikation:    get('spezifikationen'),
    zertifizierung:   get('zertifizierung'),
    qualitaet:        get('qualitaet'),
    sicherheit:       get('sicherheit'),
    maschine:         get('maschine'),
    werkzeuge:        get('werkzeuge'),
    schicht:          sel('schicht'),
    ressourcenbedarf: get('ressourcenbedarf'),
    pruefschritte:    get('pruefschritte'),
  };
}

/* ---- Seiten-Formular: Produktionsauftrag -------------------------------- */

document.addEventListener('adl:edit-navigate', ({ detail: { editId } }) => {
  const mc = document.querySelector('.main-content');
  if (!mc || mc.querySelector('#produktname') === null) return;
  const r = ADLStore.produktionsauftraege.getById(editId);
  if (!r) return;
  mc.dataset.prdEditId = editId;
  ADL.fillProduktionsauftragForm(mc, r);
});

document.addEventListener('click', e => {
  const btn = e.target.closest('.form-actions .btn-primary');
  if (!btn) return;
  const mc = document.querySelector('.main-content');
  if (!mc || mc.querySelector('#produktname') === null) return;

  const daten = readProduktionsauftragData(mc);
  if (!daten.bezeichnung) { ADL.toast('Bitte Produktname angeben.', 'danger'); return; }

  const editId = mc.dataset.prdEditId;
  if (editId) {
    ADLStore.produktionsauftraege.update(editId, daten);
    delete mc.dataset.prdEditId;
    ADL.toast(`Produktionsauftrag „${daten.bezeichnung}" aktualisiert.`);
  } else {
    ADLStore.produktionsauftraege.add({
      nr: (mc.querySelector('#prd-auftragsnr')?.value ?? '').trim() || ADLStore.produktionsauftraege.nextNr('PRD', 'nr'),
      ...daten,
    });
    ADL.toast(`Produktionsauftrag „${daten.bezeichnung}" gespeichert.`);
  }

  mc.querySelectorAll('input:not([readonly]), textarea').forEach(el => (el.value = ''));
  mc.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
  const nrEl = mc.querySelector('#prd-auftragsnr');
  if (nrEl) nrEl.value = ADLStore.produktionsauftraege.nextNr('PRD', 'nr');
});

/* ---- Seite: Formular initialisieren + Reset-Button --------------------- */

ADL.renderProduktionForm = function (root) {
  const nrEl = root.querySelector('#prd-auftragsnr');
  if (nrEl && !nrEl.value) nrEl.value = ADLStore.produktionsauftraege.nextNr('PRD', 'nr');

  const resetBtn = root.querySelector('#prd-reset');
  if (resetBtn && !resetBtn._prdBound) {
    resetBtn._prdBound = true;
    resetBtn.addEventListener('click', () => {
      root.querySelectorAll('input:not([readonly]), textarea').forEach(el => (el.value = ''));
      root.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
      const nr2 = root.querySelector('#prd-auftragsnr');
      if (nr2) nr2.value = ADLStore.produktionsauftraege.nextNr('PRD', 'nr');
      delete root.dataset.prdEditId;
    });
  }
};

/* ---- KPIs aktualisieren ------------------------------------------------- */

function updatePrdKpis(alle, root) {
  const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-prd-gesamt',        alle.length);
  set('kpi-prd-laufend',       alle.filter(r => r.status === 'Laufend').length);
  set('kpi-prd-abgeschlossen', alle.filter(r => r.status === 'Abgeschlossen').length);
  set('kpi-prd-verzoegert',    alle.filter(r => r.status === 'Verzögert').length);
}

/* ---- Tabellen-Renderer: Produktionsdatenbank ---------------------------- */

ADL.renderProduktionsdatenbank = function (root, page = 1) {
  const tbody = root.querySelector('.data-table tbody');
  if (!tbody) return;

  const alle = ADLStore.produktionsauftraege.getAll();
  updatePrdKpis(alle, root);

  const suchEl   = root.querySelector('#prd-search');
  const linieEl  = root.querySelector('#prd-filter-linie');
  const statusEl = root.querySelector('#prd-filter-status');
  const suchText = (suchEl?.value ?? '').toLowerCase();
  const linie    = linieEl?.value ?? '';
  const status   = statusEl?.value ?? '';

  let zeilen = alle;
  if (suchText) zeilen = zeilen.filter(r =>
    (r.nr || '').toLowerCase().includes(suchText) ||
    (r.bezeichnung || '').toLowerCase().includes(suchText) ||
    (r.artikelnr || '').toLowerCase().includes(suchText)
  );
  if (linie)  zeilen = zeilen.filter(r => r.linie === linie);
  if (status) zeilen = zeilen.filter(r => r.status === status);

  const gesamt      = zeilen.length;
  const seitenAnzahl = Math.max(1, Math.ceil(gesamt / PRD_PRO_SEITE));
  page = Math.min(Math.max(1, page), seitenAnzahl);
  const seitenSlice = zeilen.slice((page - 1) * PRD_PRO_SEITE, page * PRD_PRO_SEITE);

  tbody.innerHTML = seitenSlice.length
    ? seitenSlice.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr || '—')}</td>
        <td>${ADL.escHtml(r.bezeichnung || '—')}</td>
        <td class="td-mono">${ADL.escHtml(r.artikelnr || '—')}</td>
        <td>${ADL.escHtml(r.menge || '—')}</td>
        <td>${ADL.escHtml(r.linie || '—')}</td>
        <td class="td-mono">${ADL.formatDate(r.start)}</td>
        <td class="td-mono">${ADL.formatDate(r.ende)}</td>
        <td>${ADL.badge(r.status || 'Planung')}</td>
        <td style="white-space:nowrap">
          ${ADL.editBtn('sites/Produktion.html', r.id)}
          ${ADL.deleteBtn('produktionsauftraege', r.id, r.nr || r.bezeichnung)}
        </td>
      </tr>`).join('')
    : ADL.emptyRow(9, 'Keine Produktionsaufträge gefunden');

  const infoEl = root.querySelector('.pagination-info');
  if (infoEl) {
    infoEl.textContent = gesamt === 0
      ? 'Keine Aufträge'
      : `Zeigt ${(page - 1) * PRD_PRO_SEITE + 1}–${Math.min(page * PRD_PRO_SEITE, gesamt)} von ${gesamt} Aufträgen`;
  }

  ADL.buildPagination({
    page,
    totalPages: seitenAnzahl,
    btnsEl:    root.querySelector('.pagination-buttons'),
    prevAttr:  'data-prd-prev',
    nextAttr:  'data-prd-next',
    pageAttr:  'data-prd-pg',
    onPageChange: p => ADL.renderProduktionsdatenbank(root, p),
  });

  if (!root.dataset.prdSearchBound) {
    root.dataset.prdSearchBound = '1';
    suchEl?.addEventListener('input',  () => ADL.renderProduktionsdatenbank(root, 1));
    linieEl?.addEventListener('change', () => ADL.renderProduktionsdatenbank(root, 1));
    statusEl?.addEventListener('change', () => ADL.renderProduktionsdatenbank(root, 1));
  }
};

/* ---- Modal-Saves -------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  /* Neue Zuweisung (Produktionsplan) */
  document.getElementById('modalNeueZuweisungSave')?.addEventListener('click', () => {
    const produkt = ADL.getInputValue('mz-produkt') || ADL.getInputValue('mz-auftrag');
    if (!produkt) { ADL.toast('Bitte Auftrag / Produkt angeben.', 'danger'); return; }
    ADLStore.zuweisungen.add({
      nr:          ADLStore.zuweisungen.nextNr('ZUW'),
      auftrag:     ADL.getInputValue('mz-auftrag'),
      produkt,
      halle:       ADL.getInputValue('mz-halle'),
      linie:       ADL.getInputValue('mz-linie'),
      takt:        ADL.getInputValue('mz-takt'),
      mitarbeiter: ADL.getInputValue('mz-mitarbeiter'),
      schritt:     ADL.getInputValue('mz-schritt'),
      maschine:    ADL.getInputValue('mz-maschine'),
      start:       ADL.getInputValue('mz-start'),
      ende:        ADL.getInputValue('mz-ende'),
      status:      'Geplant',
    });
    ADL.toast(`Zuweisung für „${produkt}" gespeichert.`);
  });

  /* Neue Stückliste */
  document.getElementById('modalNeueStuecklisteSave')?.addEventListener('click', () => {
    const bezeichnung = ADL.getInputValue('ms-produktname') || ADL.getInputValue('ms-bomNummer');
    if (!bezeichnung) { ADL.toast('Bitte Produktname angeben.', 'danger'); return; }
    ADLStore.stuecklisten.add({
      nr:           ADLStore.stuecklisten.nextNr('STL'),
      bomNummer:    ADL.getInputValue('ms-bomNummer'),
      produktname:  ADL.getInputValue('ms-produktname'),
      artikelnummer:ADL.getInputValue('ms-artikelnummer'),
      version:      ADL.getInputValue('ms-version'),
      status:       ADL.getInputValue('ms-status'),
      gueltigAb:    ADL.getInputValue('ms-gueltigAb'),
      gueltigBis:   ADL.getInputValue('ms-gueltigBis'),
      ersteller:    ADL.getInputValue('ms-ersteller'),
      positionen:   [...ADL._tempStueckliste],
    });
    ADL._tempStueckliste = [];
    ADL.toast(`Stückliste „${bezeichnung}" gespeichert.`);
  });

  /* Stückliste: Position hinzufügen */
  document.getElementById('modalPositionSave')?.addEventListener('click', () => {
    const bezeichnung = ADL.getInputValue('mp-bezeichnung');
    if (!bezeichnung) { ADL.toast('Bitte Bezeichnung angeben.', 'danger'); return; }
    ADL._tempStueckliste.push({
      pos:          ADL._tempStueckliste.length + 1,
      artikelnummer:ADL.getInputValue('mp-artikelnummer'),
      bezeichnung,
      menge:        ADL.getInputValue('mp-menge'),
      einheit:      ADL.getInputValue('mp-einheit'),
      ebene:        ADL.getInputValue('mp-ebene'),
      lagerort:     ADL.getInputValue('mp-lagerort'),
      kommentar:    ADL.getInputValue('mp-kommentar'),
    });
    ADL.toast(`Position „${bezeichnung}" hinzugefügt.`);
  });

});
