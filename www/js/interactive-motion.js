/* Zikr Deen App — v42 Interactive Colorful Thin Glow Border & Subtle Touch Spring
   Zero layout shift, zero ::after conflicts, auto-adapts to boxes, cards, pills, and circular buttons/balls. */
(function () {
  'use strict';
  const ZD = window.ZD || (window.ZD = {});
  const SELECTOR = [
    '.card', '.folder', '.btn', '.qa-it', '.qr-card', '.th-card',
    '.ibtn', '.pbtn', '.row', '.pathrow', '.lr-card', '.ask-card',
    '.ring', '.m3d-card', '.nm-card', '.seg button', '.nav a',
    '.t-orb', '.tasbih-ring', '.tasbih-btn', '.pill', '[data-glow]'
  ].join(',');

  let enabled = true;
  let ringEl = null;
  let activeEl = null;
  let hideTimer = null;
  let springTimer = null;
  let rafId = 0;

  function ensureRing() {
    if (ringEl && ringEl.parentNode) return ringEl;
    ringEl = document.getElementById('zdGlowRing');
    if (!ringEl) {
      ringEl = document.createElement('div');
      ringEl.id = 'zdGlowRing';
      ringEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ringEl);
    }
    return ringEl;
  }

  function clearRing() {
    clearTimeout(hideTimer);
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    activeEl = null;
    if (ringEl) ringEl.classList.remove('on');
  }

  function syncRingRect() {
    if (!activeEl || !ringEl || !enabled) return;
    if (!document.body.contains(activeEl)) { clearRing(); return; }
    const rect = activeEl.getBoundingClientRect();
    if (rect.width < 12 || rect.height < 12 || rect.bottom < 0 || rect.top > window.innerHeight) {
      clearRing();
      return;
    }
    const cs = window.getComputedStyle(activeEl);
    ringEl.style.left = rect.left.toFixed(1) + 'px';
    ringEl.style.top = rect.top.toFixed(1) + 'px';
    ringEl.style.width = rect.width.toFixed(1) + 'px';
    ringEl.style.height = rect.height.toFixed(1) + 'px';
    ringEl.style.borderRadius = cs.borderRadius || '16px';
  }

  function scheduleSync() {
    if (!activeEl || rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncRingRect();
    });
  }

  function highlightTarget(target) {
    if (!enabled || !target) return;
    const el = target.closest(SELECTOR);
    if (!el) return;
    // Skip full-page containers or hidden nodes
    const rect = el.getBoundingClientRect();
    if (rect.width < 14 || rect.height < 14 || rect.height > window.innerHeight * 0.92) return;

    ensureRing();
    activeEl = el;
    syncRingRect();
    ringEl.classList.add('on');

    // Subtle tactile spring press (only if element has no inline transform to preserve custom transforms)
    if (!el.style.transform && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      el.classList.add('zd-tap-spring');
      clearTimeout(springTimer);
      springTimer = setTimeout(() => {
        try { el.classList.remove('zd-tap-spring'); } catch (_) {}
      }, 160);
    }

    clearTimeout(hideTimer);
    hideTimer = setTimeout(clearRing, 2400);
  }

  document.addEventListener('pointerdown', e => {
    if (!enabled) return;
    if (e.button && e.button !== 0) return;
    highlightTarget(e.target);
  }, { passive: true });

  window.addEventListener('scroll', scheduleSync, { passive: true, capture: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('hashchange', clearRing);

  ZD.interactiveMotion = {
    setEnabled(on) {
      enabled = Boolean(on);
      document.documentElement.dataset.glowMotion = enabled ? 'on' : 'off';
      if (!enabled) clearRing();
    },
    isEnabled: () => enabled,
    clear: clearRing
  };

  // Sync initial preference if ZD.prefs() is already available
  try {
    const p = ZD.prefs ? ZD.prefs() : {};
    ZD.interactiveMotion.setEnabled(p.glowMotion !== false);
  } catch (_) {}
})();
