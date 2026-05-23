/* ==========================================================================
   ADL – Status → Badge-Farben-Mapping
   ========================================================================== */

window.ADL = window.ADL || {};

ADL.STATUS_COLORS = {
  // Erfolg / Abschluss
  'Aktiv':                  'success',
  'Abgeschlossen':          'success',
  'Abgeschlossen (i.O.)':   'success',
  'Erfolgreich':            'success',
  'Sehr gut':               'success',
  'Neuanlage':              'success',
  'Wareneingang':           'success',
  'Frei':                   'success',

  // Warnung / In Arbeit
  'In Lieferung':           'warning',
  'In Arbeit':              'warning',
  'In Prüfung':             'warning',
  'In Wartung':             'warning',
  'Nacharbeit':             'warning',
  'Befriedigend':           'warning',
  'Hoch':                   'warning',
  'Auslagerung':            'warning',
  'Belegt':                 'warning',
  'In Bearbeitung':         'warning',

  // Info / Geplant
  'Offen':                  'info',
  'Geplant':                'info',
  'Erwartet':               'info',
  'Gut':                    'info',
  'Normal':                 'info',
  'Einlagerung':            'info',
  'In Planung':             'info',
  'Neu':                    'info',
  'Laufend':                'info',

  // Gefahr / Fehler
  'Abgelehnt (n.i.O.)':    'danger',
  'Defekt':                 'danger',
  'Gesperrt':               'danger',
  'Dringend':               'danger',
  'Notfall':                'danger',
  'Nicht abgeschlossen':    'danger',
  'Versand':                'danger',
  'Gelöscht':               'danger',
  'Löschung':               'danger',
  'Storniert':              'danger',
  'Kritisch':               'danger',
  'Verzögert':              'danger',

  // Sonstige
  'Umlagerung':             'purple',
  'Planung':                'purple',
  'Niedrig':                'secondary',
  'Inaktiv':                'secondary',
  'Pausiert':               'secondary',
};
