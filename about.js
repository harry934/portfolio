// about.js — Staircase About + ambient network background
document.addEventListener('DOMContentLoaded', () => {
  initAboutStaircase();
  initAboutNetwork();
});

function initAboutStaircase() {
  const aboutData = [
    {
      title: 'Harry Otieno Mokaya',
      designation: 'Software & DevOps Engineer · Founder, Craftedke',
      quote:
        "I'm a Software Engineer from Nairobi with roots in Migori County. I'm the founder of Craftedke, where I build digital products and explore different areas of technology. For me, the best part is turning ideas into something real that people can interact with and benefit from.",
      src: 'assets/img/chillen.webp',
      alt: 'Harry Otieno Mokaya',
    },
    {
      title: 'Networking',
      designation: 'Open to Opportunities',
      quote:
        "I enjoy meeting people, exchanging ideas, and collaborating on projects that challenge me to grow. If you're building something meaningful or just want to connect, I'd be glad to have the conversation.",
      src: 'assets/img/nss.webp',
      alt: 'Networking',
    },
    {
      title: 'Building Solutions',
      designation: 'Problem Solver',
      quote:
        "I really enjoy solving real world problems through technology. Whether it's designing systems, developing platforms, or improving existing ideas, I like the process of taking something from concept to a working solution that creates actual value.",
      src: 'assets/img/IoT.webp',
      alt: 'Building Solutions',
    },
    {
      title: 'Beyond Coding',
      designation: 'Nature & Adventure',
      quote:
        "When I'm away from the screen, I enjoy taking walks, spending time outdoors, and exploring new places. I enjoy nature, adventure, and moments that help me reset, stay inspired, and enjoy life beyond technology.",
      src: 'assets/img/pfp1.webp',
      alt: 'Beyond Coding',
    },
    {
      title: 'Gym & Discipline',
      designation: 'Fitness Lifestyle',
      quote:
        "Outside tech, I spend time in the gym and genuinely enjoy training. Fitness has taught me consistency, discipline, and showing up even when motivation isn't there. I try to carry those qualities into my projects and personal growth as well.",
      src: 'assets/img/gym.webp',
      alt: 'Gym & Discipline',
    },
    {
      title: 'Always Improving',
      designation: 'Continuous Learning',
      quote:
        'Technology changes quickly, and I enjoy keeping up through projects, experimentation, and learning new approaches. I see growth as an ongoing process and always try to leave every project knowing more than when I started.',
      src: 'assets/img/tech.webp',
      alt: 'Always Improving',
    },
  ];

  const mount = document.getElementById('about-staircase');
  const designationEl = document.getElementById('about-designation');
  const quoteEl = document.getElementById('about-quote');
  const detailEl = document.getElementById('about-detail');
  if (!mount) return;

  const n = aboutData.length;
  const slideWidth = 'clamp(108px, 16vw, 190px)';
  const inactiveScale = 0.78;
  const step = 0.55;
  const bounce = 0.1;
  const duration = 0.8;
  const stepDuration = 0.6;
  const defaultIndex = Math.min(2, Math.max(0, n - 1));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function stepOf(i, active) {
    return i < active ? -1 : i > active ? 1 : 0;
  }

  function slideTransform(i, active) {
    const s = stepOf(i, active);
    return (
      'translateY(' +
      s * step * 100 +
      '%) scale(' +
      (s === 0 ? 1 : inactiveScale) +
      ')'
    );
  }

  function slideDepth(i, active) {
    const dist = Math.abs(i - active);
    if (dist === 0) return { blur: 0, opacity: 1 };
    if (dist === 1) return { blur: 2.4, opacity: 0.88 };
    if (dist === 2) return { blur: 5, opacity: 0.62 };
    return { blur: 7.5, opacity: 0.4 };
  }

  function springAt(t, b, d) {
    const zeta = 1 - Math.min(Math.max(b, 0), 0.9);
    const w = (2 * Math.PI) / Math.max(d, 0.05);
    if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * w * t) *
        (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t))
    );
  }

  function springEasing(b, d, samples = 48) {
    const zeta = 1 - Math.min(Math.max(b, 0), 0.9);
    const w = (2 * Math.PI) / Math.max(d, 0.05);
    const T = Math.log(1000) / (zeta * w);
    const pts = [];
    for (let k = 0; k <= samples; k++) {
      const v = k === samples ? 1 : springAt((k / samples) * T, b, d);
      pts.push(+v.toFixed(4) + '');
    }
    return { easing: 'linear(' + pts.join(', ') + ')', ms: Math.round(T * 1000) };
  }

  function clampIndex(i) {
    return n <= 0 ? 0 : Math.min(Math.max(Math.round(i), 0), n - 1);
  }

  const strip = springEasing(bounce, duration);
  const pop = springEasing(0.18, 0.7);
  const chevron =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

  let active = clampIndex(defaultIndex);
  let titleSeq = 0;
  let shown = [{ key: 0, i: active, out: false }];
  let titleClearTimer = null;
  let detailTimer = null;
  const swipe = { id: -1, x: 0, done: false };

  mount.className = 'stc-root';
  mount.setAttribute('role', 'region');
  mount.setAttribute('aria-roledescription', 'carousel');
  mount.setAttribute('aria-label', 'About photo carousel');
  mount.tabIndex = 0;
  mount.style.setProperty('--stc-w', slideWidth);
  mount.style.setProperty('--stc-step-ms', stepDuration * 1000 + 'ms');

  const row = document.createElement('div');
  row.className = 'stc-viewport-row';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'stc-side-btn';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = chevron + '<path d="m15 18-6-6 6-6"/></svg>';
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    go(active - 1);
  });

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'stc-side-btn';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = chevron + '<path d="m9 18 6-6-6-6"/></svg>';
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    go(active + 1);
  });

  const viewport = document.createElement('div');
  viewport.className = 'stc-viewport';

  const stage = document.createElement('div');
  stage.className = 'stc-stage';
  stage.style.width = slideWidth;

  const stripEl = document.createElement('div');
  stripEl.className = 'stc-strip';

  const slides = aboutData.map((item, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'stc-slide';
    btn.setAttribute('aria-label', i + 1 + ' of ' + n + ': ' + item.title);
    btn.style.width = slideWidth;

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || item.title;
    img.draggable = false;
    img.decoding = 'async';
    img.width = 300;
    img.height = 400;
    img.loading = i === active ? 'eager' : 'lazy';
    btn.appendChild(img);

    btn.addEventListener('click', () => {
      if (swipe.done) return;
      if (i !== active) go(i);
    });

    stripEl.appendChild(btn);
    return btn;
  });

  stage.appendChild(stripEl);
  viewport.appendChild(stage);
  row.appendChild(prevBtn);
  row.appendChild(viewport);
  row.appendChild(nextBtn);

  const titlesEl = document.createElement('div');
  titlesEl.className = 'stc-titles';
  titlesEl.setAttribute('aria-hidden', 'true');

  const caption = document.createElement('div');
  caption.className = 'stc-caption';
  caption.appendChild(titlesEl);
  if (detailEl) {
    detailEl.hidden = false;
    caption.appendChild(detailEl);
  }

  const controls = document.createElement('div');
  controls.className = 'stc-controls';
  controls.addEventListener('pointerdown', (e) => e.stopPropagation());

  const dots = document.createElement('div');
  dots.className = 'stc-dots';
  const dotBtns = aboutData.map((item, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'stc-dot';
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ': ' + item.title);
    d.addEventListener('click', () => go(i));
    dots.appendChild(d);
    return d;
  });
  controls.appendChild(dots);

  const live = document.createElement('div');
  live.className = 'stc-sr';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  mount.appendChild(row);
  mount.appendChild(caption);
  mount.appendChild(controls);
  mount.appendChild(live);

  function applySlideVisual(btn, i) {
    const depth = slideDepth(i, active);
    btn.style.transform = slideTransform(i, active);
    if (reduceMotion) {
      btn.style.filter = 'none';
      btn.style.opacity = String(depth.opacity);
    } else {
      btn.style.filter = 'blur(' + depth.blur + 'px)';
      btn.style.opacity = String(depth.opacity);
    }
    const isActive = i === active;
    btn.tabIndex = isActive ? 0 : -1;
    if (isActive) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  }

  function renderTitles() {
    titlesEl.innerHTML = '';
    shown.forEach((t) => {
      const el = document.createElement('div');
      el.className = 'stc-title';
      if (t.out) el.setAttribute('data-out', '');
      el.textContent = aboutData[t.i]?.title || '';
      el.style.animation =
        (t.out ? 'stc-out ' : 'stc-in ') + pop.ms + 'ms ' + pop.easing + ' both';
      titlesEl.appendChild(el);
    });
  }

  function updateTitlesForActive() {
    const cur = shown.find((t) => !t.out);
    if (cur && cur.i === active) return;
    titleSeq += 1;
    shown = [
      ...shown.map((t) => ({ ...t, out: true })),
      { key: titleSeq, i: active, out: false },
    ];
    renderTitles();
    if (titleClearTimer) window.clearTimeout(titleClearTimer);
    titleClearTimer = window.setTimeout(() => {
      shown = shown.filter((x) => !x.out);
      renderTitles();
    }, pop.ms);
  }

  function renderDetail(animate) {
    const item = aboutData[active];
    if (!item || !designationEl || !quoteEl) return;

    const apply = () => {
      designationEl.textContent = item.designation;
      designationEl.classList.remove('is-swap');
      void designationEl.offsetWidth;
      designationEl.style.animation = 'none';
      void designationEl.offsetWidth;
      designationEl.style.animation = '';

      quoteEl.innerHTML = '';
      item.quote.split(' ').forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word + '\u00A0';
        span.className = 'about-word';
        span.style.animationDelay = 0.14 + i * 0.018 + 's';
        quoteEl.appendChild(span);
      });
    };

    if (detailTimer) window.clearTimeout(detailTimer);
    if (animate) {
      designationEl.classList.add('is-swap');
      quoteEl.style.opacity = '0';
      detailTimer = window.setTimeout(() => {
        quoteEl.style.opacity = '';
        apply();
      }, 120);
    } else {
      apply();
    }
  }

  function paint(animateDetail) {
    stripEl.style.transform = 'translateX(calc(' + -active + ' * var(--stc-w)))';
    stripEl.style.transition = reduceMotion
      ? 'none'
      : 'transform ' + strip.ms + 'ms ' + strip.easing;

    slides.forEach((btn, i) => applySlideVisual(btn, i));

    prevBtn.disabled = active <= 0;
    nextBtn.disabled = active >= n - 1;
    dotBtns.forEach((d, i) => {
      if (i === active) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });

    const current = aboutData[active];
    live.textContent = current
      ? 'Slide ' + (active + 1) + ' of ' + n + ': ' + current.title
      : '';

    updateTitlesForActive();
    renderDetail(animateDetail !== false);
  }

  function go(i) {
    const next = clampIndex(i);
    if (next === active) return;
    active = next;
    paint(true);
  }

  mount.addEventListener('keydown', (e) => {
    let to = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = active + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = active - 1;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = n - 1;
    else return;
    e.preventDefault();
    go(to);
  });

  mount.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.stc-side-btn, .stc-controls')) return;
    swipe.id = e.pointerId;
    swipe.x = e.clientX;
    swipe.done = false;
  });

  mount.addEventListener('pointermove', (e) => {
    if (swipe.id !== e.pointerId || swipe.done) return;
    const dx = e.clientX - swipe.x;
    if (Math.abs(dx) > 40) {
      swipe.done = true;
      go(active + (dx < 0 ? 1 : -1));
    }
  });

  const endPointer = () => {
    swipe.id = -1;
    window.setTimeout(() => {
      swipe.done = false;
    }, 0);
  };
  mount.addEventListener('pointerup', endPointer);
  mount.addEventListener('pointercancel', endPointer);

  renderTitles();
  stripEl.style.transform = 'translateX(calc(' + -active + ' * var(--stc-w)))';
  stripEl.style.transition = reduceMotion
    ? 'none'
    : 'transform ' + strip.ms + 'ms ' + strip.easing;
  slides.forEach((btn, i) => applySlideVisual(btn, i));
  prevBtn.disabled = active <= 0;
  nextBtn.disabled = active >= n - 1;
  dotBtns.forEach((d, i) => {
    if (i === active) d.setAttribute('aria-current', 'true');
  });
  live.textContent =
    'Slide ' + (active + 1) + ' of ' + n + ': ' + aboutData[active].title;
  renderDetail(false);
}

/** Ambient network — visible, calm, non-interactive */
function initAboutNetwork() {
  const canvas = document.getElementById('about-network');
  const section = document.getElementById('about');
  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NODE_COUNT = 36;
  const MAX_DIST = 150;
  const SPEED = 0.22;

  let nodes = [];
  let animFrame = 0;
  let running = false;
  let w = 0;
  let h = 0;

  function resize() {
    const rect = section.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    if (nodes.length === NODE_COUNT) {
      nodes.forEach((n) => {
        n.x = Math.min(w, Math.max(0, n.x));
        n.y = Math.min(h, Math.max(0, n.y));
      });
      return;
    }
    nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      return {
        x: ((col + 0.35 + Math.random() * 0.3) / 6) * w,
        y: ((row + 0.25 + Math.random() * 0.5) / 6) * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 1.6 + Math.random() * 1.8,
      };
    });
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    // Soft vignette so the web reads as atmosphere, not a hard layer
    const grad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.45,
      Math.min(w, h) * 0.1,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.72,
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.015)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const t = 1 - dist / MAX_DIST;
          ctx.strokeStyle = 'rgba(17,17,17,' + (0.06 + t * 0.16) + ')';
          ctx.lineWidth = 0.9 + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17,17,17,0.035)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17,17,17,0.2)';
      ctx.fill();
    });

    if (!reduceMotion) {
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
        node.x = Math.min(w, Math.max(0, node.x));
        node.y = Math.min(h, Math.max(0, node.y));
      });
    }

    animFrame = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    draw();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animFrame);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    },
    { threshold: 0.02 },
  );

  resize();
  start();
  window.addEventListener('resize', resize);
  io.observe(section);
}
