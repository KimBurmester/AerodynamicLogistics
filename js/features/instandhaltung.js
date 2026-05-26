/* ==========================================================================
   ADL – Instandhaltung-Feature
   Zuständig für: Wartungsauftrag, Gerät, Material, Tabellen-Renderer
   ========================================================================== */

window.ADL = window.ADL || {};

ADL._tempWartungMaterial = ADL._tempWartungMaterial || [];

/* ---- Modal-Saves -------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  /* Wartung: Material hinzufügen */
  document.getElementById('modalWartungMaterialSave')?.addEventListener('click', () => {
    const bezeichnung = ADL.getInputValue('wm-bezeichnung');
    if (!bezeichnung) { ADL.toast('Bitte Bezeichnung angeben.', 'danger'); return; }
    ADL._tempWartungMaterial.push({
      pos:          ADL._tempWartungMaterial.length + 1,
      artikelnummer:ADL.getInputValue('wm-artikelnummer'),
      bezeichnung,
      menge:        ADL.getInputValue('wm-menge'),
      einheit:      ADL.getInputValue('wm-einheit'),
      lagerort:     ADL.getInputValue('wm-lagerort'),
      lieferant:    ADL.getInputValue('wm-lieferant'),
      ersatzteilnr: ADL.getInputValue('wm-ersatzteilnr'),
      bemerkung:    ADL.getInputValue('wm-bemerkung'),
    });
    ADL.toast(`Material „${bezeichnung}" hinzugefügt.`);
  });

  /* Neues Gerät */
  document.getElementById('modalNeuesGeraetSave')?.addEventListener('click', () => {
    const bezeichnung = ADL.getInputValue('ng-bezeichnung');
    if (!bezeichnung) { ADL.toast('Bitte Bezeichnung angeben.', 'danger'); return; }
    ADLStore.geraete.add({
      nr:                    ADL.getInputValue('ng-geraetennr') || ADLStore.geraete.nextNr('GRT'),
      bezeichnung,
      kategorie:             ADL.getInputValue('ng-kategorie'),
      status:                ADL.getInputValue('ng-status'),
      halle:                 ADL.getInputValue('ng-halle'),
      standort:              ADL.getInputValue('ng-standort'),
      kostenstelle:          ADL.getInputValue('ng-kostenstelle'),
      verantwortlicher:      ADL.getInputValue('ng-verantwortlicher'),
      hersteller:            ADL.getInputValue('ng-hersteller'),
      modell:                ADL.getInputValue('ng-modell'),
      seriennr:              ADL.getInputValue('ng-seriennr'),
      baujahr:               ADL.getInputValue('ng-baujahr'),
      tragfaehigkeit:        ADL.getInputValue('ng-tragfaehigkeit'),
      tragfaehigkeitEinheit: ADL.getInputValue('ng-tragfaehigkeit-einheit'),
      hubhoehe:              ADL.getInputValue('ng-hubhoehe'),
      antrieb:               ADL.getInputValue('ng-antrieb'),
      bemerkung:             ADL.getInputValue('ng-bemerkung'),
      wartungsintervall:     ADL.getInputValue('ng-intervall'),
      naechsterService:      ADL.getInputValue('ng-naechster-service'),
      pruefpflicht:          ADL.getInputValue('ng-pruefpflicht'),
      betriebsstunden:       ADL.getInputValue('ng-betriebsstunden'),
    });
    ADL.toast(`Gerät „${bezeichnung}" gespeichert.`);
  });
});

/* ---- Seiten-Formular: Wartungsauftrag ----------------------------------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('.form-actions .btn-primary');
  if (!btn) return;
  const mc = document.querySelector('.main-content');
  if (!mc || mc.querySelector('#ih-auftragsnr') === null) return;

  const get = id => (mc.querySelector('#' + id)?.value ?? '').trim();
  const geraet = get('ih-geraet') || get('ih-geraetennr');
  if (!geraet) { ADL.toast('Bitte Gerät auswählen.', 'danger'); return; }

  ADLStore.wartungsauftraege.add({
    nr:              get('ih-auftragsnr') || ADLStore.wartungsauftraege.nextNr('IH'),
    wartungsart:     get('ih-wartungsart'),
    prioritaet:      get('ih-prioritaet'),
    status:          get('ih-status'),
    datum:           get('ih-datum'),
    dauer:           get('ih-dauer'),
    techniker:       get('ih-techniker'),
    kostenstelle:    get('ih-kostenstelle'),
    geraet,
    geraetekategorie:get('ih-geraetekategorie'),
    halle:           get('ih-halle'),
    standort:        get('ih-standort'),
    geraetennr:      get('ih-geraetennr'),
    seriennr:        get('ih-seriennr'),
    hersteller:      get('ih-hersteller'),
    letzterService:  get('ih-letzter-service'),
    beschreibung:    get('ih-beschreibung'),
    materialien:     [...ADL._tempWartungMaterial],
  });
  ADL._tempWartungMaterial = [];
  ADL.toast('Wartungsauftrag gespeichert.');
});

/* ---- Tabellen-Renderer: Wartungsdatenbank ------------------------------- */

const WARTUNGEN_PRO_SEITE = 8;

ADL.renderWartungsdatenbank = function (tbody, page = 1) {
  const alleAuftraege = ADLStore.wartungsauftraege.getAll();
  const gesamt        = alleAuftraege.length;
  const seitenAnzahl  = Math.max(1, Math.ceil(gesamt / WARTUNGEN_PRO_SEITE));
  page = Math.min(Math.max(1, page), seitenAnzahl);
  const seitenSlice = alleAuftraege.slice((page - 1) * WARTUNGEN_PRO_SEITE, page * WARTUNGEN_PRO_SEITE);

  tbody.innerHTML = seitenSlice.length
    ? seitenSlice.map(buildWartungZeile).join('')
    : ADL.emptyRow(10, 'Keine Wartungsaufträge gespeichert');

  const root = tbody.closest('.container') || tbody.closest('section');
  updateWartungKpis(alleAuftraege, root);
  updateWartungPaginationInfo(root, page, gesamt);

  ADL.buildPagination({
    page,
    totalPages:   seitenAnzahl,
    btnsEl:       root?.querySelector('.pagination-buttons'),
    prevAttr:     'data-wt-prev',
    nextAttr:     'data-wt-next',
    pageAttr:     'data-wt',
    onPageChange: p => ADL.renderWartungsdatenbank(tbody, p),
  });
};

function buildWartungZeile(r) {
  return `<tr>
    <td class="td-mono">${ADL.escHtml(r.nr)}</td>
    <td>${ADL.escHtml(r.geraet || '—')}</td>
    <td>${ADL.escHtml(r.geraetekategorie || r.kategorie || '—')}</td>
    <td>${ADL.escHtml(r.halle || '—')}</td>
    <td>${ADL.escHtml(r.wartungsart || '—')}</td>
    <td>${ADL.badge(r.prioritaet || 'Normal')}</td>
    <td class="td-mono">${ADL.formatDate(r.datum)}</td>
    <td>${ADL.escHtml(r.techniker || '—')}</td>
    <td>${ADL.badge(r.status)}</td>
    <td style="white-space:nowrap">
      ${ADL.editBtn('sites/Instandhaltung.html')}
      ${ADL.deleteBtn('wartungsauftraege', r.id, r.nr)}
    </td>
  </tr>`;
}

function updateWartungKpis(alleAuftraege, root) {
  const offenGeplant  = alleAuftraege.filter(r => r.status === 'Offen' || r.status === 'Geplant').length;
  const inArbeit      = alleAuftraege.filter(r => r.status === 'In Arbeit').length;
  const abgeschlossen = alleAuftraege.filter(r => r.status === 'Abgeschlossen').length;
  const set = (id, v) => { const el = root?.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-wt-gesamt',       alleAuftraege.length.toLocaleString('de-DE'));
  set('kpi-wt-offen',        offenGeplant.toLocaleString('de-DE'));
  set('kpi-wt-arbeit',       inArbeit.toLocaleString('de-DE'));
  set('kpi-wt-abgeschlossen', abgeschlossen.toLocaleString('de-DE'));
}

function updateWartungPaginationInfo(root, page, gesamt) {
  const infoEl = root?.querySelector('.pagination-info');
  if (!infoEl) return;
  if (gesamt === 0) { infoEl.textContent = 'Keine Wartungsaufträge'; return; }
  const from = (page - 1) * WARTUNGEN_PRO_SEITE + 1;
  const to   = Math.min(page * WARTUNGEN_PRO_SEITE, gesamt);
  infoEl.textContent = `Zeigt ${from}–${to} von ${gesamt} ${gesamt === 1 ? 'Wartungsauftrag' : 'Wartungsaufträgen'}`;
}

/* ---- Tabellen-Renderer: Geräteübersicht --------------------------------- */

ADL.renderGeraeteuebersicht = function (tbody) {
  const geraete = ADLStore.geraete.getAll();
  tbody.innerHTML = geraete.length
    ? geraete.map(r => {
        const tragfaehigkeitsAnzeige = r.tragfaehigkeit
          ? `${Number(r.tragfaehigkeit).toLocaleString('de-DE')} ${r.tragfaehigkeitEinheit || 'kg'}`
          : '—';
        return `<tr>
          <td class="td-mono">${ADL.escHtml(r.nr)}</td>
          <td>${ADL.escHtml(r.bezeichnung)}</td>
          <td>${ADL.escHtml(r.kategorie || '—')}</td>
          <td class="td-mono">${ADL.escHtml(tragfaehigkeitsAnzeige)}</td>
          <td>${ADL.escHtml(r.halle || '—')}</td>
          <td>${ADL.escHtml(r.hersteller || '—')}</td>
          <td class="td-mono">${ADL.escHtml(r.seriennr || '—')}</td>
          <td class="td-mono">${ADL.formatDate(r.letzterService)}</td>
          <td class="td-mono">${ADL.formatDate(r.naechsterService)}</td>
          <td>${ADL.badge(r.status || 'Aktiv')}</td>
          <td style="white-space:nowrap">
            <button class="btn btn-sm btn-ghost" data-action="neues-geraet">${ADL.EDIT_SVG}</button>
            ${ADL.deleteBtn('geraete', r.id, r.bezeichnung)}
          </td>
        </tr>`;
      }).join('')
    : ADL.emptyRow(11, 'Keine Geräte gespeichert');
};

/* ---- Tabellen-Renderer: Wartungshistorie -------------------------------- */

ADL.renderWartungshistorie = function (tbody) {
  const abgeschlossen = ADLStore.wartungsauftraege.getAll()
    .filter(r => r.status === 'Abgeschlossen');
  tbody.innerHTML = abgeschlossen.length
    ? abgeschlossen.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr)}</td>
        <td>${ADL.escHtml(r.geraet || '—')}</td>
        <td>${ADL.escHtml(r.kategorie || '—')}</td>
        <td>${ADL.escHtml(r.halle || '—')}</td>
        <td>${ADL.escHtml(r.wartungsart || '—')}</td>
        <td>${ADL.escHtml(r.techniker || '—')}</td>
        <td class="td-mono">${ADL.formatDate(r.datum)}</td>
        <td class="td-mono">${ADL.formatDate(r.datumEnde || r.datum)}</td>
        <td class="td-mono">${ADL.escHtml(String(r.dauer || '—'))}</td>
        <td>${ADL.badge('Erfolgreich')}</td>
        <td style="white-space:nowrap">
          ${ADL.editBtn('sites/Instandhaltung.html')}
          ${ADL.deleteBtn('wartungsauftraege', r.id, r.nr)}
        </td>
      </tr>`).join('')
    : ADL.emptyRow(11, 'Keine abgeschlossenen Wartungen');
};
