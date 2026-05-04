/* ============================================================
   INTRO OVERLAY CONTROLLER
   ============================================================ */
(function () {
    // Lock scroll immediately as script parses
    document.body && document.body.classList.add('loading');
})();

function revealPageContent() {
    // Each entry: [selector, CSS class, delay in seconds]
    const reveals = [
        ['#main-nav',          'reveal-nav',   0.0],
        ['.hero-title',        'reveal-up',    0.1],
        ['.hero-subtitle',     'reveal-up',    0.25],
        ['.hero-actions-row',  'reveal-up',    0.4],
        ['.image-wrapper',     'reveal-scale', 0.2],
        ['.social-side-bar',   'reveal-left',  0.35],
    ];

    reveals.forEach(([sel, cls, delay]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.style.setProperty('--delay', delay + 's');
        el.classList.add(cls);
    });
}

function dismissIntro() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    // Trigger the split-away exit (CSS handles the animation)
    overlay.classList.add('exit');

    // Kick off the page content staggered reveals
    revealPageContent();

    // Fallback: fully hide and re-enable scroll after transition
    setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.remove('loading');
    }, 1000);
}

/* ============================================================
   MAIN SITE LOGIC
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // ── Intro: lock scroll, then dismiss after intro plays ──
    document.body.classList.add('loading');
    setTimeout(dismissIntro, 400); // Brief pause then screen opens

    // ── Typed.js ──
    new Typed('#typed', {
        strings: ['Innovative Systems.', 'Scalable Software.', 'AI-Driven Solutions.', 'IoT Ecosystems.'],
        typeSpeed: 40,
        backSpeed: 20,
        loop: true,
        cursorChar: '_'
    });

    // ── Scroll Progress Bar ──
    const progressBar = document.querySelector('.scroll-progress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    // ── Nav Sticky Behavior ──
    const header = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // ── Contact Form Smart Redirect ──
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name    = document.getElementById('contact-name').value;
            const email   = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            window.location.href = `mailto:otienoharry876@gmail.com?subject=${subject}&body=${body}`;
            contactForm.reset();
        });
    }

    // ── Close Mobile Nav on Link Click ──
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // ── Smooth Scrolling ──
    const allLinks = document.querySelectorAll('a[href^="#"]');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }
            }
        });
    });

    // ── Skill Progress Bar Reveal ──
    const progressBars = document.querySelectorAll('.progress');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => { entry.target.style.width = targetWidth; }, 100);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    progressBars.forEach(bar => skillObserver.observe(bar));

    // ── Section Reveal on Scroll ──
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity    = '0';
        section.style.transform  = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
});
