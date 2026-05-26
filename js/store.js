/* ==========================================================================
   ADL – Client-Side Data Store
   Persistenz: localStorage   Namespace: adl_*
   Zugriff: window.ADLStore
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---- Generic Collection ------------------------------------------- */

  class Collection {
    constructor(name) {
      this._key = 'adl_' + name;
    }

    _read() {
      try { return JSON.parse(localStorage.getItem(this._key)) || []; }
      catch { return []; }
    }

    _write(data) {
      try { localStorage.setItem(this._key, JSON.stringify(data)); }
      catch (e) { console.warn('[ADLStore] localStorage write failed:', e); }
    }

    getAll()              { return this._read(); }
    getById(id)           { return this._read().find(r => r.id === id) ?? null; }
    findBy(field, value)  { return this._read().filter(r => r[field] === value); }
    count()               { return this._read().length; }
    clear()               { this._write([]); }

    add(record) {
      const data = this._read();
      record = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        erstelltAm: new Date().toISOString(),
        ...record,
      };
      data.push(record);
      this._write(data);
      return record;
    }

    update(id, changes) {
      const data = this._read();
      const idx  = data.findIndex(r => r.id === id);
      if (idx === -1) return null;
      data[idx]  = { ...data[idx], ...changes, geaendertAm: new Date().toISOString() };
      this._write(data);
      return data[idx];
    }

    remove(id) {
      this._write(this._read().filter(r => r.id !== id));
    }

    /* Nächste laufende Nummer: PREFIX-YYYY-NNNN */
    nextNr(prefix, field = 'nr') {
      const year  = new Date().getFullYear();
      const nums  = this._read()
        .map(i => parseInt((i[field] || '').split('-').pop()))
        .filter(n => !isNaN(n));
      const next  = nums.length ? Math.max(...nums) + 1 : 1;
      return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
    }
  }

  /* ---- localStorage-Reset bei Versions-Wechsel ---------------------- */

  const STORE_VERSION = '3';
  if (localStorage.getItem('adl_version') !== STORE_VERSION) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('adl_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem('adl_version', STORE_VERSION);
  }

  /* ---- Entity-Stores ------------------------------------------------ */

  const ADLStore = {
    artikel:              new Collection('artikel'),
    bewegungen:           new Collection('bewegungen'),
    stuecklisten:         new Collection('stuecklisten'),
    auftraege:            new Collection('auftraege'),
    produktionsauftraege: new Collection('produktionsauftraege'),
    zuweisungen:          new Collection('zuweisungen'),
    qualitaetspruefungen: new Collection('qualitaetspruefungen'),
    bestellungen:         new Collection('bestellungen'),
    lieferanten:          new Collection('lieferanten'),
    wareneingaenge:       new Collection('wareneingaenge'),
    geraete:              new Collection('geraete'),
    wartungsauftraege:    new Collection('wartungsauftraege'),
    lager:                new Collection('lager'),
    hallen:               new Collection('hallen'),
    lagerplaetze:         new Collection('lagerplaetze'),
  };

  /* ---- Exportieren -------------------------------------------------- */

  global.ADLStore = ADLStore;

})(window);
