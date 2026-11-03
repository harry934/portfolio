/**
 * Soft console-style UI feedback (original Web Audio tones).
 * Inspired by modern game UI ticks — not PlayStation assets.
 */
(function () {
  const MUTE_KEY = 'portfolio-ui-sound';
  const THROTTLE_MS = 45;

  let ctx = null;
  let master = null;
  let lastPlay = 0;

  const SELECTOR = [
    'button',
    'a.btn',
    '.btn',
    '.nav-btn',
    '.stc-side-btn',
    '.stc-slide',
    '.stc-dot',
    '.dock-mobile-pill a',
    '.portfolio-desktop-notch-nav a',
    '.icon-content a',
    '.card-arrow',
    '.back-to-top',
    '.expertise-modal-close',
    '.confidential-gate-close',
    '.confidential-gate-dismiss',
    '.confidential-gate-cta',
    '[data-haptic]',
    'a[href^="#"]',
    '.dock-item',
    '.dock-item-face',
    '[class*="dock-island"] a',
    '[class*="dock-island"] button',
  ].join(',');

  function muted() {
    try {
      return localStorage.getItem(MUTE_KEY) === 'off';
    } catch {
      return false;
    }
  }

  function ensureCtx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.28;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function blip(c, t0, freq, dur, peak, type) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.72), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseTick(c, t0, dur, peak) {
    const frames = Math.max(1, Math.floor(c.sampleRate * dur));
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200;
    filter.Q.value = 1.1;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.01);
  }

  function play(kind) {
    if (muted()) return;
    const now = performance.now();
    if (now - lastPlay < THROTTLE_MS) return;
    lastPlay = now;

    const c = ensureCtx();
    if (!c || !master) return;

    const t0 = c.currentTime + 0.001;
    try {
      if (kind === 'icon') {
        // Crisp high select tick
        noiseTick(c, t0, 0.028, 0.12);
        blip(c, t0, 2100, 0.055, 0.09, 'triangle');
        blip(c, t0 + 0.012, 3100, 0.04, 0.045, 'sine');
      } else if (kind === 'confirm') {
        // Slightly fuller confirm
        noiseTick(c, t0, 0.032, 0.1);
        blip(c, t0, 620, 0.08, 0.07, 'sine');
        blip(c, t0 + 0.018, 1240, 0.07, 0.08, 'triangle');
        blip(c, t0 + 0.034, 1860, 0.05, 0.04, 'sine');
      } else {
        // Soft default tap
        noiseTick(c, t0, 0.024, 0.09);
        blip(c, t0, 1650, 0.05, 0.08, 'triangle');
        blip(c, t0 + 0.01, 2400, 0.035, 0.035, 'sine');
      }
    } catch {
      // Silent fail if audio graph fails
    }
  }

  function pulse(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch {
      // ignore
    }
  }

  function kindFor(el) {
    if (
      el.matches(
        '.icon-content a, .dock-mobile-pill a, .dock-item, .dock-item-face, .stc-slide, .stc-dot, .stc-side-btn, .nav-btn, .card-arrow, .back-to-top, [data-haptic="icon"]'
      )
    ) {
      return 'icon';
    }
    if (
      el.matches(
        '.btn-dark, .btn-light, button[type="submit"], .confidential-gate-cta, [data-haptic="confirm"]'
      )
    ) {
      return 'confirm';
    }
    return 'tap';
  }

  function shouldSkip(el) {
    if (!el) return true;
    if (el.disabled) return true;
    if (el.getAttribute('aria-disabled') === 'true') return true;
    if (el.closest('[data-haptic="off"]')) return true;
    return false;
  }

  function onPointerDown(e) {
    if (typeof e.button === 'number' && e.button !== 0) return;
    const el = e.target.closest(SELECTOR);
    if (shouldSkip(el)) return;
    const kind = kindFor(el);
    play(kind);
    pulse(kind === 'confirm' ? 12 : 7);
  }

  document.addEventListener('pointerdown', onPointerDown, {
    passive: true,
    capture: true,
  });

  // Unlock audio graph on first gesture anywhere
  function unlockOnce() {
    ensureCtx();
    document.removeEventListener('pointerdown', unlockOnce, true);
    document.removeEventListener('keydown', unlockOnce, true);
  }
  document.addEventListener('pointerdown', unlockOnce, true);
  document.addEventListener('keydown', unlockOnce, true);

  window.UIHaptics = {
    play,
    unlock: ensureCtx,
    mute() {
      try {
        localStorage.setItem(MUTE_KEY, 'off');
      } catch {
        // ignore
      }
    },
    unmute() {
      try {
        localStorage.removeItem(MUTE_KEY);
      } catch {
        // ignore
      }
    },
  };
})();
