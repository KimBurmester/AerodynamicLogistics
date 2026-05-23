/* ==========================================================================
   ADL – Seitenerkennungs-Dispatcher, MutationObserver, Lösch-Handler
   Koordiniert: tryRender, TITLE_MAP, Delete-Bestätigung
   ========================================================================== */

window.ADL = window.ADL || {};

/* ---- Seite → Renderer-Mapping ------------------------------------------ */

const TITLE_MAP = {
  'Artikeldatenbank':                     tbody => ADL.renderArtikeldatenbank(tbody),
  'Artikelbewegung':                      tbody => ADL.renderArtikelbewegung(tbody),
  'Bestelldatenbank':                     tbody => ADL.renderBestelldatenbank(tbody),
  'Lieferantenübersicht':                 tbody => ADL.renderLieferanten(tbody),
  'Wareneingänge':                        tbody => ADL.renderWareneingaenge(tbody),
  'Wartungsdatenbank':                    tbody => ADL.renderWartungsdatenbank(tbody),
  'Geräteübersicht':                      tbody => ADL.renderGeraeteuebersicht(tbody),
  'Wartungshistorie':                     tbody => ADL.renderWartungshistorie(tbody),
  'Auftragsdatenbank':                    tbody => ADL.renderAuftragsdatenbank(tbody),
};

const ROOT_RENDERER_MAP = {
  'Lager & Standorte':                    root  => ADL.renderLagerStandorte(root),
  'Artikelverwaltung':                    root  => ADL.renderArtikelVerwaltung(root),
  'Produktionsdatenbank':                 root  => ADL.renderProduktionsdatenbank(root),
  'Produkt- und Fertigungsinformationen': root  => ADL.renderProduktionForm(root),
};

/* ---- tryRender: ermittelt welcher Renderer aktiv ist ------------------- */

ADL.tryRender = function (root) {
  if (root.querySelector('#adl-dashboard')) { ADL.renderDashboard(root); return; }

  const titelText = root.querySelector('.section-title')?.textContent?.trim();
  if (!titelText) return;

  const rootRenderer = ROOT_RENDERER_MAP[titelText];
  if (rootRenderer) { rootRenderer(root); return; }

  const tbodyRenderer = TITLE_MAP[titelText];
  if (tbodyRenderer) {
    const tbody = root.querySelector('.data-table tbody');
    if (tbody) tbodyRenderer(tbody);
  }
};

/* ---- MutationObserver auf .main-content -------------------------------- */

(function startMutationObserver() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  new MutationObserver(() => ADL.tryRender(mainContent))
    .observe(mainContent, { childList: true });
  ADL.tryRender(mainContent);
})();

/* ---- Lösch-Handler: zweistufige Bestätigung ---------------------------- */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-delete-id]');
  if (!btn) return;
  e.stopPropagation();

  if (!btn.dataset.confirmed) {
    zeigeLoeschBestaetigung(btn);
    return;
  }

  clearTimeout(btn._deleteTimer);
  fuehreLoschenAus(btn);
});

function zeigeLoeschBestaetigung(btn) {
  btn.dataset.confirmed = '1';
  const gespeichert = {
    html:   btn.innerHTML,
    color:  btn.style.color,
    bg:     btn.style.background,
    border: btn.style.borderColor,
  };
  btn.innerHTML         = '<span style="font-size:10px;font-weight:700;letter-spacing:.3px">SICHER?</span>';
  btn.style.color       = 'var(--danger-text)';
  btn.style.background  = 'var(--danger-bg)';
  btn.style.borderColor = 'transparent';

  btn._deleteTimer = setTimeout(() => {
    delete btn.dataset.confirmed;
    btn.innerHTML         = gespeichert.html;
    btn.style.color       = gespeichert.color;
    btn.style.background  = gespeichert.bg;
    btn.style.borderColor = gespeichert.border;
  }, 3000);
}

function fuehreLoschenAus(btn) {
  const id    = btn.dataset.deleteId;
  const store = btn.dataset.deleteStore;
  const label = btn.dataset.deleteLabel || 'Eintrag';

  if (store === 'artikel') {
    erstelleLoeschBewegung(id);
  }

  ADLStore[store]?.remove(id);
  ADL.toast(`„${label}" wurde gelöscht.`, 'danger');

  if (store === 'lagerplaetze') ADL.refreshLagerortSelects();

  const mc = document.querySelector('.main-content');
  if (mc) ADL.tryRender(mc);
}

function erstelleLoeschBewegung(artikelId) {
  const a = ADLStore.artikel.getById(artikelId);
  if (!a) return;
  ADLStore.bewegungen.add({
    nr:            ADLStore.bewegungen.nextNr('BWG'),
    artikelnummer: a.artikelnummer || a.nr,
    bezeichnung:   a.bezeichnung,
    seriennr:      a.seriennr || '',
    typ:           'Löschung',
    von:           a.lagerort || 'Lager',
    nach:          '—',
    benutzer:      'System',
    status:        'Gelöscht',
  });
}
