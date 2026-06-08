// about.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Data Configuration ---
  // Modify or add items here up to 10. 
  // Make sure to replace the placeholder "src" links with your actual image paths from assets/img
  const aboutData = [
    {
      name: "Harry Otieno Mokaya",
      designation: "Software Engineer",
      quote: "I'm a Software Engineer from Nairobi with roots in Migori County. I work across multiple domains from web and mobile development to machine learning and IoT systems.",
      src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Practical Solutions",
      designation: "Problem Solver",
      quote: "My focus is on building practical solutions that solve real problems. Whether it's developing responsive web applications, training ML models, or creating IoT prototypes, I enjoy the challenge of turning ideas into working products.",
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Beyond Coding",
      designation: "Tech Enthusiast",
      quote: "When I'm not coding, you'll find me exploring fitness tech and wellness applications. I believe technology should be accessible and beneficial to everyone, which drives my approach to development.",
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Web & Mobile",
      designation: "Frontend & Backend",
      quote: "I specialize in creating seamless user experiences using modern web and mobile frameworks. Building interfaces that look great and function perfectly is what I strive for.",
      src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Machine Learning",
      designation: "AI Integration",
      quote: "I'm passionate about the potential of machine learning. Training models and integrating AI features into applications allows me to build smarter, predictive systems.",
      src: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "IoT Prototypes",
      designation: "Hardware meets Software",
      quote: "Bridging the gap between the physical and digital worlds is fascinating. I enjoy tinkering with IoT devices and building prototypes that connect hardware to the cloud.",
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Fitness Tech",
      designation: "Wellness Innovation",
      quote: "My personal interest in health translates into my technical pursuits. I love exploring how technology can be used to improve fitness, track progress, and promote overall wellness.",
      src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Accessible Tech",
      designation: "Inclusive Design",
      quote: "Technology should leave no one behind. I try to adopt an accessible approach to design and development, ensuring that my products are usable by as many people as possible.",
      src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Lifelong Learner",
      designation: "Continuous Improvement",
      quote: "The tech industry moves fast, and so do I. I'm constantly learning new languages, frameworks, and methodologies to keep my skills sharp and relevant.",
      src: "https://images.unsplash.com/photo-1513258496099-48166314a108?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Let's Connect",
      designation: "Open to Opportunities",
      quote: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision. Let's build something amazing together.",
      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // --- DOM Elements ---
  const imageContainer = document.getElementById('about-image-container');
  const nameEl = document.getElementById('about-name');
  const designationEl = document.getElementById('about-designation');
  const quoteEl = document.getElementById('about-quote');
  const textContainer = document.getElementById('about-text-container');
  const prevBtn = document.getElementById('about-prev-btn');
  const nextBtn = document.getElementById('about-next-btn');

  // Verify all elements exist before proceeding
  if (!imageContainer || !textContainer || !prevBtn || !nextBtn) return;

  // --- State ---
  let activeIndex = 0;
  let containerWidth = imageContainer.offsetWidth || 1200;
  const length = aboutData.length;

  // --- Initialization ---
  // Create and append images
  aboutData.forEach((item, index) => {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    img.className = 'about-image';
    img.dataset.index = index;
    // Preload image to avoid pop-in
    img.loading = 'lazy';
    imageContainer.appendChild(img);
  });

  const images = document.querySelectorAll('.about-image');

  // --- Helpers ---
  function calculateGap(width) {
    const minWidth = 1024;
    const maxWidth = 1456;
    const minGap = 60;
    const maxGap = 86;
    if (width <= minWidth) return minGap;
    if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
    return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
  }

  function updateLayout() {
    containerWidth = imageContainer.offsetWidth || 1200;
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;

    images.forEach((img, index) => {
      // Clean previous state
      img.classList.remove('is-active', 'is-left', 'is-right');
      img.style.transform = ''; 

      // Calculate relative positions
      const isLeft = (activeIndex - 1 + length) % length === index;
      const isRight = (activeIndex + 1) % length === index;
      const isActive = index === activeIndex;

      // Apply appropriate styles replicating the Framer Motion transforms
      if (isActive) {
        img.classList.add('is-active');
      } else if (isLeft) {
        img.classList.add('is-left');
        img.style.transform = `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`;
      } else if (isRight) {
        img.classList.add('is-right');
        img.style.transform = `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`;
      }
    });
  }

  function renderContent() {
    const item = aboutData[activeIndex];

    // Trigger exit animation (mirrors framer-motion 'exit' variant)
    textContainer.style.opacity = '0';
    textContainer.style.transform = 'translateY(20px)';
    
    // Wait for exit transition to complete before swapping content
    setTimeout(() => {
      nameEl.textContent = item.name;
      designationEl.textContent = item.designation;
      
      // Clear quote and append animated spans
      quoteEl.innerHTML = '';
      const words = item.quote.split(' ');
      words.forEach((word, i) => {
        const span = document.createElement('span');
        // Add non-breaking space for correct layout
        span.textContent = word + '\u00A0';
        span.className = 'about-word';
        // Delay corresponds to framer-motion: delay: 0.025 * i
        span.style.animationDelay = `${i * 0.025}s`;
        quoteEl.appendChild(span);
      });

      // Trigger enter animation (mirrors framer-motion 'animate' variant)
      textContainer.style.opacity = '1';
      textContainer.style.transform = 'translateY(0)';
    }, 300); // 300ms matches the CSS transition duration
  }

  // --- Handlers ---
  function handleNext() {
    activeIndex = (activeIndex + 1) % length;
    updateLayout();
    renderContent();
  }

  function handlePrev() {
    activeIndex = (activeIndex - 1 + length) % length;
    updateLayout();
    renderContent();
  }

  // --- Event Listeners ---
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrev);

  // Resize observer to recalculate gaps responsively
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateLayout);
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    // Only handle arrow keys if the section is in viewport to prevent page jumping
    const section = document.getElementById('about');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom >= 0;
    
    if (inViewport) {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    }
  });

  // --- Start ---
  updateLayout();
  renderContent();
});
