/**
 * Soft console-style UI feedback (original Web Audio tones).
 * Smooth, glassy ticks — not PlayStation assets.
 */
(function () {
  const MUTE_KEY = 'portfolio-ui-sound';
  const THROTTLE_MS = 55;

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
      // Quiet overall mix so clicks feel soft, not stiff
      master.gain.value = 0.16;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /** Soft sine with gentle attack/release (glass UI feel). */
  function softTone(c, t0, freq, dur, peak) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    // Gentle downward glide
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t0 + dur);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.4, t0);
    filter.Q.value = 0.7;

    const attack = Math.min(0.018, dur * 0.28);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  /** Very soft airy shimmer under the tone. */
  function softAir(c, t0, dur, peak) {
    const frames = Math.max(1, Math.floor(c.sampleRate * dur));
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      const env = 1 - i / frames;
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.5;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
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
        softAir(c, t0, 0.06, 0.018);
        softTone(c, t0, 880, 0.11, 0.055);
        softTone(c, t0 + 0.02, 1320, 0.09, 0.028);
      } else if (kind === 'confirm') {
        softAir(c, t0, 0.08, 0.016);
        softTone(c, t0, 523.25, 0.14, 0.05);
        softTone(c, t0 + 0.028, 783.99, 0.12, 0.04);
        softTone(c, t0 + 0.055, 1046.5, 0.1, 0.022);
      } else {
        softAir(c, t0, 0.055, 0.014);
        softTone(c, t0, 740, 0.1, 0.048);
        softTone(c, t0 + 0.016, 988, 0.08, 0.022);
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
    // Softer phone buzz
    pulse(kind === 'confirm' ? 8 : 4);
  }

  document.addEventListener('pointerdown', onPointerDown, {
    passive: true,
    capture: true,
  });

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
