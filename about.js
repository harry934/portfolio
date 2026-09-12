// about.js
document.addEventListener('DOMContentLoaded', () => {
  const aboutData = [
    {
      name: "Harry Otieno Mokaya",
      designation: "Software & DevOps Engineer",
      quote: "I'm a Software Engineer from Nairobi with roots in Migori County. I enjoy building digital products and exploring different areas of technology. For me, the best part is turning ideas into something real that people can interact with and benefit from.",
      src: "assets/img/chillen.webp"
    },
    {
      name: "Networking",
      designation: "Open to Opportunities",
      quote: "I enjoy meeting people, exchanging ideas, and collaborating on projects that challenge me to grow. If you're building something meaningful or just want to connect, I'd be glad to have the conversation.",
      src: "assets/img/nss.webp"
    },
    {
      name: "Building Solutions",
      designation: "Problem Solver",
      quote: "I really enjoy solving real world problems through technology. Whether it's designing systems, developing platforms, or improving existing ideas, I like the process of taking something from concept to a working solution that creates actual value.",
      src: "assets/img/IoT.webp"
    },
    {
      name: "Beyond Coding",
      designation: "Nature & Adventure",
      quote: "When I'm away from the screen, I enjoy taking walks, spending time outdoors, and exploring new places. I enjoy nature, adventure, and moments that help me reset, stay inspired, and enjoy life beyond technology.",
      src: "assets/img/pfp1.webp"
    },
    {
      name: "Gym & Discipline",
      designation: "Fitness Lifestyle",
      quote: "Outside tech, I spend time in the gym and genuinely enjoy training. Fitness has taught me consistency, discipline, and showing up even when motivation isn't there. I try to carry those qualities into my projects and personal growth as well.",
      src: "assets/img/gym.webp"
    },
    {
      name: "Always Improving",
      designation: "Continuous Learning",
      quote: "Technology changes quickly, and I enjoy keeping up through projects, experimentation, and learning new approaches. I see growth as an ongoing process and always try to leave every project knowing more than when I started.",
      src: "assets/img/tech.webp"
    }
  ];

  const imageContainer = document.getElementById('about-image-container');
  const nameEl = document.getElementById('about-name');
  const designationEl = document.getElementById('about-designation');
  const quoteEl = document.getElementById('about-quote');
  const textContainer = document.getElementById('about-text-container');
  const prevBtns = document.querySelectorAll('.about-prev-btn');
  const nextBtns = document.querySelectorAll('.about-next-btn');

  if (!imageContainer || !textContainer || !prevBtns.length || !nextBtns.length) return;

  let activeIndex = 0;
  let isTransitioning = false;
  const length = aboutData.length;
  const TRANSITION_MS = 900;

  aboutData.forEach((item, index) => {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    img.className = 'about-image';
    img.dataset.index = index;
    img.loading = 'eager';
    img.draggable = false;
    imageContainer.appendChild(img);
  });

  const images = document.querySelectorAll('.about-image');

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getOffset(index, active, len) {
    let diff = index - active;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  }

  function updateLayout() {
    const mobile = isMobile();
    const maxVisible = mobile ? 1 : 2;
    const depthStep = mobile ? 70 : 110;
    const xSpread = mobile ? 16 : 24;

    images.forEach((img, index) => {
      img.classList.remove(
        'is-active', 'is-left', 'is-right', 'is-far-left', 'is-far-right', 'is-depth-hidden'
      );
      img.style.transform = '';
      img.style.zIndex = '';
      img.style.opacity = '';
      img.style.filter = '';
      img.style.pointerEvents = '';

      const offset = getOffset(index, activeIndex, length);
      const absOffset = Math.abs(offset);

      if (absOffset > maxVisible) {
        img.classList.add('is-depth-hidden');
        img.style.transform = 'translate(-50%, -50%) translate3d(0, 0, -320px) scale(0.72) rotateY(0deg)';
        return;
      }

      const xPercent = offset * xSpread;
      const zDepth = -absOffset * depthStep;
      const scale = Math.max(0.78, 1 - absOffset * (mobile ? 0.09 : 0.11));
      const rotateY = -offset * (mobile ? 8 : 12);
      const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.82 : 0.55;
      const blur = absOffset === 0 ? 0 : absOffset === 1 ? 0.4 : 0.8;

      img.style.zIndex = String(100 - absOffset);
      img.style.opacity = String(opacity);
      img.style.filter = blur ? `blur(${blur}px)` : '';
      img.style.pointerEvents = absOffset === 0 ? 'auto' : 'auto';
      img.style.transform =
        `translate(-50%, -50%) translate3d(${xPercent}%, 0, ${zDepth}px) ` +
        `scale(${scale}) rotateY(${rotateY}deg)`;

      if (offset === 0) img.classList.add('is-active');
      else if (offset === -1) img.classList.add('is-left');
      else if (offset === 1) img.classList.add('is-right');
      else if (offset === -2) img.classList.add('is-far-left');
      else if (offset === 2) img.classList.add('is-far-right');
    });
  }

  function renderContent() {
    const item = aboutData[activeIndex];

    textContainer.style.opacity = '0';
    textContainer.style.transform = 'translateY(12px)';

    window.setTimeout(() => {
      nameEl.textContent = item.name;
      designationEl.textContent = item.designation;

      quoteEl.innerHTML = '';
      const words = item.quote.split(' ');
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word + '\u00A0';
        span.className = 'about-word';
        span.style.animationDelay = `${i * 0.02}s`;
        quoteEl.appendChild(span);
      });

      requestAnimationFrame(() => {
        textContainer.style.opacity = '1';
        textContainer.style.transform = 'translateY(0)';
      });
    }, 220);
  }

  function goTo(index) {
    const nextIndex = (index + length) % length;
    if (nextIndex === activeIndex || isTransitioning) return;

    isTransitioning = true;
    activeIndex = nextIndex;
    updateLayout();
    renderContent();

    window.setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_MS);
  }

  function handleNext() {
    goTo(activeIndex + 1);
  }

  function handlePrev() {
    goTo(activeIndex - 1);
  }

  prevBtns.forEach(btn => btn.addEventListener('click', handlePrev));
  nextBtns.forEach(btn => btn.addEventListener('click', handleNext));

  images.forEach((img, index) => {
    img.addEventListener('click', () => {
      if (index !== activeIndex && !img.classList.contains('is-depth-hidden')) {
        goTo(index);
      }
    });
  });

  let touchStartX = 0;
  const swipeThreshold = 40;

  imageContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  imageContainer.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) < swipeThreshold) return;
    if (diff < 0) handleNext();
    else handlePrev();
    e.stopPropagation();
  }, { passive: true });

  window.addEventListener('resize', () => {
    requestAnimationFrame(updateLayout);
  });

  window.addEventListener('keydown', (e) => {
    const section = document.getElementById('about');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom >= 0;

    if (inViewport) {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    }
  });

  updateLayout();
  renderContent();
});
