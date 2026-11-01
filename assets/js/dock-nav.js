/**
 * Mobile bottom pill only.
 * Desktop dock + curved screen bezel come from Crafted DockIsland
 * (assets/dock-island/dock-island.js).
 */
(function () {
  const ITEMS = [
    {
      id: 'hero',
      label: 'Home',
      href: '#hero',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    },
    {
      id: 'about',
      label: 'About',
      href: '#about',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    },
    {
      id: 'expertise',
      label: 'Expertise',
      href: '#expertise',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '#projects',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    },
    {
      id: 'resume',
      label: 'Resume',
      href: '#resume',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    },
    {
      id: 'contact',
      label: 'Contact',
      href: '#contact',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    },
  ];

  function sectionFromScroll() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return 'hero';
    const scrollPos =
      (window.pageYOffset || document.documentElement.scrollTop || 0) + 140;
    let current = 'hero';
    sections.forEach((section) => {
      if (
        scrollPos >= section.offsetTop &&
        scrollPos < section.offsetTop + section.offsetHeight
      ) {
        current = section.id;
      }
    });
    return current;
  }

  function init() {
    if (document.querySelector('.dock-mobile-root')) return;

    const root = document.createElement('div');
    root.className = 'dock-mobile-root';
    root.setAttribute('aria-label', 'Mobile navigation');

    const pill = document.createElement('nav');
    pill.className = 'dock-mobile-pill';
    pill.setAttribute('aria-label', 'Primary');

    const links = ITEMS.map((item) => {
      const a = document.createElement('a');
      a.href = item.href;
      a.dataset.id = item.id;
      a.setAttribute('aria-label', item.label);
      a.innerHTML = item.icon;
      a.addEventListener('click', (e) => {
        const el = document.querySelector(item.href);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', item.href);
      });
      pill.appendChild(a);
      return a;
    });

    root.appendChild(pill);
    document.body.appendChild(root);

    function paint() {
      const id = sectionFromScroll();
      links.forEach((a) => a.classList.toggle('is-active', a.dataset.id === id));
    }

    window.addEventListener('scroll', paint, { passive: true });
    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
