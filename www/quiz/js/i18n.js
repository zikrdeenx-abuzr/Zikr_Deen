(() => {
  'use strict';
  const CORE = window.ZIKR_I18N_CORE;
  const ROOT = './locales/';
  const KEY = 'zdLang';
  let manifest = null;
  let active = null;
  let requestVersion = 0;
  const packCache = new Map();
  const $ = (selector, root = document) => root.querySelector(selector);
  const languageSelect = () => $('#languageSelect') || $('#lang') || $('#zdGlobalLanguage');
  const safeGet = () => { try { return localStorage.getItem(KEY) || ''; } catch (_) { return ''; } };
  const safeSet = value => { try { localStorage.setItem(KEY, value); } catch (_) {} };

  function detectLanguage() {
    const candidates = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages : [navigator.language || 'en'];
    for (const candidate of candidates) {
      const code = CORE.normalizeLanguage(candidate, manifest.languages, null);
      if (code) return code;
    }
    return manifest.default || 'en';
  }

  async function fetchPack(code) {
    if (packCache.has(code)) return packCache.get(code);
    const response = await fetch(ROOT + encodeURIComponent(code) + '.json', { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Could not load ${code} language pack`);
    const pack = await response.json();
    if (!pack || !pack.meta || pack.meta.code !== code) throw new Error(`Invalid ${code} language pack`);
    packCache.set(code, pack);
    return pack;
  }

  async function load(code) {
    const chosen = CORE.normalizeLanguage(code, manifest.languages, manifest.fallback || 'en');
    let selected;
    try {
      selected = await fetchPack(chosen);
    } catch (error) {
      if (chosen === (manifest.fallback || 'en')) throw error;
      selected = { meta: { code: chosen, dir: CORE.getDirection(chosen, manifest.languages) } };
    }
    let english;
    try { english = await fetchPack(manifest.fallback || 'en'); }
    catch (_) { english = { ui: {}, categories: {}, levels: {}, starter: {} }; }
    return CORE.mergePack(selected, english, manifest);
  }

  function fillSelect(select) {
    if (!select) return;
    const keep = select.value;
    const fragment = document.createDocumentFragment();
    for (const item of manifest.languages) {
      const option = document.createElement('option');
      option.value = item.code;
      option.textContent = `${item.nativeName} — ${item.englishName}`;
      fragment.append(option);
    }
    select.replaceChildren(fragment);
    const preferred = manifest.languages.some(item => item.code === keep) ? keep : (active?.meta?.code || manifest.default || 'en');
    select.value = preferred;
    select.setAttribute('aria-label', manifest.fallbackUi?.chooseLanguage || 'Choose language');
  }

  function ensureSwitcher() {
    let select = languageSelect();
    if (!select) {
      const host = $('header .wrap') || $('header .topbar') || $('header .tools') || $('header') || $('main');
      if (!host) return null;
      const wrap = document.createElement('label');
      wrap.className = 'zd-language-wrap';
      const caption = document.createElement('span');
      caption.textContent = manifest.fallbackUi?.chooseLanguage || 'Language';
      select = document.createElement('select');
      select.id = 'zdGlobalLanguage';
      select.setAttribute('aria-label', 'Choose language');
      wrap.append(caption, select);
      host.append(wrap);
    }
    fillSelect(select);
    select.classList.add('zd-global-language');
    select.addEventListener('change', () => choose(select.value));
    return select;
  }

  function applyDocument(pack) {
    const code = pack.meta.code;
    const meta = manifest.languages.find(item => item.code === code) || manifest.languages[0];
    const direction = CORE.getDirection(code, manifest.languages);
    document.documentElement.lang = code === 'hinglish' ? 'en-IN' : code;
    document.documentElement.dir = direction;
    document.documentElement.dataset.language = code;
    document.documentElement.dataset.script = code;
    document.documentElement.dataset.speechLocale = meta.speechLocale;
    const scriptFonts = { ar: '"Noto Naskh Arabic","Noto Sans Arabic"', ur: '"Noto Naskh Arabic","Noto Sans Arabic"', fa: '"Noto Naskh Arabic","Noto Sans Arabic"', hi: '"Noto Sans Devanagari"', bn: '"Noto Sans Bengali"', zh: '"Noto Sans SC"', ko: '"Noto Sans KR"', ja: '"Noto Sans JP"' };
    document.documentElement.style.setProperty('--zd-script-font', scriptFonts[code] || '"Noto Sans"');
    if (!document.getElementById('zd-i18n-style')) {
      const style = document.createElement('style');
      style.id = 'zd-i18n-style';
      style.textContent = 'html[dir=rtl] body{text-align:start}html[data-language] body{font-family:var(--zd-script-font),system-ui,sans-serif}input,textarea{unicode-bidi:plaintext}';
      document.head.append(style);
    }
    document.querySelectorAll('input:not([dir]),textarea:not([dir])').forEach(node => node.setAttribute('dir', 'auto'));
    document.querySelectorAll('[data-zd-i18n]').forEach(node => {
      const value = pack.ui[node.dataset.zdI18n];
      if (typeof value === 'string') node.textContent = value;
    });
    document.querySelectorAll('[data-zd-i18n-attr]').forEach(node => {
      const pairs = node.dataset.zdI18nAttr.split(',').map(value => value.trim()).filter(Boolean);
      for (const pair of pairs) {
        const [attribute, key] = pair.split(':').map(value => value.trim());
        const value = pack.ui[key];
        if (attribute && typeof value === 'string') node.setAttribute(attribute, value);
      }
    });
    const select = languageSelect();
    if (select) {
      if (select.value !== code) select.value = code;
      select.setAttribute('aria-label', pack.ui?.chooseLanguage || manifest.fallbackUi?.chooseLanguage || 'Choose language');
    }
    window.ZIKR_I18N = {
      manifest, locale: pack, language: code, dir: direction,
      speechLocale: meta.speechLocale,
      translationStatus: pack.meta.translationStatus || 'fallback-or-draft',
      reviewStatus: pack.meta.reviewStatus || 'pending-review',
      t: key => pack.ui?.[key] ?? manifest.fallbackUi?.[key] ?? 'Review required'
    };
    if (window.LOC && typeof window.LOC === 'object') window.LOC[code] = meta.speechLocale;
    document.dispatchEvent(new CustomEvent('zikr:languagechange', { detail: window.ZIKR_I18N }));
  }

  async function choose(code) {
    const version = ++requestVersion;
    const pack = await load(code);
    if (version !== requestVersion) return;
    active = pack;
    safeSet(pack.meta.code);
    applyDocument(pack);
  }

  async function init() {
    try {
      if (!CORE) throw new Error('Language core is unavailable');
      const response = await fetch(ROOT + 'manifest.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error('Language manifest unavailable');
      manifest = await response.json();
      if (!Array.isArray(manifest.languages) || manifest.languages.length !== 20) throw new Error('Expected 20 language definitions');
      ensureSwitcher();
      const saved = safeGet();
      const chosen = manifest.languages.some(item => item.code === saved) ? saved : detectLanguage();
      await choose(chosen);
    } catch (error) {
      console.warn('Zikr Deen language fallback:', error.message);
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
