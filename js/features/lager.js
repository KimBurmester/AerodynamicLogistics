/* ==========================================================================
   ADL – Lager-Feature
   Zuständig für: Lager/Halle/Lagerplatz speichern, Renderer, Generator
   ========================================================================== */

window.ADL = window.ADL || {};

let _generatorDaten = [];

/* ---- Lagerort-Selects global befüllen ----------------------------------- */

ADL.refreshLagerortSelects = function () {
  const plaetze = ADLStore.lagerplaetze.getAll();
  const opts = '<option value="">— bitte wählen —</option>'
    + plaetze.map(p => `<option value="${ADL.escHtml(p.platzId)}">${ADL.escHtml(p.platzId)}</option>`).join('');
  document.querySelectorAll('select#lagerort, select#m-lagerort').forEach(el => {
    const current = el.value;
    el.innerHTML = opts;
    if (current) el.value = current;
  });
};

document.addEventListener('DOMContentLoaded', ADL.refreshLagerortSelects);

/* ---- Tabellen-Renderer: Lager & Standorte ------------------------------- */

ADL.renderLagerStandorte = function (root) {
  const lager   = ADLStore.lager.getAll();
  const hallen  = ADLStore.hallen.getAll();
  const plaetze = ADLStore.lagerplaetze.getAll();
  const freie   = plaetze.filter(p => p.status === 'Frei').length;

  const set = (id, v) => { const el = root.querySelector('#' + id); if (el) el.textContent = v; };
  set('kpi-lager',        lager.length.toLocaleString('de-DE'));
  set('kpi-hallen',       hallen.length.toLocaleString('de-DE'));
  set('kpi-lagerplaetze', plaetze.length.toLocaleString('de-DE'));
  set('kpi-frei',         freie.toLocaleString('de-DE'));

  renderLagerTabelle(root, lager);
  renderHallenTabelle(root, hallen);
  renderLagerplaetzeTabelle(root, plaetze);
  befuelleLagerSelects(root, lager, hallen);
};

function renderLagerTabelle(root, lager) {
  const tbody = root.querySelector('#tbl-lager tbody');
  if (!tbody) return;
  tbody.innerHTML = lager.length
    ? lager.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr || '—')}</td>
        <td>${ADL.escHtml(r.bezeichnung || '—')}</td>
        <td>${ADL.escHtml(r.typ || '—')}</td>
        <td>${ADL.escHtml(r.adresse || '—')}</td>
        <td>${ADL.escHtml(r.flaeche ? r.flaeche + ' m²' : '—')}</td>
        <td>${ADL.badge(r.status || 'Aktiv')}</td>
        <td>${ADL.deleteBtn('lager', r.id, r.bezeichnung || r.nr)}</td>
      </tr>`).join('')
    : ADL.emptyRow(7, 'Keine Lager gespeichert');
}

function renderHallenTabelle(root, hallen) {
  const tbody = root.querySelector('#tbl-hallen tbody');
  if (!tbody) return;
  tbody.innerHTML = hallen.length
    ? hallen.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr || '—')}</td>
        <td>${ADL.escHtml(r.bezeichnung || '—')}</td>
        <td>${ADL.escHtml(r.lagerBezeichnung || r.lagerNr || '—')}</td>
        <td>${ADL.escHtml(r.flaeche ? r.flaeche + ' m²' : '—')}</td>
        <td>${ADL.escHtml([r.laenge, r.breite, r.hoehe].map(v => v || '—').join(' × '))}</td>
        <td>${ADL.deleteBtn('hallen', r.id, r.bezeichnung || r.nr)}</td>
      </tr>`).join('')
    : ADL.emptyRow(6, 'Keine Hallen gespeichert');
}

function renderLagerplaetzeTabelle(root, plaetze) {
  const tbody = root.querySelector('#tbl-lagerplaetze tbody');
  if (!tbody) return;
  tbody.innerHTML = plaetze.length
    ? plaetze.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.platzId || '—')}</td>
        <td>${ADL.escHtml(r.lagerBezeichnung || r.lagerNr || '—')}</td>
        <td>${ADL.escHtml(r.halleNr ? r.halleNr + (r.halleBezeichnung ? ' – ' + r.halleBezeichnung : '') : '—')}</td>
        <td>${ADL.escHtml(r.regal || '—')}</td>
        <td>${ADL.escHtml(r.fach || '—')}</td>
        <td>${ADL.escHtml(r.ebene || '—')}</td>
        <td>${ADL.escHtml(r.typ || '—')}</td>
        <td>${ADL.escHtml(r.tragfaehigkeit ? r.tragfaehigkeit + ' kg' : '—')}</td>
        <td>${ADL.badge(r.status || 'Frei')}</td>
        <td>${ADL.deleteBtn('lagerplaetze', r.id, r.platzId)}</td>
      </tr>`).join('')
    : ADL.emptyRow(10, 'Keine Lagerplätze gespeichert');
}

function befuelleLagerSelects(root, lager, hallen) {
  const lagerOpts = '<option value="">— bitte wählen —</option>'
    + lager.map(l => `<option value="${ADL.escHtml(l.nr)}">${ADL.escHtml(l.nr)} – ${ADL.escHtml(l.bezeichnung)}</option>`).join('');
  ['halleZuLager', 'platzLager', 'genLager'].forEach(id => {
    const el = root.querySelector('#' + id);
    if (el) { const cur = el.value; el.innerHTML = lagerOpts; if (cur) el.value = cur; }
  });

  const hallenOpts = '<option value="">— bitte wählen —</option>'
    + hallen.map(h => `<option value="${ADL.escHtml(h.nr)}">${ADL.escHtml(h.nr)} – ${ADL.escHtml(h.bezeichnung)}</option>`).join('');
  ['platzHalle', 'genHalle'].forEach(id => {
    const el = root.querySelector('#' + id);
    if (el) { const cur = el.value; el.innerHTML = hallenOpts; if (cur) el.value = cur; }
  });
}

/* ---- Lager/Halle/Lagerplatz speichern ----------------------------------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-lager-save]');
  if (!btn) return;
  const mc = document.querySelector('.main-content');
  if (!mc) return;

  const get  = id => (mc.querySelector('#' + id)?.value ?? '').trim();
  const gsel = id => mc.querySelector('#' + id)?.value ?? '';
  const clr  = ids => ids.forEach(id => { const el = mc.querySelector('#' + id); if (el) el.value = ''; });
  const type = btn.dataset.lagerSave;

  if (type === 'lager') {
    const bezeichnung = get('lagerBezeichnung');
    if (!bezeichnung) { ADL.toast('Bitte Lagerbezeichnung angeben.', 'danger'); return; }
    const nr = get('lagerId') || ('LGR-' + String(ADLStore.lager.count() + 1).padStart(3, '0'));
    ADLStore.lager.add({ nr, bezeichnung, typ: gsel('lagerTyp') || 'Hauptlager', adresse: get('lagerAdresse'), flaeche: get('lagerFlaeche'), status: gsel('lagerStatus') || 'Aktiv' });
    ADL.toast(`Lager „${bezeichnung}" gespeichert.`);
    clr(['lagerBezeichnung', 'lagerId', 'lagerAdresse', 'lagerFlaeche']);

  } else if (type === 'halle') {
    const nr          = get('hallenNummer');
    const bezeichnung = get('hallenBezeichnung');
    if (!nr || !bezeichnung) { ADL.toast('Bitte Hallennummer und Bezeichnung angeben.', 'danger'); return; }
    const lagerNr = gsel('halleZuLager');
    const lager   = ADLStore.lager.getAll().find(l => l.nr === lagerNr);
    ADLStore.hallen.add({ nr, bezeichnung, lagerNr, lagerBezeichnung: lager?.bezeichnung || lagerNr, flaeche: get('hallenFlaeche'), laenge: get('hallenLaenge'), breite: get('hallenBreite'), hoehe: get('hallenHoehe') });
    ADL.toast(`Halle „${nr} – ${bezeichnung}" gespeichert.`);
    clr(['hallenNummer', 'hallenBezeichnung', 'hallenFlaeche', 'hallenLaenge', 'hallenBreite', 'hallenHoehe']);

  } else if (type === 'lagerplatz') {
    const lagerNr = gsel('platzLager');
    const regal   = get('platzRegal');
    const fach    = get('platzFach');
    if (!lagerNr || !regal || !fach) { ADL.toast('Bitte Lager, Regal und Fach angeben.', 'danger'); return; }
    const halleNr = gsel('platzHalle');
    const ebene   = get('platzEbene');
    const lager   = ADLStore.lager.getAll().find(l => l.nr === lagerNr);
    const halle   = ADLStore.hallen.getAll().find(h => h.nr === halleNr);
    const platzId = [lagerNr, halleNr, regal, fach, ebene].filter(Boolean).join('-');
    ADLStore.lagerplaetze.add({ platzId, lagerNr, lagerBezeichnung: lager?.bezeichnung || lagerNr, halleNr, halleBezeichnung: halle?.bezeichnung || halleNr, regal, fach, ebene, typ: gsel('platzTyp') || 'Standard', tragfaehigkeit: get('platzTragfaehigkeit'), status: 'Frei' });
    ADL.toast(`Lagerplatz „${platzId}" gespeichert.`);
    clr(['platzRegal', 'platzFach', 'platzEbene', 'platzTragfaehigkeit', 'platzId']);
    ADL.refreshLagerortSelects();
  }

  const mc2 = document.querySelector('.main-content');
  if (mc2) ADL.tryRender(mc2);
});

/* ---- Lagerplatz-ID Vorschau --------------------------------------------- */

document.addEventListener('input', e => {
  if (!['platzRegal', 'platzFach', 'platzEbene'].includes(e.target.id)) return;
  const mc = document.querySelector('.main-content');
  if (!mc) return;
  aktualisiereVorschauId(mc);
});

document.addEventListener('change', e => {
  const mc = document.querySelector('.main-content');
  if (!mc) return;

  if (['platzLager', 'platzHalle'].includes(e.target.id)) aktualisiereVorschauId(mc);

  if (e.target.id === 'platzLager' || e.target.id === 'genLager') {
    const lagerNr  = e.target.value;
    const filtered = ADLStore.hallen.getAll().filter(h => !lagerNr || h.lagerNr === lagerNr);
    const halleId  = e.target.id === 'platzLager' ? 'platzHalle' : 'genHalle';
    const halleEl  = mc.querySelector('#' + halleId);
    if (halleEl) {
      halleEl.innerHTML = '<option value="">— bitte wählen —</option>'
        + filtered.map(h => `<option value="${ADL.escHtml(h.nr)}">${ADL.escHtml(h.nr)} – ${ADL.escHtml(h.bezeichnung)}</option>`).join('');
    }
  }
});

function aktualisiereVorschauId(mc) {
  const get     = id => (mc.querySelector('#' + id)?.value ?? '').trim();
  const platzId = [get('platzLager'), get('platzHalle'), get('platzRegal'), get('platzFach'), get('platzEbene')].filter(Boolean).join('-');
  const el      = mc.querySelector('#platzId');
  if (el) el.value = platzId;
}

/* ---- Lagerplatz-Generator ----------------------------------------------- */

document.addEventListener('click', e => {
  if (e.target.id === 'btnGenerieren' || e.target.closest('#btnGenerieren')) {
    handleGenerieren();
    return;
  }
  if (e.target.id === 'btnUebernehmen' || e.target.closest('#btnUebernehmen')) {
    handleUebernehmen();
    return;
  }
  if (e.target.id === 'btnGeneratorReset' || e.target.closest('#btnGeneratorReset')) {
    handleGeneratorReset();
  }
});

function handleGenerieren() {
  const mc = document.querySelector('.main-content');
  if (!mc) return;
  const get  = id => (mc.querySelector('#' + id)?.value ?? '').trim();
  const gsel = id => mc.querySelector('#' + id)?.value ?? '';

  const lagerNr = gsel('genLager');
  const halleNr = gsel('genHalle');
  const typ     = gsel('genTyp') || 'Standard';
  const regale  = parseInt(get('genRegale'))  || 0;
  const faecher = parseInt(get('genFaecher')) || 0;
  const ebenen  = parseInt(get('genEbenen'))  || 0;

  if (!lagerNr || regale <= 0 || faecher <= 0 || ebenen <= 0) {
    ADL.toast('Bitte Lager und Regal-, Fach- sowie Ebenenanzahl angeben.', 'danger');
    return;
  }

  const lager = ADLStore.lager.getAll().find(l => l.nr === lagerNr);
  const halle = ADLStore.hallen.getAll().find(h => h.nr === halleNr);
  _generatorDaten = [];

  for (let r = 1; r <= regale; r++) {
    for (let f = 1; f <= faecher; f++) {
      for (let eb = 1; eb <= ebenen; eb++) {
        const rStr = 'R' + String(r).padStart(2, '0');
        const fStr = 'F' + String(f).padStart(2, '0');
        const eStr = 'E' + String(eb).padStart(2, '0');
        _generatorDaten.push({
          platzId:          [lagerNr, halleNr, rStr, fStr, eStr].filter(Boolean).join('-'),
          lagerNr,          lagerBezeichnung: lager?.bezeichnung || lagerNr,
          halleNr,          halleBezeichnung: halle?.bezeichnung || halleNr,
          regal: rStr,      fach: fStr,
          ebene: eStr,      typ,
          tragfaehigkeit:   get('genTragfaehigkeit'),
          status:           'Frei',
        });
      }
    }
  }

  const vorschauEl = mc.querySelector('#generatorVorschau');
  if (vorschauEl) vorschauEl.textContent = _generatorDaten.map(p => p.platzId).join('\n');
  const uBtn = mc.querySelector('#btnUebernehmen');
  if (uBtn) uBtn.disabled = false;
}

function handleUebernehmen() {
  if (!_generatorDaten.length) return;
  _generatorDaten.forEach(p => ADLStore.lagerplaetze.add(p));
  ADL.toast(`${_generatorDaten.length} Lagerplätze gespeichert.`);
  _generatorDaten = [];

  const mc = document.querySelector('.main-content');
  if (mc) {
    const uBtn = mc.querySelector('#btnUebernehmen');
    if (uBtn) uBtn.disabled = true;
    const vorschauEl = mc.querySelector('#generatorVorschau');
    if (vorschauEl) vorschauEl.textContent = 'Einstellungen wählen und auf „Generieren" klicken…';
    ADL.tryRender(mc);
  }
  ADL.refreshLagerortSelects();
}

function handleGeneratorReset() {
  _generatorDaten = [];
  const mc = document.querySelector('.main-content');
  if (!mc) return;
  const vorschauEl = mc.querySelector('#generatorVorschau');
  if (vorschauEl) vorschauEl.textContent = 'Einstellungen wählen und auf „Generieren" klicken…';
  const uBtn = mc.querySelector('#btnUebernehmen');
  if (uBtn) uBtn.disabled = true;
}
