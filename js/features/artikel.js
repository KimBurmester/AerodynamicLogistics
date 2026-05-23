/* ==========================================================================
   ADL – Artikel-Feature
   Zuständig für: Modal-Save, Seiten-Save, Tabellen-Renderer, Detail-Modal
   ========================================================================== */

window.ADL = window.ADL || {};

const ARTIKEL_PRO_SEITE = 8;

/* ---- Formular aus Datensatz befüllen ------------------------------------ */

ADL.fillArtikelForm = function (container, a) {
  const setVal = (id, v) => { const el = container.querySelector('#' + id); if (el) el.value = v ?? ''; };
  const setSel = (id, v) => {
    const el = container.querySelector('#' + id);
    if (!el || v == null) return;
    const opt = [...el.options].find(o => o.text === v || o.value === v);
    if (opt) el.value = opt.value;
  };
  setVal('artikelbezeichnung',  a.bezeichnung);
  setVal('artikelnummer',       a.artikelnummer);
  setSel('warengruppe',         a.warengruppe);
  setSel('artikelstatus',       a.status);
  setSel('einheit',             a.einheit);
  setVal('charge',              a.charge);
  setVal('seriennummer',        a.seriennr);
  setVal('maschinennummer',     a.maschinennr);
  setVal('bestand',             a.bestand);
  setVal('mindestbestand',      a.mindestbestand);
  setVal('meldebestand',        a.meldebestand);
  setSel('lagerort',            a.lagerort);
  setVal('laenge',              a.laenge);
  setVal('breite',              a.breite);
  setVal('hoehe',               a.hoehe);
  setVal('gewicht',             a.gewicht);
  setSel('verpackungseinheit',  a.verpackungseinheit);
  setVal('mengeProEinheit',     a.mengeProEinheit);
  setSel('lieferant',           a.lieferant);
  setVal('einkaufspreis',       a.einkaufspreis);
  setVal('mindestbestellmenge', a.mindestbestellmenge);
  setVal('verkaufspreis',       a.verkaufspreis);
  setSel('steuersatz',          a.steuersatz);
  setVal('zolltarifnummer',     a.zolltarifnummer);
  setSel('gefahrgut',           a.gefahrgut);
  setSel('herkunftsland',       a.herkunftsland);
  setVal('barcode',             a.barcode);
  setVal('beschreibung',        a.beschreibung);
};

/* ---- Formular-Daten auslesen -------------------------------------------- */

function readArtikelFormData(root) {
  const get = id => (root.querySelector('#' + id)?.value ?? '').trim();
  const sel = id => root.querySelector('#' + id)?.value ?? '';
  return {
    bezeichnung:        get('artikelbezeichnung'),
    artikelnummer:      get('artikelnummer'),
    warengruppe:        sel('warengruppe'),
    status:             sel('artikelstatus'),
    einheit:            sel('einheit'),
    charge:             get('charge'),
    seriennr:           get('seriennummer'),
    maschinennr:        get('maschinennummer'),
    bestand:            get('bestand'),
    mindestbestand:     get('mindestbestand'),
    meldebestand:       get('meldebestand'),
    lagerort:           get('lagerort'),
    laenge:             get('laenge'),
    breite:             get('breite'),
    hoehe:              get('hoehe'),
    gewicht:            get('gewicht'),
    verpackungseinheit: sel('verpackungseinheit'),
    mengeProEinheit:    get('mengeProEinheit'),
    lieferant:          sel('lieferant'),
    einkaufspreis:      get('einkaufspreis'),
    mindestbestellmenge:get('mindestbestellmenge'),
    verkaufspreis:      get('verkaufspreis'),
    steuersatz:         sel('steuersatz'),
    zolltarifnummer:    get('zolltarifnummer'),
    gefahrgut:          sel('gefahrgut'),
    herkunftsland:      sel('herkunftsland'),
    barcode:            get('barcode'),
    beschreibung:       get('beschreibung'),
  };
}

/* ---- KPIs aktualisieren ------------------------------------------------- */

function updateArtikelKpis(alleArtikel, root) {
  const aktiv       = alleArtikel.filter(r => (r.status || 'Aktiv') === 'Aktiv').length;
  const gesperrt    = alleArtikel.filter(r => r.status === 'Gesperrt').length;
  const unterbestand = alleArtikel.filter(r => {
    const b = parseFloat(r.bestand), m = parseFloat(r.mindestbestand);
    return !isNaN(b) && !isNaN(m) && m > 0 && b < m;
  }).length;
  const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-gesamt',       alleArtikel.length.toLocaleString('de-DE'));
  set('kpi-aktiv',        aktiv.toLocaleString('de-DE'));
  set('kpi-gesperrt',     gesperrt.toLocaleString('de-DE'));
  set('kpi-unterbestand', unterbestand.toLocaleString('de-DE'));
}

/* ---- Tabellen-Renderer: Artikeldatenbank -------------------------------- */

ADL.renderArtikeldatenbank = function (tbody, page = 1) {
  const alleArtikel = ADLStore.artikel.getAll();
  const gesamt      = alleArtikel.length;
  const seitenAnzahl = Math.max(1, Math.ceil(gesamt / ARTIKEL_PRO_SEITE));
  page = Math.min(Math.max(1, page), seitenAnzahl);
  const seitenSlice = alleArtikel.slice((page - 1) * ARTIKEL_PRO_SEITE, page * ARTIKEL_PRO_SEITE);

  tbody.innerHTML = seitenSlice.length
    ? seitenSlice.map(buildArtikelZeile).join('')
    : ADL.emptyRow(9, 'Keine Artikel gespeichert');

  const root = tbody.closest('.container') || tbody.closest('section');
  updateArtikelKpis(alleArtikel, root);
  updatePaginationInfo(root, page, gesamt, ARTIKEL_PRO_SEITE, 'Artikel', 'Artikeln');

  ADL.buildPagination({
    page,
    totalPages: seitenAnzahl,
    btnsEl:    root?.querySelector('.pagination-buttons'),
    prevAttr:  'data-pg-prev',
    nextAttr:  'data-pg-next',
    pageAttr:  'data-pg',
    onPageChange: p => ADL.renderArtikeldatenbank(tbody, p),
  });
};

function buildArtikelZeile(r) {
  return `<tr data-artikel-id="${ADL.escHtml(r.id)}" style="cursor:pointer">
    <td class="td-mono">${ADL.escHtml(r.artikelnummer || r.nr || '—')}</td>
    <td>${ADL.escHtml(r.bezeichnung || '—')}</td>
    <td>${ADL.escHtml(r.warengruppe || '—')}</td>
    <td>${ADL.escHtml(r.einheit || '—')}</td>
    <td>${ADL.escHtml(String(r.bestand !== '' ? r.bestand : '—'))}</td>
    <td>${ADL.escHtml(String(r.mindestbestand !== '' ? r.mindestbestand : '—'))}</td>
    <td>${ADL.escHtml(r.lagerort || '—')}</td>
    <td>${ADL.badge(r.status || 'Aktiv')}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-sm btn-ghost" data-navigate="sites/Artikel.html" data-edit-id="${ADL.escHtml(r.id)}">${ADL.EDIT_SVG}</button>
      ${ADL.deleteBtn('artikel', r.id, r.bezeichnung || r.nr)}
    </td>
  </tr>`;
}

/* ---- Tabellen-Renderer: Artikelbewegung --------------------------------- */

const BEWEGUNG_PRO_SEITE = 12;

ADL.renderArtikelbewegung = function (tbody, page = 1) {
  const alleBewegungen = ADLStore.bewegungen.getAll();
  const gesamt         = alleBewegungen.length;
  const seitenAnzahl   = Math.max(1, Math.ceil(gesamt / BEWEGUNG_PRO_SEITE));
  page = Math.min(Math.max(1, page), seitenAnzahl);
  const seitenSlice    = alleBewegungen.slice((page - 1) * BEWEGUNG_PRO_SEITE, page * BEWEGUNG_PRO_SEITE);

  const root = tbody.closest('.container') || tbody.closest('section');
  updateBewegungKpis(alleBewegungen, root);

  tbody.innerHTML = seitenSlice.length
    ? seitenSlice.map(buildBewegungZeile).join('')
    : ADL.emptyRow(11, 'Keine Bewegungen gespeichert');

  updatePaginationInfo(root, page, gesamt, BEWEGUNG_PRO_SEITE, 'Bewegung', 'Bewegungen');

  ADL.buildPagination({
    page,
    totalPages: seitenAnzahl,
    btnsEl:     root?.querySelector('.pagination-buttons'),
    prevAttr:   'data-bwg-prev',
    nextAttr:   'data-bwg-next',
    pageAttr:   'data-bwg',
    onPageChange: p => ADL.renderArtikelbewegung(tbody, p),
  });
};

function buildBewegungZeile(r) {
  return `<tr>
    <td class="td-mono">${ADL.escHtml(r.nr)}</td>
    <td class="td-mono">${ADL.formatDateTime(r.erstelltAm)}</td>
    <td class="td-mono">${ADL.escHtml(r.artikelnummer || '—')}</td>
    <td>${ADL.escHtml(r.bezeichnung || '—')}</td>
    <td class="td-mono">${ADL.escHtml(r.seriennr || '—')}</td>
    <td>${ADL.badge(r.typ || 'Neuanlage')}</td>
    <td>${ADL.escHtml(r.von || '—')}</td>
    <td>${ADL.escHtml(r.nach || '—')}</td>
    <td class="td-mono">${ADL.escHtml(r.transporteinheit || '—')}</td>
    <td>${ADL.escHtml(r.benutzer || '—')}</td>
    <td>${ADL.badge(r.status || 'Abgeschlossen')}</td>
  </tr>`;
}

function updateBewegungKpis(alleBewegungen, root) {
  const todayStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const datumStr = r => new Date(r.erstelltAm).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const heute   = alleBewegungen.filter(r => { const d = new Date(r.erstelltAm); return !isNaN(d) && datumStr(r) === todayStr; }).length;
  const gestern = alleBewegungen.filter(r => { const d = new Date(r.erstelltAm); return !isNaN(d) && datumStr(r) === yesterdayStr; }).length;

  const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-bwg-heute',        heute.toLocaleString('de-DE'));
  set('kpi-bwg-wareneingang', alleBewegungen.filter(r => r.typ === 'Wareneingang').length.toLocaleString('de-DE'));
  set('kpi-bwg-auslagerung',  alleBewegungen.filter(r => r.typ === 'Auslagerung').length.toLocaleString('de-DE'));
  set('kpi-bwg-versand',      alleBewegungen.filter(r => r.typ === 'Versand').length.toLocaleString('de-DE'));

  const trendEl = root?.querySelector('#kpi-bwg-trend');
  if (trendEl) {
    const diff = heute - gestern;
    if      (diff > 0) { trendEl.textContent = `+${diff} vs. gestern`; trendEl.className = 'metric-trend up'; }
    else if (diff < 0) { trendEl.textContent = `${diff} vs. gestern`;  trendEl.className = 'metric-trend down'; }
    else               { trendEl.textContent = 'Wie gestern';          trendEl.className = 'metric-trend'; }
  }
}

/* ---- Seite: Lagerort-Select befüllen ------------------------------------ */

ADL.renderArtikelVerwaltung = function (root) {
  const plaetze = ADLStore.lagerplaetze.getAll();
  const opts = '<option value="">— bitte wählen —</option>'
    + plaetze.map(p => `<option value="${ADL.escHtml(p.platzId)}">${ADL.escHtml(p.platzId)}</option>`).join('');
  const el = root.querySelector('select#lagerort');
  if (el) { const cur = el.value; el.innerHTML = opts; if (cur) el.value = cur; }
};

/* ---- Edit-Navigation ---------------------------------------------------- */

document.addEventListener('adl:edit-navigate', ({ detail: { editId } }) => {
  const mc = document.querySelector('.main-content');
  if (!mc || !mc.querySelector('#artikelbezeichnung')) return;
  const artikel = ADLStore.artikel.getById(editId);
  if (!artikel) return;
  mc.dataset.artikelEditId = editId;
  ADL.fillArtikelForm(mc, artikel);
});

/* ---- Seiten-Formular speichern ----------------------------------------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('.form-actions .btn-primary');
  if (!btn) return;
  const mc = document.querySelector('.main-content');
  if (!mc || mc.querySelector('#artikelbezeichnung') === null) return;

  const daten = readArtikelFormData(mc);
  if (!daten.bezeichnung) { ADL.toast('Bitte Artikelbezeichnung angeben.', 'danger'); return; }

  const editId = mc.dataset.artikelEditId;
  if (editId) {
    ADLStore.artikel.update(editId, daten);
    delete mc.dataset.artikelEditId;
    ADL.toast(`Artikel „${daten.bezeichnung}" aktualisiert.`);
  } else {
    ADLStore.artikel.add({ nr: ADLStore.artikel.nextNr('ART'), ...daten });
    ADLStore.bewegungen.add({
      nr:          ADLStore.bewegungen.nextNr('BWG'),
      artikelnummer: daten.artikelnummer,
      bezeichnung:   daten.bezeichnung,
      seriennr:      daten.seriennr,
      typ:           'Neuanlage',
      von:           '—',
      nach:          daten.lagerort || 'Lager',
      benutzer:      'System',
      status:        'Abgeschlossen',
    });
    ADL.toast(`Artikel „${daten.bezeichnung}" gespeichert.`);
  }
  mc.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
  mc.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));
});

/* ---- Modal-Save: Neuer Artikel ----------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalNeuerArtikelSave')?.addEventListener('click', () => {
    const bezeichnung = ADL.getInputValue('m-artikelbezeichnung');
    if (!bezeichnung) { ADL.toast('Bitte Artikelbezeichnung angeben.', 'danger'); return; }
    const artikelnummer = ADL.getInputValue('m-artikelnummer');
    const lagerort      = ADL.getInputValue('m-lagerort');
    ADLStore.artikel.add({
      nr:             ADLStore.artikel.nextNr('ART'),
      bezeichnung,    artikelnummer,
      warengruppe:    ADL.getInputValue('m-warengruppe'),
      status:         ADL.getInputValue('m-artikelstatus'),
      einheit:        ADL.getInputValue('m-einheit'),
      charge:         ADL.getInputValue('m-charge'),
      seriennr:       ADL.getInputValue('m-seriennummer'),
      maschinennr:    ADL.getInputValue('m-maschinennummer'),
      bestand:        ADL.getInputValue('m-bestand'),
      mindestbestand: ADL.getInputValue('m-mindestbestand'),
      meldebestand:   ADL.getInputValue('m-meldebestand'),
      lagerort,
      einkaufspreis:  ADL.getInputValue('m-einkaufspreis'),
      verkaufspreis:  ADL.getInputValue('m-verkaufspreis'),
      beschreibung:   ADL.getInputValue('m-beschreibung'),
    });
    ADLStore.bewegungen.add({
      nr:          ADLStore.bewegungen.nextNr('BWG'),
      artikelnummer, bezeichnung,
      seriennr:    ADL.getInputValue('m-seriennummer'),
      typ:         'Neuanlage',
      von:         '—',
      nach:        lagerort || 'Lager',
      benutzer:    'System',
      status:      'Abgeschlossen',
    });
    ADL.toast(`Artikel „${bezeichnung}" gespeichert.`);
  });
});

/* ---- Artikeldetail-Modal ------------------------------------------------ */

(function initArtikelDetailModal() {
  const overlay  = document.getElementById('modalArtikelDetail');
  if (!overlay) return;
  const bodyEl   = document.getElementById('modalArtikelDetailBody');
  const titleEl  = document.getElementById('modalArtikelDetailTitle');
  const editBtnEl = document.getElementById('modalArtikelDetailEdit');
  let aktuelleId = null;

  function openDetail(id) {
    const a = ADLStore.artikel.getById(id);
    if (!a) return;
    aktuelleId = id;
    if (titleEl) titleEl.textContent = a.bezeichnung || 'Artikeldetails';
    if (bodyEl)  bodyEl.innerHTML    = buildDetailHtml(a);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    aktuelleId = null;
  }

  function buildDetailHtml(a) {
    const LBL = 'width:22%;padding:6px 14px 6px 0;font-size:11.5px;font-weight:600;color:var(--text-secondary);vertical-align:top;white-space:nowrap';
    const VAL = 'width:28%;padding:6px 20px 6px 0;font-size:13px;color:var(--text-primary);vertical-align:top';
    const v   = x => (x != null && x !== '') ? ADL.escHtml(String(x)) : `<span style="color:var(--text-tertiary)">—</span>`;

    function tbl(paare) {
      let zeilen = '';
      for (let i = 0; i < paare.length; i += 2) {
        const [l1, v1] = paare[i];
        const [l2, v2] = paare[i + 1] || [null, null];
        zeilen += `<tr>
          <td style="${LBL}">${ADL.escHtml(l1)}</td><td style="${VAL}">${v(v1)}</td>
          ${l2 != null ? `<td style="${LBL}">${ADL.escHtml(l2)}</td><td style="${VAL}">${v(v2)}</td>` : '<td colspan="2"></td>'}
        </tr>`;
      }
      return `<table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tbody>${zeilen}</tbody></table>`;
    }

    const abschnitt = (titel, paare) => `<p class="form-group-label">${titel}</p>${tbl(paare)}`;
    const fmtDate   = iso => { const d = new Date(iso); return isNaN(d) ? null : ADL.formatDate(iso); };

    return (
      abschnitt('Stammdaten', [
        ['Artikelbezeichnung', a.bezeichnung],  ['Artikelnummer', a.artikelnummer],
        ['Warengruppe', a.warengruppe],          ['Artikelstatus', a.status],
        ['Einheit', a.einheit],                  ['Chargennummer', a.charge],
        ['Seriennummer (SN)', a.seriennr],       ['Maschinennummer (MSN)', a.maschinennr],
      ]) +
      abschnitt('Lagerbestand', [
        ['Aktueller Bestand', a.bestand],  ['Mindestbestand', a.mindestbestand],
        ['Meldebestand', a.meldebestand],  ['Lagerort', a.lagerort],
      ]) +
      abschnitt('Abmessungen &amp; Verpackung', [
        ['Länge (cm)', a.laenge],  ['Breite (cm)', a.breite],
        ['Höhe (cm)', a.hoehe],    ['Gewicht (kg)', a.gewicht],
        ['Verpackungseinheit', a.verpackungseinheit], ['Menge pro Einheit', a.mengeProEinheit],
      ]) +
      abschnitt('Einkauf', [
        ['Lieferant', a.lieferant],  ['Einkaufspreis (€)', a.einkaufspreis],
        ['Mindestbestellmenge', a.mindestbestellmenge],
      ]) +
      abschnitt('Verkauf', [
        ['Verkaufspreis (€)', a.verkaufspreis],  ['Steuersatz', a.steuersatz],
        ['Zolltarifnummer', a.zolltarifnummer],
      ]) +
      abschnitt('Versand &amp; Klassifikation', [
        ['Gefahrgut', a.gefahrgut],  ['Herkunftsland', a.herkunftsland],
        ['Barcode (EAN)', a.barcode],
      ]) +
      (a.beschreibung
        ? `<p class="form-group-label">Beschreibung</p><p style="font-size:13px;color:var(--text-primary);margin:0 0 16px;white-space:pre-wrap">${ADL.escHtml(a.beschreibung)}</p>`
        : '') +
      abschnitt('Metadaten', [
        ['Interne Nr.', a.nr],  ['Erstellt am', fmtDate(a.erstelltAm)],
        ['Geändert am', fmtDate(a.geaendertAm)],
      ])
    );
  }

  document.getElementById('modalArtikelDetailClose')?.addEventListener('click', closeDetail);
  document.getElementById('modalArtikelDetailSchliessen')?.addEventListener('click', closeDetail);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDetail();
  });

  editBtnEl?.addEventListener('click', () => {
    if (!aktuelleId) return;
    const id = aktuelleId;
    closeDetail();
    const mc = document.querySelector('.main-content');
    if (!mc) return;
    fetch('sites/Artikel.html')
      .then(r => r.text())
      .then(htmlStr => {
        const doc  = new DOMParser().parseFromString(htmlStr, 'text/html');
        const main = doc.querySelector('main');
        mc.innerHTML = main ? main.innerHTML : '';
        document.dispatchEvent(new CustomEvent('adl:edit-navigate', { detail: { editId: id } }));
      });
    document.querySelectorAll('.sidebar-item').forEach(i =>
      i.classList.toggle('active', i.getAttribute('data-page') === 'sites/Artikel.html')
    );
  });

  document.addEventListener('click', e => {
    if (e.target.closest('button')) return;
    const tr = e.target.closest('tr[data-artikel-id]');
    if (!tr) return;
    openDetail(tr.dataset.artikelId);
  });
})();

/* ---- Hilfsfunktion: Pagination-Info-Text -------------------------------- */

function updatePaginationInfo(root, page, gesamt, proSeite, singular, plural) {
  const infoEl = root?.querySelector('.pagination-info');
  if (!infoEl) return;
  if (gesamt === 0) { infoEl.textContent = `Keine ${plural}`; return; }
  const from = (page - 1) * proSeite + 1;
  const to   = Math.min(page * proSeite, gesamt);
  infoEl.textContent = `Zeigt ${from}–${to} von ${gesamt} ${gesamt === 1 ? singular : plural}`;
}
