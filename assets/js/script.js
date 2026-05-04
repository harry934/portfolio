/* ============================================================
   PREMIUM INTRO SOUND  —  Web Audio API (no external file)
   ============================================================ */
function playIntroSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Cinematic chord: G3-B3-D4-G4 (pentatonic stack, staircase)
        const notes = [196, 247, 294, 392]; // Hz
        const stagger = 0.12;               // seconds between each note

        notes.forEach((freq, i) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Soft attack, long decay — like a piano key
            gain.gain.setValueAtTime(0, ctx.currentTime + i * stagger);
            gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * stagger + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * stagger + 1.8);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * stagger);
            osc.stop(ctx.currentTime + i * stagger + 2.0);
        });

        // Optional: a soft high shimmer on top
        const shimmer  = ctx.createOscillator();
        const shimGain = ctx.createGain();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(784, ctx.currentTime + 0.4); // G5
        shimGain.gain.setValueAtTime(0, ctx.currentTime + 0.4);
        shimGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
        shimGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
        shimmer.connect(shimGain);
        shimGain.connect(ctx.destination);
        shimmer.start(ctx.currentTime + 0.4);
        shimmer.stop(ctx.currentTime + 2.2);

    } catch (e) {
        // Browser doesn't support Web Audio API — silent fail
    }
}

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

    // Play the cinematic intro chord
    playIntroSound();

    // Trigger the staircase exit (CSS handles the animation)
    overlay.classList.add('exit');

    // Kick off the page content staggered reveals
    revealPageContent();

    // Last panel: delay 0.405s + transition 0.65s = ~1.06s total. Give margin.
    setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.remove('loading');
    }, 1400);
}

/* ============================================================
   MAIN SITE LOGIC
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // ── Intro: lock scroll, then dismiss ──
    document.body.classList.add('loading');
    setTimeout(dismissIntro, 600); // Short pause, then staircase sweeps away

    // ── Typed.js ──
    new Typed('#typed', {
        strings: ['Fitness Advisor', 'Innovator', 'UI/UX Designer', 'Web Developer','Cyber Security Enthusiast','Junior DevOps'],
        typeSpeed: 40,
        backSpeed: 20,
        backDelay: 1000,
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

    // ── Contact Form → Formspree ──
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // 👇 Paste your Formspree endpoint here after signing up at formspree.io
        const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbdwggdy';

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText   = submitBtn.querySelector('span');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show sending state
            submitBtn.disabled = true;
            btnText.textContent = 'SENDING...';

            const data = new FormData(contactForm);

            try {
                const res = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    btnText.textContent = 'MESSAGE SENT ✓';
                    submitBtn.style.background = '#222';
                    contactForm.reset();
                    setTimeout(() => {
                        btnText.textContent = 'SEND VIA EMAIL';
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                    }, 3000);
                } else {
                    throw new Error('Send failed');
                }
            } catch {
                btnText.textContent = 'FAILED — TRY AGAIN';
                submitBtn.disabled = false;
                setTimeout(() => { btnText.textContent = 'SEND VIA EMAIL'; }, 3000);
            }
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
