/* ============================================================
   INTELLIGENT EVENT THEMING SYSTEM (Engine)
   Detects current date and applies subtle theming layers to
   the portfolio without breaking the core identity.
   ============================================================ */

const EVENTS_CONFIG = [
    // 🇰🇪 Kenyan Holidays & Celebrations
    { key: 'new-year', date: '01-01', name: 'New Year\'s Day', desc: 'Happy New Year!', emoji: '🎆', particles: true },
    { key: 'womens-day', date: '03-08', name: 'International Women\'s Day', desc: 'Celebrating the achievements of women.', emoji: '💜', particles: false },
    { key: 'world-health', date: '04-07', name: 'World Health Day', desc: 'Health for all.', emoji: '🩺', particles: false },
    { key: 'earth-day', date: '04-22', name: 'Earth Day', desc: 'Invest in our planet.', emoji: '🌍', particles: true },
    { key: 'labour-day', date: '05-01', name: 'Labour Day', desc: 'Celebrating workers everywhere.', emoji: '🛠️', particles: false },
    { key: 'madaraka-day', date: '06-01', name: 'Madaraka Day', desc: 'Commemorating Kenya\'s internal self-rule.', emoji: '🇰🇪', particles: true },
    { key: 'african-child', date: '06-16', name: 'Day of the African Child', desc: 'Empowering the next generation.', emoji: '👦🏾', particles: false },
    { key: 'africa-day', date: '06-25', name: 'Africa Day', desc: 'Celebrating African unity.', emoji: '🌍', particles: false }, // Using late celebration date from plan
    { key: 'moi-day', date: '10-10', name: 'Moi Day / Huduma Day', desc: 'Service and volunteerism.', emoji: '🇰🇪', particles: false },
    { key: 'mashujaa-day', date: '10-20', name: 'Mashujaa Day', desc: 'Honoring our heroes.', emoji: '🦸🏾‍♂️', particles: true },
    { key: 'jamhuri-day', date: '12-12', name: 'Jamhuri Day', desc: 'Kenya\'s Republic Day.', emoji: '🇰🇪', particles: true },
    { key: 'christmas', date: '12-25', name: 'Christmas Day', desc: 'Merry Christmas and Happy Holidays!', emoji: '🎄', particles: true },
    { key: 'nye', date: '12-31', name: 'New Year\'s Eve', desc: 'Ringing in the new year.', emoji: '🥂', particles: true },

    // 🌍 International Awareness Days
    { key: 'valentines', date: '02-14', name: 'Valentine\'s Day', desc: 'Happy Valentine\'s Day.', emoji: '❤️', particles: true },
    { key: 'poetry-day', date: '03-21', name: 'World Poetry Day', desc: 'Celebrating poetic expression.', emoji: '📜', particles: false },
    { key: 'book-day', date: '04-23', name: 'World Book Day', desc: 'Celebrate reading and books.', emoji: '📚', particles: false },
    { key: 'star-wars', date: '05-04', name: 'Star Wars Day', desc: 'May the 4th be with you.', emoji: '⚔️', particles: true },
    { key: 'environment-day', date: '06-05', name: 'World Environment Day', desc: 'Protecting our home.', emoji: '🌱', particles: false },
    { key: 'music-day', date: '06-21', name: 'World Music Day', desc: 'Make music everywhere.', emoji: '🎵', particles: true },
    { key: 'us-independence', date: '07-04', name: 'US Independence Day', desc: 'Happy 4th of July.', emoji: '🎆', particles: false },
    { key: 'youth-day', date: '08-12', name: 'International Youth Day', desc: 'Empowering youth worldwide.', emoji: '🌟', particles: false },
    { key: 'charity-day', date: '09-05', name: 'Intl. Day of Charity', desc: 'Promoting charitable efforts.', emoji: '🤝', particles: false },
    { key: 'older-persons', date: '10-01', name: 'Intl. Day of Older Persons', desc: 'Honoring our elders.', emoji: '👴🏾', particles: false },
    { key: 'teachers-day', date: '10-05', name: 'World Teachers\' Day', desc: 'Thanking educators.', emoji: '🍎', particles: false },
    { key: 'remembrance', date: '11-11', name: 'Remembrance Day', desc: 'Lest we forget.', emoji: '🌺', particles: false },
    { key: 'toilet-day', date: '11-19', name: 'World Toilet Day', desc: 'Raising sanitation awareness.', emoji: '🚽', particles: false },
    { key: 'aids-day', date: '12-01', name: 'World AIDS Day', desc: 'Standing in solidarity.', emoji: '🎗️', particles: false },
    { key: 'human-rights', date: '12-10', name: 'Human Rights Day', desc: 'Dignity, freedom, and justice for all.', emoji: '⚖️', particles: false }
];

class EventThemeEngine {
    constructor() {
        this.activeEvent = null;
        this.particleCtx = null;
        this.particleAnimation = null;
        this.particles = [];
        
        this.init();
    }

    init() {
        // 1. Detect event (allow override via ?preview=event-key)
        const params = new URLSearchParams(window.location.search);
        const previewKey = params.get('preview');
        
        if (previewKey) {
            this.activeEvent = EVENTS_CONFIG.find(e => e.key === previewKey);
            this.initPreviewPanel();
        } else {
            this.activeEvent = this.detectTodayEvent();
        }

        if (this.activeEvent) {
            this.applyTheme();
        }
    }

    detectTodayEvent() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${month}-${day}`;
        
        // Exact match
        let match = EVENTS_CONFIG.find(e => e.date === todayStr);
        if (match) return match;
        
        // Minor buffer for major events (+/- 1 day logic can be added here)
        // For simplicity, we just do exact matching as per plan
        return null;
    }

    applyTheme() {
        // 1. Set data attribute on body for CSS targeting
        document.body.setAttribute('data-event', this.activeEvent.key);
        
        // 2. Inject components
        this.injectBanner();
        this.injectWidget();
        
        // 3. Init particles if enabled for this event
        if (this.activeEvent.particles) {
            this.initParticles();
        }
    }

    injectBanner() {
        // Check if user dismissed it this session
        if (sessionStorage.getItem(`event_banner_dismissed_${this.activeEvent.key}`)) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'event-banner';
        banner.className = 'event-banner';
        banner.innerHTML = `
            <div class="event-banner-content">
                <span class="event-banner-emoji">${this.activeEvent.emoji}</span>
                <span class="event-banner-title">${this.activeEvent.name}</span>
                <span class="event-banner-desc"> — ${this.activeEvent.desc}</span>
            </div>
            <button class="event-banner-close" aria-label="Dismiss">&times;</button>
        `;
        
        // Insert before header
        const header = document.querySelector('.header');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(banner, header);
        } else {
            document.body.prepend(banner);
        }

        // Adjust CSS var for header push
        document.documentElement.style.setProperty('--banner-offset', '48px');
        
        // Animate in
        setTimeout(() => banner.classList.add('visible'), 500);

        // Bind close button
        banner.querySelector('.event-banner-close').addEventListener('click', () => {
            this.dismissBanner(banner);
        });
        
        // Auto-hide after 8 seconds unless hovered
        let hideTimeout;
        const startHideTimer = () => {
            hideTimeout = setTimeout(() => this.dismissBanner(banner), 8000);
        };
        const stopHideTimer = () => clearTimeout(hideTimeout);
        
        banner.addEventListener('mouseenter', stopHideTimer);
        banner.addEventListener('mouseleave', startHideTimer);
        startHideTimer();
    }

    dismissBanner(banner) {
        banner.classList.remove('visible');
        document.documentElement.style.setProperty('--banner-offset', '0px');
        sessionStorage.setItem(`event_banner_dismissed_${this.activeEvent.key}`, 'true');
        setTimeout(() => banner.remove(), 500);
    }

    injectWidget() {
        const todayStr = new Date().toDateString();
        // Limit expanded view to once per day per event
        const hasSeenExpanded = localStorage.getItem(`event_widget_expanded_${this.activeEvent.key}_${todayStr}`);

        const widget = document.createElement('div');
        widget.id = 'event-widget';
        widget.className = 'event-widget';
        
        // Formatted date
        const d = new Date();
        const dateString = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

        widget.innerHTML = `
            <!-- Badge Mode -->
            <div class="event-widget-badge">
                <span class="event-widget-badge-emoji">${this.activeEvent.emoji}</span>
                <span class="event-widget-badge-text">Today's Celebration</span>
            </div>
            
            <!-- Card Mode -->
            <div class="event-widget-card">
                <div class="event-widget-card-header">
                    <div class="event-widget-card-title">
                        ${this.activeEvent.emoji} ${this.activeEvent.name}
                    </div>
                    <button class="event-widget-card-close">Dismiss</button>
                </div>
                <div class="event-widget-card-date">${dateString}</div>
                <div class="event-widget-card-desc">${this.activeEvent.desc}</div>
            </div>
        `;
        
        document.body.appendChild(widget);

        // Animate in
        setTimeout(() => {
            widget.classList.add('visible');
            if (!hasSeenExpanded) {
                widget.classList.add('expanded');
                localStorage.setItem(`event_widget_expanded_${this.activeEvent.key}_${todayStr}`, 'true');
            }
        }, 1000);

        // Bind events
        widget.querySelector('.event-widget-badge').addEventListener('click', () => {
            widget.classList.add('expanded');
        });

        widget.querySelector('.event-widget-card-close').addEventListener('click', () => {
            widget.classList.remove('expanded');
        });
    }

    initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'event-particles';
        canvas.className = 'event-particles';
        document.body.appendChild(canvas);
        
        this.particleCtx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        
        // Read color from CSS var (fallback to rgba if not resolved properly yet)
        // Wait a tick for CSS to apply
        setTimeout(() => {
            const style = getComputedStyle(document.body);
            let pColor = style.getPropertyValue('--event-particle-color').trim();
            if (!pColor || pColor === 'transparent') {
                pColor = 'rgba(255,255,255,0.2)'; // fallback
            }

            this.createParticles(canvas.width, canvas.height, pColor);
            canvas.classList.add('active');
            this.animateParticles(canvas);
            
            // Pause animation when tab not visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(this.particleAnimation);
                } else {
                    this.animateParticles(canvas);
                }
            });
        }, 50);
    }

    createParticles(w, h, colorStr) {
        const count = window.innerWidth < 768 ? 8 : 15;
        this.particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * -0.5 - 0.2, // Float upwards slowly
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.1,
            color: colorStr
        }));
    }

    animateParticles(canvas) {
        if (!this.particleCtx) return;
        
        this.particleCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.particles.forEach(p => {
            this.particleCtx.beginPath();
            this.particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            
            // Try to extract rgb from rgba or just use the color string directly if it's rgba
            this.particleCtx.fillStyle = p.color;
            this.particleCtx.fill();
            
            p.y += p.speedY;
            p.x += p.speedX;
            
            // Wrap around
            if (p.y + p.size < 0) {
                p.y = canvas.height + p.size;
                p.x = Math.random() * canvas.width;
            }
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
        });
        
        this.particleAnimation = requestAnimationFrame(() => this.animateParticles(canvas));
    }
    
    // Developer tool to test events
    initPreviewPanel() {
        const panel = document.createElement('div');
        panel.className = 'event-preview-panel';
        panel.innerHTML = `
            <div style="margin-bottom:5px;font-weight:bold;">Event Preview</div>
            <select id="event-preview-select" style="width:100%;padding:5px;">
                <option value="">None</option>
                ${EVENTS_CONFIG.map(e => `<option value="${e.key}" ${this.activeEvent && this.activeEvent.key === e.key ? 'selected' : ''}>${e.emoji} ${e.name}</option>`).join('')}
            </select>
        `;
        document.body.appendChild(panel);
        
        document.getElementById('event-preview-select').addEventListener('change', (e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
                url.searchParams.set('preview', e.target.value);
            } else {
                url.searchParams.delete('preview');
            }
            window.location.href = url.toString();
        });
    }
}

// Expose and run
window.EventTheme = new EventThemeEngine();
window.EventTheme.config = EVENTS_CONFIG;
