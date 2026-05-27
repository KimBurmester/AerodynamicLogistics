/* ==========================================================================
   ADL – App-Shell
   Zuständig für: Theme, UI-Widgets, Sidebar, Navigation, Tabs, Modal-Setup
   ========================================================================== */

/* ---- Theme: Light / Dark ----------------------------------------------- */

(function initTheme() {
  const stored     = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));
})();

/* ---- Topbar-Höhe als CSS-Variable -------------------------------------- */

(function syncTopbarHeight() {
  function update() {
    const topbar = document.querySelector('.topbar');
    if (topbar) document.documentElement.style.setProperty('--topbar-h', topbar.getBoundingClientRect().height + 'px');
  }
  update();
  window.addEventListener('resize', update);
})();

/* ---- Theme-Toggle ------------------------------------------------------ */

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ---- Switches (Toggle) ------------------------------------------------- */

document.querySelectorAll('.switch-row:not(.disabled)').forEach(row => {
  row.addEventListener('click', e => {
    e.preventDefault();
    row.querySelector('.switch:not(.disabled)')?.classList.toggle('on');
  });
});

/* ---- Sliders mit Live-Wert-Anzeige ------------------------------------- */

document.querySelectorAll('input[type="range"]').forEach(slider => {
  const out = document.getElementById(slider.id + '-out');
  if (out) slider.addEventListener('input', () => (out.textContent = slider.value));
});

/* ---- Segmented Controls ------------------------------------------------ */

document.querySelectorAll('.segmented').forEach(group => {
  const buttons = group.querySelectorAll('[data-seg]');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));
});

/* ---- Chip entfernen ---------------------------------------------------- */

document.querySelectorAll('.chip-x').forEach(x => {
  x.addEventListener('click', e => {
    e.stopPropagation();
    x.closest('.chip')?.remove();
  });
});

/* ==========================================================================
   Sidebar-Konfiguration je Tab
   ========================================================================== */

const _i = p => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

const _ihSidebar = active => [
  { label: 'Neue Wartung',      icon: _i('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),      ...(active === 'wartung'   ? { active: true } : {}), page: 'sites/Instandhaltung.html'    },
  { label: 'Wartungsdatenbank', icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),       ...(active === 'datenbank' ? { active: true } : {}), page: 'sites/Wartungsdatenbank.html' },
  { label: 'Geräteübersicht',   icon: _i('<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'), ...(active === 'geraete'   ? { active: true } : {}), page: 'sites/Geraeteuebersicht.html'  },
  { label: 'Wartungshistorie',  icon: _i('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),                                                                                                                                                                                                                                                                                                                                          ...(active === 'historie'  ? { active: true } : {}), page: 'sites/Wartungshistorie.html'  },
];

const _bvSidebar = active => [
  { label: 'Neue Bestellung',      icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),                                                                                                         ...(active === 'bestellung'     ? { active: true } : {}), page: 'sites/Bestellung.html'      },
  { label: 'Bestelldatenbank',     icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), ...(active === 'datenbank'      ? { active: true } : {}), page: 'sites/Bestelldatenbank.html' },
  { label: 'Lieferantenübersicht', icon: _i('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),                     ...(active === 'lieferanten'    ? { active: true } : {}), page: 'sites/Lieferanten.html'      },
  { label: 'Wareneingänge',        icon: _i('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),              ...(active === 'wareneingaenge' ? { active: true } : {}), page: 'sites/Wareneingaenge.html'   },
];

const _pvSidebar = active => [
  { label: 'Neuer Produktionsauftrag', icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),                                                                                                         ...(active === 'produktion'  ? { active: true } : {}), page: 'sites/Produktion.html'          },
  { label: 'Produktionsdatenbank',     icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), ...(active === 'datenbank'   ? { active: true } : {}), page: 'sites/Produktionsdatenbank.html' },
  { label: 'Produktionsplan',          icon: _i('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),              ...(active === 'plan'        ? { active: true } : {}), page: 'sites/Produktionsplan.html'      },
  { label: 'Qualitätssicherung',       icon: _i('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),                                                                                               ...(active === 'qs'          ? { active: true } : {}), page: 'sites/Qualitaetssicherung.html'  },
  { label: 'Stückliste',               icon: _i('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),                                                                  ...(active === 'stueckliste' ? { active: true } : {}), page: 'sites/Stueckliste.html'           },
];

const sidebarConfig = {
  '': {
    sections: [{
      label: 'Menü',
      items: [
        { label: 'Dashboard',    icon: _i('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'), active: true },
        { label: 'Sendungen',    icon: _i('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>') },
        { label: 'Aufträge',     icon: _i('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') },
        { label: 'Flotte',       icon: _i('<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>') },
      ]
    }, {
      label: 'Verwaltung',
      items: [
        { label: 'Kunden',        icon: _i('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') },
        { label: 'Einstellungen', icon: _i('<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a1 1 0 0 0-1.41 0l-.5.5A7.95 7.95 0 0 0 12 4a8 8 0 1 0 8 8 7.95 7.95 0 0 0-1.43-4.57l.5-.5a1 1 0 0 0 0-1.41z"/>') },
      ]
    }]
  },
  'sites/Artikel.html': { sections: [{ label: 'Artikelverwaltung', items: [
    { label: 'Neuen Artikel anlegen', icon: _i('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'), active: true, page: 'sites/Artikel.html' },
    { label: 'Artikeldatenbank',      icon: _i('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'), page: 'sites/Artikeldatenbank.html' },
    { label: 'Lager & Standorte',     icon: _i('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'), page: 'sites/LagerStandorte.html' },
    { label: 'Artikelbewegung',       icon: _i('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'), page: 'sites/Artikelbewegung.html' },
  ]}] },
  'sites/Auftrag.html': { sections: [{ label: 'Auftragsverwaltung', items: [
    { label: 'Neuen Auftrag erstellen', icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'), active: true, page: 'sites/Auftrag.html' },
    { label: 'Auftragsdatenbank',       icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'), page: 'sites/Auftragsdatenbank.html' },
  ]}] },
  'sites/Auftragsdatenbank.html': { sections: [{ label: 'Auftragsverwaltung', items: [
    { label: 'Neuen Auftrag erstellen', icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'), page: 'sites/Auftrag.html' },
    { label: 'Auftragsdatenbank',       icon: _i('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'), active: true },
  ]}] },
  'sites/Produktion.html':          { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('produktion')  }] },
  'sites/Produktionsdatenbank.html':{ sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('datenbank')   }] },
  'sites/Produktionsplan.html':     { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('plan')        }] },
  'sites/Qualitaetssicherung.html': { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('qs')          }] },
  'sites/Stueckliste.html':         { sections: [{ label: 'Produktionsverwaltung', items: _pvSidebar('stueckliste') }] },
  'sites/Bestellung.html':          { sections: [{ label: 'Bestellverwaltung',    items: _bvSidebar('bestellung')     }] },
  'sites/Bestelldatenbank.html':    { sections: [{ label: 'Bestellverwaltung',    items: _bvSidebar('datenbank')      }] },
  'sites/Lieferanten.html':         { sections: [{ label: 'Bestellverwaltung',    items: _bvSidebar('lieferanten')    }] },
  'sites/Wareneingaenge.html':      { sections: [{ label: 'Bestellverwaltung',    items: _bvSidebar('wareneingaenge') }] },
  'sites/Instandhaltung.html':      { sections: [{ label: 'Instandhaltung',       items: _ihSidebar('wartung')   }] },
  'sites/Wartungsdatenbank.html':   { sections: [{ label: 'Instandhaltung',       items: _ihSidebar('datenbank') }] },
  'sites/Geraeteuebersicht.html':   { sections: [{ label: 'Instandhaltung',       items: _ihSidebar('geraete')   }] },
  'sites/Wartungshistorie.html':    { sections: [{ label: 'Instandhaltung',       items: _ihSidebar('historie')  }] },
};

/* ---- Sidebar rendern --------------------------------------------------- */

function renderSidebar(src) {
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;
  const config = sidebarConfig[src] || sidebarConfig[''];

  nav.innerHTML = config.sections.map(section => `
    <span class="sidebar-section-label">${section.label}</span>
    ${section.items.map(item => `
      <a href="#" class="sidebar-item${item.active ? ' active' : ''}"${item.page ? ` data-page="${item.page}"` : ''}>
        ${item.icon} ${item.label}
      </a>
    `).join('')}
  `).join('');

  nav.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      schliesseSidebarAufMobil();
      const page = item.getAttribute('data-page');
      if (!page) return;
      ladeSeiteInMainContent(page);
      nav.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

renderSidebar('');

/* ---- Eingebettete <script>-Tags nach innerHTML-Injektion ausführen ----- */

function runEmbeddedScripts(container) {
  container.querySelectorAll('script').forEach(old => {
    const s = document.createElement('script');
    [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
    s.textContent = old.textContent;
    old.replaceWith(s);
  });
}

/* ---- Seite in .main-content laden -------------------------------------- */

function ladeSeiteInMainContent(page) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  fetch(page)
    .then(r => r.text())
    .then(htmlStr => {
      const doc  = new DOMParser().parseFromString(htmlStr, 'text/html');
      const main = doc.querySelector('main');
      mainContent.innerHTML = main ? main.innerHTML : '';
      runEmbeddedScripts(mainContent);
    });
}

/* ---- data-navigate: Navigation per Button ------------------------------ */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-navigate]');
  if (!btn) return;
  const page   = btn.getAttribute('data-navigate');
  const editId = btn.getAttribute('data-edit-id') || null;
  ladeSeiteInMainContent(page);
  document.querySelectorAll('.sidebar-item').forEach(i =>
    i.classList.toggle('active', i.getAttribute('data-page') === page)
  );
  if (editId) {
    document.dispatchEvent(new CustomEvent('adl:edit-navigate', { detail: { editId } }));
  }
});

/* ---- Tabs -------------------------------------------------------------- */

document.querySelectorAll('.tabs').forEach(group => {
  const tabs = group.querySelectorAll('[data-tab]');
  const mainContent   = document.querySelector('.main-content');
  const dashboardHTML = mainContent ? mainContent.innerHTML : '';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (!mainContent) return;

      const src = tab.getAttribute('data-tab');
      renderSidebar(src || '');

      if (src) {
        ladeSeiteInMainContent(src);
      } else {
        mainContent.innerHTML = dashboardHTML;
      }
    });
  });
});

/* ---- Sidebar Mobile Toggle --------------------------------------------- */

(function initSidebarMobile() {
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar || !overlay) return;

  toggle.addEventListener('click', () =>
    sidebar.classList.contains('open') ? schliesseSidebar() : oeffneSidebar()
  );
  overlay.addEventListener('click', schliesseSidebar);

  function oeffneSidebar()  { sidebar.classList.add('open'); overlay.classList.add('active'); }
  function schliesseSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }
})();

function schliesseSidebarAufMobil() {
  if (window.innerWidth > 768) return;
  document.querySelector('.sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('active');
}

/* ==========================================================================
   Modal-Setup: alle Modals über createModalController registrieren
   (ersetzt 12 identische IIFE-Muster)
   ========================================================================== */

ADL.createModalController('modalNeuerArtikel', {
  triggerAction: 'neuer-artikel',
  saveId:        'modalNeuerArtikelSave',
});

ADL.createModalController('modalNeueStueckliste', {
  triggerAction: 'neue-stueckliste',
  saveId:        'modalNeueStuecklisteSave',
});

ADL.createModalController('modalPositionHinzufuegen', {
  triggerAction: 'position-hinzufuegen',
  saveId:        'modalPositionSave',
});

ADL.createModalController('modalNeueZuweisung', {
  triggerAction: 'neue-zuweisung',
  saveId:        'modalNeueZuweisungSave',
});

ADL.createModalController('modalNeuerPruefbericht', {
  triggerAction: 'neuer-pruefbericht',
  saveId:        'modalNeuerPruefberichtSave',
});

ADL.createModalController('modalNeuesGeraet', {
  triggerAction: 'neues-geraet',
  saveId:        'modalNeuesGeraetSave',
});

ADL.createModalController('modalWartungMaterial', {
  triggerAction: 'wartung-material',
  saveId:        'modalWartungMaterialSave',
});

ADL.createModalController('modalBestellungPosition', {
  triggerAction: 'bestellung-position',
  saveId:        'modalBestellungPositionSave',
});

ADL.createModalController('modalNeuerLieferant', {
  triggerAction: 'neuer-lieferant',
  saveId:        'modalNeuerLieferantSave',
});

ADL.createModalController('modalWareneingang', {
  triggerAction: 'wareneingang-erfassen',
  saveId:        'modalWareneingangSave',
});
