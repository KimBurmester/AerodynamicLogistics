/* ==========================================================================
   ADL – Dashboard-Renderer
   Abhängigkeit: ADL.badge, ADL.escHtml, ADLStore
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.renderDashboard = function (root) {
  const set  = (id, v) => { const el = root.querySelector('#' + id); if (el) el.textContent = v; };
  const html = (id, h) => { const el = root.querySelector('#' + id); if (el) el.innerHTML  = h; };

  renderArtikelKarte();
  renderAuftragKarte();
  renderBestellungKarte();
  renderProduktionKarte();
  renderInstandhaltungKarte();

  function renderArtikelKarte() {
    const artikel    = ADLStore.artikel.getAll();
    const artAktiv   = artikel.filter(r => (r.status || 'Aktiv') === 'Aktiv').length;
    const artUnter   = artikel.filter(r => {
      const b = parseFloat(r.bestand), m = parseFloat(r.mindestbestand);
      return !isNaN(b) && !isNaN(m) && m > 0 && b < m;
    }).length;
    set('db-art-gesamt',       artikel.length);
    set('db-art-aktiv',        artAktiv);
    set('db-art-unterbestand', artUnter);
    const letzteVier = artikel.slice(-4).reverse();
    html('db-art-list', letzteVier.length
      ? letzteVier.map(buildArtikelListItem).join('')
      : '<div class="db-empty">Keine Artikel vorhanden</div>');
  }

  function buildArtikelListItem(r) {
    return `<div class="db-list-item">
      <span class="db-list-nr">${ADL.escHtml(r.artikelnummer || r.nr || '—')}</span>
      <span class="db-list-label">${ADL.escHtml(r.bezeichnung || '—')}</span>
      ${ADL.badge(r.status || 'Aktiv')}
    </div>`;
  }

  function renderAuftragKarte() {
    const auftraege = ADLStore.auftraege.getAll();
    const aufOffen  = auftraege.filter(r => r.status === 'Offen' || r.status === 'In Bearbeitung').length;
    const aufKrit   = auftraege.filter(r => r.prioritaet === 'Kritisch').length;
    set('db-auf-gesamt',   auftraege.length);
    set('db-auf-offen',    aufOffen);
    set('db-auf-kritisch', aufKrit);
    const letzteVier = auftraege.slice(-4).reverse();
    html('db-auf-list', letzteVier.length
      ? letzteVier.map(r => `<div class="db-list-item">
          <span class="db-list-nr">${ADL.escHtml(r.nr || '—')}</span>
          <span class="db-list-label">${ADL.escHtml(r.kunde || '—')}</span>
          ${ADL.badge(r.status)}
        </div>`).join('')
      : '<div class="db-empty">Keine Aufträge vorhanden</div>');
  }

  function renderBestellungKarte() {
    const bestellungen = ADLStore.bestellungen.getAll();
    const bstOffen     = bestellungen.filter(r => r.status === 'Offen' || r.status === 'Neu').length;
    const bstLieferung = bestellungen.filter(r => r.status === 'In Lieferung').length;
    set('db-bst-gesamt',    bestellungen.length);
    set('db-bst-offen',     bstOffen);
    set('db-bst-lieferung', bstLieferung);
    const letzteVier = bestellungen.slice(-4).reverse();
    html('db-bst-list', letzteVier.length
      ? letzteVier.map(r => `<div class="db-list-item">
          <span class="db-list-nr">${ADL.escHtml(r.nr || '—')}</span>
          <span class="db-list-label">${ADL.escHtml(r.lieferant || '—')}</span>
          ${ADL.badge(r.status)}
        </div>`).join('')
      : '<div class="db-empty">Keine Bestellungen vorhanden</div>');
  }

  function renderProduktionKarte() {
    const prod         = ADLStore.produktionsauftraege.getAll();
    const prdLaufend   = prod.filter(r => r.status === 'Laufend').length;
    const prdAbgeschl  = prod.filter(r => r.status === 'Abgeschlossen').length;
    set('db-prd-gesamt',        prod.length);
    set('db-prd-laufend',       prdLaufend);
    set('db-prd-abgeschlossen', prdAbgeschl);
    const letzteVier = prod.slice(-4).reverse();
    html('db-prd-list', letzteVier.length
      ? letzteVier.map(r => `<div class="db-list-item">
          <span class="db-list-nr">${ADL.escHtml(r.nr || '—')}</span>
          <span class="db-list-label">${ADL.escHtml(r.bezeichnung || '—')}</span>
          ${ADL.badge(r.status)}
        </div>`).join('')
      : '<div class="db-empty">Keine Produktionen vorhanden</div>');
  }

  function renderInstandhaltungKarte() {
    const geraete  = ADLStore.geraete.getAll();
    const wartungen = ADLStore.wartungsauftraege.getAll();
    const ihOffen  = wartungen.filter(r => r.status !== 'Abgeschlossen').length;
    const ihKrit   = geraete.filter(r => r.status === 'Defekt' || r.status === 'In Wartung').length;
    set('db-ih-geraete',   geraete.length);
    set('db-ih-wartungen', ihOffen);
    set('db-ih-kritisch',  ihKrit);

    const priMap = { 'Notfall': 0, 'Dringend': 1, 'Hoch': 2, 'Normal': 3, 'Niedrig': 4 };
    const topVier = wartungen
      .filter(r => r.status !== 'Abgeschlossen')
      .sort((a, b) => (priMap[a.prioritaet] ?? 5) - (priMap[b.prioritaet] ?? 5))
      .slice(0, 4);
    html('db-ih-list', topVier.length
      ? topVier.map(r => `<div class="db-list-item">
          <span class="db-list-nr">${ADL.escHtml(r.nr || '—')}</span>
          <span class="db-list-label">${ADL.escHtml(r.geraet || '—')}</span>
          ${ADL.badge(r.prioritaet || 'Normal')}
        </div>`).join('')
      : '<div class="db-empty">Keine offenen Wartungen</div>');
  }
};

/* Dashboard-Widget-CSS einmalig injizieren */
(function injectDashboardStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
    .db-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px}
    @container (max-width:1499px){.db-grid-3{grid-template-columns:repeat(2,1fr)}}
    @container (max-width:1139px){.db-grid-3,.db-grid-2{grid-template-columns:1fr}}
    .db-card{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:16px 18px}
    .db-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .db-card-head>span{font-size:12px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px}
    .db-kpi-row{display:flex;gap:8px;margin-bottom:12px}
    .db-kpi{flex:1;background:var(--bg-primary);border:1px solid var(--border);border-radius:7px;padding:8px 10px}
    .db-kpi-label{font-size:10px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.3px;margin-bottom:2px}
    .db-kpi-value{font-size:22px;font-weight:700;color:var(--text-primary)}
    .db-kpi.db-kpi-success .db-kpi-value{color:var(--success-text)}
    .db-kpi.db-kpi-info    .db-kpi-value{color:var(--info-text)}
    .db-kpi.db-kpi-warn    .db-kpi-value{color:var(--warning-text)}
    .db-kpi.db-kpi-danger  .db-kpi-value{color:var(--danger-text)}
    .db-divider{border:none;border-top:1px solid var(--border);margin:0 0 10px}
    .db-list{display:flex;flex-direction:column}
    .db-list-item{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12.5px}
    .db-list-item:last-child{border-bottom:none;padding-bottom:0}
    .db-list-nr{font-size:11px;color:var(--text-tertiary);min-width:110px;flex-shrink:0;font-family:var(--font-mono,monospace)}
    .db-list-label{flex:1;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    .db-empty{font-size:12px;color:var(--text-tertiary);text-align:center;padding:14px 0}
  `;
  document.head.appendChild(style);
})();
