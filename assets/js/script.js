document.addEventListener('DOMContentLoaded', () => {
    // Typed.js Initialization
    new Typed('#typed', {
        strings: ['Innovative Systems.', 'Scalable Software.', 'AI-Driven Solutions.', 'IoT Ecosystems.'],
        typeSpeed: 40,
        backSpeed: 20,
        loop: true,
        cursorChar: '_'
    });

    // Scroll Progress Bar
    const progressBar = document.querySelector('.scroll-progress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    // Nav Sticky behavior
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

    // Close mobile nav on link click
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scrolling
    const allLinks = document.querySelectorAll('a[href^="#"]');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Progress bar animation on scroll
    const progressBars = document.querySelectorAll('.progress');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = targetWidth;
                }, 100);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    progressBars.forEach(bar => skillObserver.observe(bar));

    // Section reveal logic
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

    // Custom Cursor Logic
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    const interactables = document.querySelectorAll('a, button, .expertise-card, .btn');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('active');
            outline.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('active');
            outline.classList.remove('active');
        });
    });

    // Magnetic Buttons
    const magneticBtns = document.querySelectorAll('.btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.pageX - position.left - position.width / 2;
            const y = e.pageY - position.top - position.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
});
