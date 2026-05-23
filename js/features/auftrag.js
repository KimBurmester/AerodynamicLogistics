/* ==========================================================================
   ADL – Auftrag-Feature
   Zuständig für: Seiten-Formular speichern, Tabellen-Renderer
   ========================================================================== */

window.ADL = window.ADL || {};

/* ---- Seiten-Formular speichern ----------------------------------------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('.form-actions .btn-primary');
  if (!btn) return;
  const mc = document.querySelector('.main-content');
  if (!mc || mc.querySelector('#auftrag-projektnr') === null) return;

  const get = id => (mc.querySelector('#' + id)?.value ?? '').trim();

  const nr = get('auftrag-nr') || ADLStore.auftraege.nextNr('AUF', 'nr');
  ADLStore.auftraege.add({
    nr,
    projektnr:        get('auftrag-projektnr'),
    kunde:            get('auftrag-kunde'),
    typ:              get('auftrag-typ'),
    prioritaet:       get('auftrag-prio'),
    status:           get('auftrag-status') || 'Offen',
    datum:            get('auftrag-datum'),
    faellig:          get('auftrag-faellig'),
    verantwortlicher: get('auftrag-verantwortlich'),
    kostenstelle:     get('auftrag-kostenstelle'),
    werk:             get('auftrag-werk'),
    halle:            get('auftrag-halle'),
    bemerkung:        get('auftrag-bemerkung'),
  });
  ADL.toast(`Auftrag „${nr}" wurde gespeichert.`);
  resetAuftragForm(mc);
});

function resetAuftragForm(mc) {
  mc.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => {
    if (el.id !== 'auftrag-nr') el.value = '';
  });
  mc.querySelectorAll('select').forEach(el => (el.selectedIndex = 0));

  const statusEl = mc.querySelector('#auftrag-status');
  if (statusEl) statusEl.value = 'Offen';

  const nrEl = mc.querySelector('#auftrag-nr');
  if (nrEl) nrEl.value = ADLStore.auftraege.nextNr('AUF', 'nr');

  const datumEl = mc.querySelector('#auftrag-datum');
  if (datumEl) datumEl.value = new Date().toISOString().slice(0, 10);
}

/* ---- Tabellen-Renderer: Auftragsdatenbank ------------------------------- */

ADL.renderAuftragsdatenbank = function (tbody) {
  const auftraege = ADLStore.auftraege.getAll();
  tbody.innerHTML = auftraege.length
    ? auftraege.map(r => `<tr>
        <td class="td-mono">${ADL.escHtml(r.nr || '—')}</td>
        <td class="td-mono">${ADL.escHtml(r.projektnr || '—')}</td>
        <td>${ADL.escHtml(r.kunde || '—')}</td>
        <td>${ADL.escHtml(r.typ || '—')}</td>
        <td>${ADL.badge(r.prioritaet || 'Normal')}</td>
        <td class="td-mono">${ADL.formatDate(r.datum)}</td>
        <td class="td-mono">${ADL.formatDate(r.faellig)}</td>
        <td>${ADL.escHtml(r.verantwortlicher || '—')}</td>
        <td>${ADL.badge(r.status || 'Offen')}</td>
        <td style="white-space:nowrap">
          ${ADL.editBtn('sites/Auftrag.html', r.id)}
          ${ADL.deleteBtn('auftraege', r.id, r.nr || r.kunde)}
        </td>
      </tr>`).join('')
    : ADL.emptyRow(10, 'Keine Aufträge gespeichert');
};
