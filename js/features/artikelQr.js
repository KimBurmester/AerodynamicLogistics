/* ==========================================================================
   ADL – Artikel QR-Code
   Zuständig für: QR-Code-Generierung in der Artikeldatenbank
   ========================================================================== */

window.ADL = window.ADL || {};

/* ---- Bibliotheks-Patch: Canvas direkt sichtbar behalten ----------------- */
// qrcodejs versucht den Canvas async in ein <img> umzuwandeln (makeImage).
// Da toDataURL in manchen Kontexten still fehlschlägt, deaktivieren wir den
// Schritt: der Canvas selbst bleibt sichtbar und zeigt den QR-Code.
(function patchQrCodeMakeImage() {
  if (typeof QRCode !== 'undefined' && QRCode.prototype) {
    QRCode.prototype.makeImage = function () {};
  }
})();

/* ---- QR-Text aus Artikeldatensatz aufbauen ------------------------------- */
// Kompaktes Format – nur Schlüsselfelder, um die QR-Kapazität nicht zu überschreiten.
// Scanner können anhand der Artikelnummer alle Detaildaten im System nachschlagen.

ADL.buildArtikelQrText = function (r) {
  const bez = (r.bezeichnung || '').substring(0, 35);
  const felder = [
    'ADL',
    r.nr || r.artikelnummer || '',
    bez,
    r.lagerort  || '',
    r.status    || 'Aktiv',
  ];
  if (r.barcode)  felder.push(r.barcode);
  if (r.seriennr) felder.push(r.seriennr);
  return felder.filter(Boolean).join('|');
};

/* ---- QR-Codes für sichtbare Tabellenzeilen rendern ----------------------- */

ADL.generateArtikelQrCodes = function (tbody, artikelListe) {
  if (typeof QRCode === 'undefined') {
    console.warn('[ADL] qrcodejs nicht geladen – QR-Codes werden nicht generiert.');
    return;
  }

  tbody.querySelectorAll('.qr-cell[data-qr-id]').forEach(cell => {
    const artikel = artikelListe.find(r => r.id === cell.dataset.qrId);
    if (!artikel) return;

    cell.innerHTML = '';
    try {
      new QRCode(cell, {
        text:         ADL.buildArtikelQrText(artikel),
        width:        72,
        height:       72,
        colorDark:    '#000000',
        colorLight:   '#ffffff',
        correctLevel: QRCode.CorrectLevel.L,
      });
    } catch (err) {
      console.error('[ADL] QR-Code Generierung fehlgeschlagen:', err);
      cell.textContent = 'QR';
      return;
    }

    const canvas = cell.querySelector('canvas');
    if (canvas) {
      canvas.style.display  = 'block';
      canvas.style.cursor   = 'zoom-in';
      canvas.style.margin   = 'auto';
      canvas.style.width    = '72px';
      canvas.style.height   = '72px';
    }
  });
};

/* ---- Vergrößerungs-Overlay für einen QR-Code ----------------------------- */

ADL.openQrEnlarge = function (artikelId) {
  if (typeof QRCode === 'undefined') return;
  const artikel = ADLStore.artikel.getById(artikelId);
  if (!artikel) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed;inset:0;background:rgba(0,0,0,.75)',
    'display:flex;align-items:center;justify-content:center',
    'z-index:9999;cursor:pointer',
  ].join(';');
  overlay.title = 'Klicken zum Schließen';

  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;padding:28px;border-radius:14px;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,.55)';
  box.addEventListener('click', e => e.stopPropagation());

  const qrDiv = document.createElement('div');
  box.appendChild(qrDiv);

  const bezeichnung = document.createElement('p');
  bezeichnung.style.cssText = 'margin:14px 0 2px;font-size:14px;font-weight:600;color:#111';
  bezeichnung.textContent = artikel.bezeichnung || '—';
  box.appendChild(bezeichnung);

  const nummer = document.createElement('p');
  nummer.style.cssText = 'margin:0;font-size:12px;color:#666;font-family:monospace';
  nummer.textContent = `${artikel.nr || ''} · ${artikel.artikelnummer || ''}`;
  box.appendChild(nummer);

  const schliessenBtn = document.createElement('button');
  schliessenBtn.textContent = 'Schließen';
  schliessenBtn.style.cssText = 'margin-top:16px;padding:6px 18px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:13px';
  schliessenBtn.addEventListener('click', () => overlay.remove());
  box.appendChild(schliessenBtn);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => overlay.remove());

  try {
    new QRCode(qrDiv, {
      text:         ADL.buildArtikelQrText(artikel),
      width:        256,
      height:       256,
      colorDark:    '#000000',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.L,
    });
    const canvas = qrDiv.querySelector('canvas');
    if (canvas) canvas.style.cssText = 'display:block;width:256px;height:256px';
  } catch (err) {
    console.error('[ADL] QR Vergrößerung fehlgeschlagen:', err);
    qrDiv.textContent = 'QR-Code konnte nicht generiert werden.';
  }
};

/* ---- Click-Handler: QR-Code vergrößern ---------------------------------- */

document.addEventListener('click', e => {
  const cell = e.target.closest('.qr-cell');
  if (!cell?.dataset.qrId) return;
  ADL.openQrEnlarge(cell.dataset.qrId);
});
