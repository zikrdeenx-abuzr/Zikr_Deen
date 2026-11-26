'use strict';
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ZIKR_I18N_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function normalizeLanguage(value, languages, fallback = 'en') {
    const list = Array.isArray(languages) ? languages : [];
    const supported = new Set(list.map(item => item.code));
    const raw = String(value || '').trim().toLowerCase().replace('_', '-');
    if (supported.has(raw)) return raw;
    const base = raw.split('-')[0];
    return supported.has(base) ? base : (supported.has(fallback) ? fallback : null);
  }
  function getDirection(code, languages) {
    const item = (Array.isArray(languages) ? languages : []).find(x => x.code === code);
    return item && ['ar', 'ur', 'fa'].includes(code) && item.dir === 'rtl' ? 'rtl' : 'ltr';
  }
  function mergePack(selected, english, manifest) {
    const chosen = selected || {};
    const en = english || {};
    const m = manifest || {};
    const mergeSection = key => ({ ...(m['fallback' + key[0].toUpperCase() + key.slice(1)] || {}), ...(en[key] || {}), ...(chosen[key] || {}) });
    return {
      ...en,
      ...chosen,
      meta: { ...(en.meta || {}), ...(chosen.meta || {}) },
      ui: mergeSection('ui'),
      categories: mergeSection('categories'),
      levels: mergeSection('levels'),
      starter: mergeSection('starter')
    };
  }
  return { normalizeLanguage, getDirection, mergePack };
});
