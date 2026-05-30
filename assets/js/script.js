/* ============================================================
   PREMIUM INTRO SOUND  —  Web Audio API (no external file)
   Called directly from the overlay click handler, so the
   AudioContext is created inside a user gesture — no autoplay
   policy issues.
   ============================================================ */
function playIntroSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Cinematic chord: G3-B3-D4-G4
        const notes   = [196, 247, 294, 392];
        const stagger = 0.12;

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

        // Soft high shimmer on top
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

/* ============================================================
   TEXT ROLL — hero title character-by-character hover animation
   Translates the Framer Motion TextRoll into vanilla JS + CSS.
   Each .text-roll[data-text] span gets two character layers:
     • .text-roll-top  — visible, rolls UP on hover
     • .text-roll-bottom — hidden below, rises INTO VIEW on hover
   Stagger delay mirrors the React original:
     delay = STAGGER × |i − (len − 1) / 2|  (center-out)
   ============================================================ */
function initTextRoll() {
    const STAGGER = 0.035;

    document.querySelectorAll('.text-roll').forEach(roll => {
        const text = roll.dataset.text;
        if (!text) return;

        const totalLen = text.length;
        roll.innerHTML = '';

        const words = text.split(' ');
        let charIndex = 0; // Global char index for stagger across words

        words.forEach((word, wordIdx) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-roll';

            word.split('').forEach((char) => {
                // Center-out stagger based on total string length
                const delay = STAGGER * Math.abs(charIndex - (totalLen - 1) / 2);

                const charContainer = document.createElement('span');
                charContainer.className = 'char-container';

                const topLayer = document.createElement('span');
                topLayer.className = 'char-top';
                const topChar = document.createElement('span');
                topChar.className = 'text-roll-char';
                topChar.textContent = char;
                topChar.style.transitionDelay = delay + 's';
                topLayer.appendChild(topChar);

                const bottomLayer = document.createElement('span');
                bottomLayer.className = 'char-bottom';
                bottomLayer.setAttribute('aria-hidden', 'true');
                const bottomChar = document.createElement('span');
                bottomChar.className = 'text-roll-char';
                bottomChar.textContent = char;
                bottomChar.style.transitionDelay = delay + 's';
                bottomLayer.appendChild(bottomChar);

                charContainer.appendChild(topLayer);
                charContainer.appendChild(bottomLayer);
                wordSpan.appendChild(charContainer);
                
                charIndex++;
            });

            roll.appendChild(wordSpan);

            // Add space between words (as a text node for natural wrapping)
            if (wordIdx < words.length - 1) {
                roll.appendChild(document.createTextNode(' '));
                charIndex++; // Increment index for the space
            }
        });
    });
}

/* ============================================================
   EXPERTISE CARD — Perfectly smooth height animation
   Measures real scrollHeight so transition knows exact target.
   ============================================================ */
function initExpCardSmooth() {
    const COLLAPSED_H = 88; // px — dots row + title
    document.querySelectorAll('.exp-card').forEach(card => {
        // 1. Expand to natural height to measure it
        card.style.height = 'auto';
        card.style.overflow = 'visible';
        const fullH = card.scrollHeight;

        // 2. Snap back to collapsed (no animation yet)
        card.style.transition = 'none';
        card.style.height = COLLAPSED_H + 'px';
        card.style.overflow = 'hidden';

        // 3. Re-enable transition on next frame
        requestAnimationFrame(() => {
            card.style.transition = '';
        });

        // 4. Hover: animate to exact measured height
        card.addEventListener('mouseenter', () => {
            card.style.height = fullH + 'px';
        });
        card.addEventListener('mouseleave', () => {
            card.style.height = COLLAPSED_H + 'px';
        });
    });
}

/* ============================================================
   EXPERTISE NETWORK CANVAS — Animated node-line network
   Draws at low opacity in the section background.
   ============================================================ */
function initExpertiseNetwork() {
    const canvas = document.getElementById('expertise-network');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;
    let animFrame;

    function resize() {
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    const NODE_COUNT = 28;
    const MAX_DIST   = 130;
    const SPEED      = 0.35;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r:  1.5 + Math.random() * 1.5
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connecting lines
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx   = nodes[i].x - nodes[j].x;
                const dy   = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.12;
                    ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
                    ctx.lineWidth   = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.10)';
            ctx.fill();
        });

        // Move nodes (bounce off edges)
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0 || node.x > canvas.width)  node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height)  node.vy *= -1;
        });

        animFrame = requestAnimationFrame(draw);
    }

    draw();
}

function revealPageContent() {

    // Each entry: [selector, CSS class, delay in seconds]
    const reveals = [
        ['#main-nav',          'reveal-nav',   0.6],
        ['.hero-title',        'reveal-up',    0.7],
        ['.image-wrapper',     'reveal-scale', 0.8],
        ['.hero-subtitle',     'reveal-up',    0.9],
        ['.social-side-bar li:nth-child(1)', 'reveal-left', 1.0],
        ['.social-side-bar li:nth-child(2)', 'reveal-left', 1.1],
        ['.social-side-bar li:nth-child(3)', 'reveal-left', 1.2],
        ['.hero-actions-row a:nth-child(1)', 'reveal-up',   1.1],
        ['.hero-actions-row a:nth-child(2)', 'reveal-up',   1.2],
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
    // ── Text Roll: build character layers before anything reveals ──
    initTextRoll();

    // ── Expertise Card: smooth expand + network canvas ──
    initExpCardSmooth();
    initExpertiseNetwork();

    // ── Intro: lock scroll, then dismiss automatically ──
    document.body.classList.add('loading');

    const overlay = document.getElementById('intro-overlay');
    if (overlay) {
        // Automatically dismiss the intro and play sound when the website opens
        setTimeout(() => {
            dismissIntro();
        }, 300);
    }

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

    // ── Back-to-top button ──
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }

    // ── Interactive Background (Parallax) ──
    const aboutGrid = document.querySelector('.about-grid');
    const netNetwork = document.querySelector('.background-network');
    if (aboutGrid && netNetwork) {
        aboutGrid.addEventListener('mousemove', (e) => {
            const rect = aboutGrid.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            netNetwork.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        });
    }

    // ── Scroll Spy Navigation ──
    const spySections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    if (spySections.length > 0 && navItems.length > 0) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.getAttribute('href') === `#${entry.target.id}`) {
                            item.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.4 });
        spySections.forEach(sec => spyObserver.observe(sec));
    }

    // ── Page Transitions (CV Link) ──
    // Intercept clicks to cv.html to add a fade-out effect if they are direct links (not modal)
    // Here we mainly transition after the correct modal password.
    // Let's attach to any link that leads to a local HTML file
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.href;
            document.body.classList.add('page-transitioning');
            setTimeout(() => {
                window.location.href = target;
            }, 500);
        });
    });
});
