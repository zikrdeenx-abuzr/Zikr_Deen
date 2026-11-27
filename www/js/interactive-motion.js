(function () {
  'use strict';
  const ZD = window.ZD || (window.ZD = {});
  const SELECTOR = [
    '.qr-card', '.btn', '.qa-it', '.th-card', '.folder', '.ibtn', '.pbtn',
    '.row', '.pathrow', '.pill', '.nav a', '.seg button', '.tb-chip',
    '.va-tab', '.va-root-chip', '.va-opt-btn', '.sm-opt', '.sb-chip',
    '.n3-card', '.n3-mini', '.pg-tile', '.lr-btn', '.ask-chip',
    '.ask-card', '.pz-card', '.tb-home-card', '.km-li', '.zd-badge-card',
    '.m3d-card', '.nm-card', '.t-orb', '.tasbih-ring', '.tasbih-btn',
    '.wp-play', '[data-glow]'
  ].join(',');

  let enabled = true;
  let activeEl = null;
  let activeId = null;
  let startX = 0;
  let startY = 0;
  let fadeTimer = 0;
  let downAt = 0;

  function removeLegacyRing() {
    const old = document.getElementById('zdGlowRing');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function clearTap(immediate) {
    clearTimeout(fadeTimer);
    fadeTimer = 0;
    const el = activeEl;
    activeEl = null;
    activeId = null;
    if (!el) return;
    if (immediate) {
      el.classList.remove('zd-tap-active');
      return;
    }
    const elapsed = performance.now() - downAt;
    const wait = elapsed < 85 ? 85 - elapsed : 0;
    if (wait > 0) {
      fadeTimer = setTimeout(() => {
        el.classList.remove('zd-tap-active');
      }, wait);
    } else {
      el.classList.remove('zd-tap-active');
    }
  }

  function onPointerDown(e) {
    if (!enabled) return;
    if (e.button && e.button !== 0) return;
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    if (target.closest('[data-no-tap]')) return;
    const el = target.closest(SELECTOR);
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    clearTap(true);
    activeEl = el;
    activeId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    downAt = performance.now();
    el.classList.add('zd-tap-active');
    fadeTimer = setTimeout(() => clearTap(true), 420);
  }

  function onPointerMove(e) {
    if (!activeEl || e.pointerId !== activeId) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > 8 || dy > 8) clearTap(true);
  }

  function onPointerUp(e) {
    if (!activeEl) return;
    if (activeId !== null && e.pointerId !== activeId) return;
    clearTap(false);
  }

  removeLegacyRing();

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerup', onPointerUp, { passive: true });
  document.addEventListener('pointercancel', () => clearTap(true), { passive: true });
  window.addEventListener('scroll', () => clearTap(true), { passive: true, capture: true });
  window.addEventListener('hashchange', () => clearTap(true));
  window.addEventListener('blur', () => clearTap(true));

  ZD.interactiveMotion = {
    setEnabled(on) {
      enabled = Boolean(on);
      document.documentElement.dataset.glowMotion = enabled ? 'on' : 'off';
      if (!enabled) clearTap(true);
    },
    isEnabled: () => enabled,
    clear: () => clearTap(true)
  };

  try {
    const p = ZD.prefs ? ZD.prefs() : {};
    ZD.interactiveMotion.setEnabled(p.glowMotion !== false);
  } catch (_) {}
})();
