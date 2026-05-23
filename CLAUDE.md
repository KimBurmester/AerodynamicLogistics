# ADL FlugzeugLogistik – Code-Regeln & Refactoring-Richtlinien

## Projekt-Überblick
Vanilla-JS ERP/Logistik-Dashboard (kein Framework). Frontend: HTML + JS + CSS, Backend: Express + SQLite.

---

## 1. Dateigrößen-Limits

| Dateityp | Max. Zeilen | Bei Überschreitung |
|---|---|---|
| `.js` Modul | 300 | In Feature-Module aufteilen |
| `.html` Seite | 200 | Modals/Templates auslagern |
| `.css` Datei | 400 | Nach Bereich trennen (layout, components, themes) |

**Ausnahme:** Generierte oder vendor-Dateien.

---

## 2. Funktionen

### Größe
- **Max. 30 Zeilen** pro Funktion (ohne Leerzeilen und Kommentare).
- Macht eine Funktion mehr als **eine Sache**, aufteilen.
- Mehr als **3 Ebenen Verschachtelung** → innere Logik in eigene Funktion extrahieren.

### Benennung
- Immer **Verb + Substantiv**: `renderArtikelTable`, `saveAuftrag`, `validateFormFields`
- Kein einbuchstabige Funktionsnamen (`val`, `sval` → `getFieldValue`, `getSelectValue`)
- Ereignis-Handler: Präfix `handle` + Quelle + Aktion → `handleSaveButtonClick`, `handleModalClose`
- Boolean-Rückgabe: Präfix `is`, `has`, `can` → `isFormValid`, `hasOpenOrders`
- **Keine Abkürzungen** außer etablierten (`id`, `url`, `html`, `css`)

### Parameter
- **Max. 3 Parameter** pro Funktion. Bei mehr → Objekt übergeben:
  ```js
  // Schlecht
  function createArtikel(name, nr, gruppe, status, preis, lager) {}

  // Gut
  function createArtikel({ name, artikelnummer, warengruppe, status, preis, lagerort }) {}
  ```
- Parameter-Objekte mit destructuring entgegennehmen.
- Keine Boolean-Flags als Parameter (`showModal(true)` → `openModal()` / `closeModal()`).

---

## 3. Variablen

### Benennung
- **camelCase** für alle Variablen: `artikelBezeichnung`, `gesamtPreis`
- **PascalCase** nur für Klassen/Konstruktoren: `Collection`, `ADLStore`
- **SCREAMING_SNAKE_CASE** für echte Konstanten (nie geändert): `MAX_ARTIKEL_ANZAHL`, `API_BASE_URL`
- Kein einbuchstabige Namen außer Schleifenindizes (`i`, `j`) und Math-Formeln
- **Keine kryptischen Kürzel**: `bp` → `basisPreis`, `wm` → `wareneingangMenge`
- **Kein Sprach-Mix**: entweder alles Deutsch oder alles Englisch pro Modul. Domänenobjekte auf Deutsch (`auftrag`, `artikel`), technische Infra auf Englisch (`store`, `router`, `handler`)

### Geltungsbereich
- `const` als Standard; `let` nur wenn Re-Assignment nötig; kein `var`
- Variablen so nah wie möglich am ersten Verwendungsort deklarieren
- Keine globalen Variablen außer expliziten App-Singletons (`ADLStore`, `ADLStorage`)

---

## 4. If-Blöcke & Bedingungen

### Struktur
- **Early Return** statt tief verschachtelter if-else-Ketten:
  ```js
  // Schlecht
  function saveArtikel(data) {
    if (data) {
      if (data.name) {
        if (data.name.length > 0) {
          // ... eigentliche Logik
        }
      }
    }
  }

  // Gut
  function saveArtikel(data) {
    if (!data?.name?.length) return;
    // ... eigentliche Logik
  }
  ```
- **Max. 2 Ebenen** if-Verschachtelung in einer Funktion. Mehr → eigene Funktion extrahieren.
- Keine negierte Bedingung als primärer Zweig (`if (!isValid)` zuerst → Early Return, kein `else`)

### Komplexe Bedingungen
- Komplexe Bedingungen in sprechende Variablen auslagern:
  ```js
  // Schlecht
  if (artikel.status === 'Aktiv' && artikel.menge > 0 && !artikel.gesperrt) {}

  // Gut
  const isArtikelVerfuegbar = artikel.status === 'Aktiv' && artikel.menge > 0 && !artikel.gesperrt;
  if (isArtikelVerfuegbar) {}
  ```
- Switch statt langer if-else-if-Ketten bei ≥ 3 diskreten Fällen

---

## 5. HTML Templates

### Regel: Kein HTML in JavaScript-Strings
Jedes wiederverwendete HTML-Fragment als `<template>` im HTML oder als separate Template-Funktion:

```js
// Schlecht
function renderBadge(status) {
  return `<span class="badge badge-${map[status]}">${status}</span>`;
}
// (verstreut in 15 Funktionen)

// Gut – zentrale Template-Funktion in js/templates/badge.js
export function badgeTemplate(status, colorClass) {
  return `<span class="badge badge-${colorClass}">${status}</span>`;
}
```

### Modal-Struktur
Modals **nie** direkt in index.html einbetten. Stattdessen:
- `sites/templates/` Ordner für wiederverwendbare Modal-Strukturen
- Ein einziger `createModal({ id, title, fields, onSave })` Factory statt 12× identisches HTML

### Ordner-Konvention für Templates
```
js/
  templates/       ← reine HTML-String-Funktionen (kein State, keine Events)
    badge.js
    tableRow.js
    modalTemplate.js
  components/      ← stateful UI-Logik (Events, State-Binding)
    modal.js
    sidebar.js
    toast.js
```

---

## 6. Module & Aufteilung

### Feature-Module (statt forms.js mit 1671 Zeilen)
Jede Domäne bekommt ein eigenes Modul unter `js/features/`:
```
js/features/
  artikel.js        ← Artikel CRUD, Formular, Tabelle
  auftrag.js        ← Auftrags-Logik
  produktion.js     ← Produktionsplan-Logik
  wartung.js        ← Wartungsaufträge
  lager.js          ← Lagerverwaltung
```

### Schichten-Trennung (Single Responsibility)
Jede Datei hat **eine** Aufgabe:

| Schicht | Beispiel | Erlaubt |
|---|---|---|
| `templates/` | `badgeTemplate.js` | Nur HTML-Strings zurückgeben |
| `features/` | `artikel.js` | DOM lesen/schreiben, Events |
| `store.js` | Datenhaltung | Kein DOM-Zugriff |
| `storage.js` | localStorage I/O | Kein DOM-Zugriff |

**Keine Queries** (`document.getElementById`) in Store- oder Storage-Dateien.

---

## 7. Wiederholung vermeiden (DRY)

### Modal-Controller-Pattern
Das aktuell 12× wiederholte Modal-Muster (open/close/reset) als eine Funktion:
```js
// js/components/modal.js
export function createModalController(modalId) {
  const overlay = document.getElementById(modalId);
  return {
    open()  { overlay?.classList.add('open'); },
    close() { overlay?.classList.remove('open'); resetFields(overlay); },
  };
}
```

### Formular-Lesen
Keine 20-feldige manuelle Zuweisung. Stattdessen `FormData` oder eine Hilfsfunktion:
```js
// js/utils/form.js
export function readForm(formId) {
  return Object.fromEntries(new FormData(document.getElementById(formId)));
}
```

### Status-Badge-Map
Badge-Farben-Mapping gehört in eine Config-Datei, nicht inline:
```js
// js/config/statusColors.js
export const STATUS_COLORS = {
  Aktiv: 'success',
  Abgeschlossen: 'success',
  Offen: 'warning',
  // ...
};
```

---

## 8. Utility-Funktionen

Kurze Helferfunktionen (`val`, `sval`) umbenennen und in `js/utils/dom.js` zentralisieren:
```js
// js/utils/dom.js
export const getInputValue  = id => document.getElementById(id)?.value?.trim() ?? '';
export const getSelectValue = id => document.getElementById(id)?.value ?? '';
export const getById        = id => document.getElementById(id);
```

---

## 9. Verbotene Muster

- `var` → immer `const`/`let`
- Einbuchstabige Funktionsnamen für Hilfsfunktionen (`val`, `sval`, `sel`)
- HTML-Strings direkt in Logikfunktionen (Ausnahme: ≤ 1 Zeile, nur ein Tag)
- `document.getElementById` außerhalb von `features/` und `components/`
- Mehr als 3 Parameter ohne Objekt-Destructuring
- Tiefe `if-else`-Ketten statt Early Return
- Modals direkt in `index.html` (→ in Template-Funktionen auslagern)
- Kommentare die das *Was* beschreiben statt das *Warum*
- Globale Event-Listener in anonymen IIFEs ohne Export (`(function init…)()`)

---

## 10. Commit-Konvention

```
feat(artikel): Artikel-Formular in eigenes Modul extrahiert
fix(modal): closeModal setzt Felder korrekt zurück
refactor(forms): forms.js in Feature-Module aufgeteilt
```
