// Horizontal Slide Navigation
let currentSlide = 0;
const slidesContainer = document.querySelector('.slides-container');
const prevBtn = document.querySelector('.nav-prev');
const nextBtn = document.querySelector('.nav-next');
const progressDotsContainer = document.querySelector('.progress-dots');

// Derive slide count from the DOM so adding/removing <section class="slide"> is all you need
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;


// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Create one progress dot per slide
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('progress-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    progressDotsContainer.appendChild(dot);
  });

  // Initial state
  updateNavigation();

  console.log('CrazyForAI — Slide deck ready (' + totalSlides + ' slides)');
});

// Navigation functions
let slideDirection = 0; // 1 = forward, -1 = back

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    slideDirection = 1;
    currentSlide++;
    updateSlides();
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    slideDirection = -1;
    currentSlide--;
    updateSlides();
  }
}

function goToSlide(index) {
  if (index >= 0 && index < totalSlides) {
    slideDirection = index > currentSlide ? 1 : -1;
    currentSlide = index;
    updateSlides();
  }
}

function updateSlides() {
  // Move slides container
  const offset = -currentSlide * 100;
  slidesContainer.style.transform = `translateX(${offset}%)`;

  // Entrance animation on incoming slide
  slides.forEach(s => s.classList.remove('slide--entering'));
  const entering = slides[currentSlide];
  entering.classList.add('slide--entering');
  entering.addEventListener('animationend', () => entering.classList.remove('slide--entering'), { once: true });

  // Update UI
  updateNavigation();
  updateProgressDots();
  slideTimerReset();

  // Reset users slide reveal when leaving
  if (usersContent && currentSlide !== USERS_SLIDE_INDEX) {
    usersContent.classList.remove('users-revealed');
  }

  // Reset compare slide collapse when leaving
  if (compareSlideEl && currentSlide !== COMPARE_SLIDE_INDEX) {
    compareSlideEl.classList.remove('tools-collapsed');
  }

  // Load iframe only when its slide is active, unload when leaving
  if (lazyIframe && LAZY_IFRAME_INDEX !== -1) {
    const loader = document.getElementById('iframe-loader');
    if (currentSlide === LAZY_IFRAME_INDEX) {
      if (!lazyIframe.getAttribute('src')) {
        if (loader) loader.style.display = '';
        lazyIframe.src = lazyIframe.dataset.src;
      }
    } else {
      lazyIframe.removeAttribute('src');
      if (loader) loader.style.display = '';
    }
  }
}

function updateNavigation() {
  // Disable/enable navigation buttons
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
}

function updateProgressDots() {
  const dots = document.querySelectorAll('.progress-dot');
  dots.forEach((dot, index) => {
    if (index === currentSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Lazy-load iframe only when its slide is active
const lazyIframe = document.querySelector('iframe[data-src]');
const lazyIframeSlideEl = lazyIframe ? lazyIframe.closest('.slide') : null;
const LAZY_IFRAME_INDEX = lazyIframeSlideEl ? [...slides].indexOf(lazyIframeSlideEl) : -1;

// Users slide reveal index
const usersSlideEl = document.querySelector('.slide--users');
const USERS_SLIDE_INDEX = usersSlideEl ? [...slides].indexOf(usersSlideEl) : -1;
const usersContent = document.getElementById('users-content');

// Compare slide collapse index
const compareSlideEl = document.getElementById('compare-slide');
const COMPARE_SLIDE_INDEX = compareSlideEl ? [...slides].indexOf(compareSlideEl) : -1;

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    const video = slides[currentSlide].querySelector('.slide-video');
    if (video) {
      video.paused ? video.play() : video.pause();
    } else {
      swStart();
      nextSlide();
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    swStart();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'Home') {
    e.preventDefault();
    goToSlide(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    goToSlide(totalSlides - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentSlide === USERS_SLIDE_INDEX && usersContent) {
      usersContent.classList.add('users-revealed');
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (currentSlide === USERS_SLIDE_INDEX && usersContent) {
      usersContent.classList.remove('users-revealed');
    }
  }
});

// Speed controls for all videos
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.slide-video').forEach(video => {
    const defaultSpeed = parseFloat(video.dataset.defaultSpeed) || 0.5;
    const speeds = [0.5, 1, 1.25, 1.5, 2, 3];
    const bar = document.createElement('div');
    bar.className = 'video-speed-bar';
    speeds.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'video-speed-btn';
      btn.textContent = s + 'x';
      if (s === defaultSpeed) btn.classList.add('active');
      btn.addEventListener('click', () => {
        video.playbackRate = s;
        bar.querySelectorAll('.video-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      bar.appendChild(btn);
    });
    video.playbackRate = defaultSpeed;
    video.parentElement.appendChild(bar);

  });
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;

slidesContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

slidesContainer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;
  // Only navigate if horizontal movement dominates and exceeds threshold
  if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
    diffX > 0 ? nextSlide() : prevSlide();
  }
}, { passive: true });

// Expose functions globally for onclick handlers
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;

// Skip to bonus button
const firstHackerSlide = [...slides].findIndex(s => s.querySelector('.path-badge.path-advanced'));
const skipBtn = document.getElementById('skip-to-bonus');
if (skipBtn && firstHackerSlide !== -1) {
  skipBtn.addEventListener('click', () => goToSlide(firstHackerSlide));
}

// Compare slide — click Replit to collapse others, click LIVE to launch rocket
if (compareSlideEl) {
  const replitNode = compareSlideEl.querySelector('.tree-split--three .tree-split-col:first-child');
  const liveLabel = compareSlideEl.querySelector('.tree-label--live-ai');
  if (replitNode) {
    replitNode.style.cursor = 'pointer';
    replitNode.addEventListener('click', () => {
      compareSlideEl.classList.toggle('tools-collapsed');
    });
  }
  if (liveLabel) {
    liveLabel.style.cursor = 'pointer';
    liveLabel.addEventListener('click', () => {
      launchRocketAndConfetti();
    });
  }
}

// Users slide — click image to reveal/toggle side text
const usersImg = usersContent ? usersContent.querySelector('.users-img') : null;
if (usersImg) {
  usersImg.style.cursor = 'pointer';
  usersImg.addEventListener('click', () => {
    usersContent.classList.toggle('users-revealed');
  });
}

console.log('CrazyForAI — Navigation initialized');

// Stopwatch — counts down from 25:00, starts on first ArrowRight
const stopwatchEl = document.getElementById('stopwatch');
let swStarted = false;
let swTotal = 25 * 60; // seconds
let swRemaining = swTotal;
let swInterval = null;

function swTick() {
  swRemaining--;
  const m = Math.floor(Math.abs(swRemaining) / 60);
  const s = Math.abs(swRemaining) % 60;
  const neg = swRemaining < 0 ? '-' : '';
  stopwatchEl.textContent = neg + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

  // Pulse red on every 5-minute mark (except start)
  const elapsed = swTotal - swRemaining;
  if (elapsed > 0 && elapsed % 300 === 0) {
    stopwatchEl.classList.remove('pulse-alert');
    void stopwatchEl.offsetWidth; // reflow to restart animation
    stopwatchEl.classList.add('pulse-alert');
  }

  stopwatchEl.classList.toggle('warn', swRemaining <= 300 && swRemaining > 0);
  stopwatchEl.classList.toggle('over', swRemaining <= 0);
}

function swStart() {
  if (swStarted) return;
  swStarted = true;
  swInterval = setInterval(swTick, 1000);
  // Don't call slideTimerReset here — updateSlides() already calls it
}

// Per-slide timer — intelligent budgets based on content
const slideTimerEl = document.getElementById('slide-timer');
const TOTAL_BUDGET = 20 * 60; // 20 minutes in seconds
const VIDEO_BUFFER = 30; // extra seconds per video slide for commentary

// Build per-slide budget map
const slideBudgets = [];
let videoBudgetTotal = 0;
let talkSlideCount = 0;

slides.forEach(slide => {
  const isHacker = !!slide.querySelector('.path-badge.path-advanced');
  const video = slide.querySelector('.slide-video');
  if (isHacker) {
    slideBudgets.push({ type: 'hacker', budget: 0 });
  } else if (video) {
    const speed = parseFloat(video.dataset.defaultSpeed) || 0.5;
    const duration = video.duration || 0;
    // Duration may not be loaded yet — we'll patch on metadata load
    slideBudgets.push({ type: 'video', budget: 0, video, speed });
  } else {
    slideBudgets.push({ type: 'talk', budget: 0 });
    talkSlideCount++;
  }
});

// Recalculate all budgets once video metadata is available
function recalcBudgets() {
  videoBudgetTotal = 0;
  slideBudgets.forEach(sb => {
    if (sb.type === 'video') {
      const dur = sb.video.duration || 0;
      sb.budget = Math.ceil(dur / sb.speed) + VIDEO_BUFFER;
      videoBudgetTotal += sb.budget;
    }
  });
  const talkBudget = talkSlideCount > 0
    ? Math.floor((TOTAL_BUDGET - videoBudgetTotal) / talkSlideCount)
    : TOTAL_BUDGET;
  slideBudgets.forEach(sb => {
    if (sb.type === 'talk') sb.budget = talkBudget;
  });
}

// Patch budgets as video metadata loads
slides.forEach((slide, i) => {
  const video = slide.querySelector('.slide-video');
  if (video) {
    video.addEventListener('loadedmetadata', recalcBudgets);
  }
});
// Initial calc (durations may be 0 if not yet loaded)
recalcBudgets();

let slideTimerRemaining = 0;
let slideTimerInterval = null;
let slideTimerBank = 0;

function getSlidebudget() {
  return slideBudgets[currentSlide] ? slideBudgets[currentSlide].budget : 0;
}

function slideTimerReset() {
  // Only bank leftover when advancing forward
  if (slideTimerInterval && slideDirection === 1) {
    slideTimerBank += slideTimerRemaining;
  }
  clearInterval(slideTimerInterval);
  slideTimerInterval = null;

  const sb = slideBudgets[currentSlide];
  // Hide timer on hacker slides
  if (!sb || sb.type === 'hacker') {
    slideTimerEl.style.display = 'none';
    return;
  }
  slideTimerEl.style.display = '';

  slideTimerRemaining = sb.budget + slideTimerBank;
  slideTimerBank = 0;
  slideTimerEl.classList.remove('slide-warn', 'slide-over');
  slideTimerEl.textContent = formatSlideTimer(slideTimerRemaining);
  if (swStarted) {
    slideTimerInterval = setInterval(slideTimerTick, 1000);
  }
}

function slideTimerTick() {
  slideTimerRemaining--;
  slideTimerEl.textContent = formatSlideTimer(slideTimerRemaining);
  slideTimerEl.classList.toggle('slide-warn', slideTimerRemaining <= 20 && slideTimerRemaining > 0);
  slideTimerEl.classList.toggle('slide-over', slideTimerRemaining <= 0);
}

function formatSlideTimer(sec) {
  const neg = sec < 0 ? '-' : '';
  const m = Math.floor(Math.abs(sec) / 60);
  const s = Math.abs(sec) % 60;
  return neg + m + ':' + String(s).padStart(2, '0');
}


// Sound helpers — each call creates a fresh Audio so overlaps work
function playSound(file, vol) {
  const snd = new Audio(file);
  snd.volume = vol;
  snd.play().catch(() => {});
}
const SND_LAUNCH  = './assets/sounds/FIREWORKS_Rocket_Launch_Crop_RR1_mono.wav';
const SND_WHISTLE = './assets/sounds/firework whistle.mp3';
const SND_POP     = './assets/sounds/FIREWORKS_Rocket_Explode_RR4_mono.wav';

// Rocket launch + fullscreen confetti burst on AI LIVE label
function launchRocketAndConfetti() {
  const rocket = document.getElementById('ai-rocket');
  if (!rocket) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const colors = ['#DBFE01', '#FF5C8D', '#00BCD4', '#FFD700', '#FF6B35', '#7B68EE', '#FF4444', '#44FF88', '#AA66FF'];
  const shapes = ['confetti-piece--rect', 'confetti-piece--circle', 'confetti-piece--strip'];

  // --- Single firework: launch → whistle → pop + confetti scatter ---
  function fireFirework(cx, cy, count, delay) {
    setTimeout(() => {
      playSound(SND_LAUNCH, 0.45);
      setTimeout(() => playSound(SND_WHISTLE, 0.35), 600);
      setTimeout(() => {
        playSound(SND_POP, 0.65);
        for (let i = 0; i < count; i++) {
          const piece = document.createElement('div');
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          piece.className = 'confetti-piece ' + shape;
          piece.style.left = cx + 'px';
          piece.style.top = cy + 'px';
          piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          const w = shape === 'confetti-piece--strip' ? (3 + Math.random() * 4) : (6 + Math.random() * 10);
          const h = shape === 'confetti-piece--strip' ? (15 + Math.random() * 20) : w;
          piece.style.width = w + 'px';
          piece.style.height = h + 'px';
          // Radial burst from center point
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 250;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist;
          const rot = (400 + Math.random() * 800) * (Math.random() > 0.5 ? 1 : -1);
          const duration = 1.2 + Math.random() * 1.5;
          piece.style.setProperty('--dx', dx + 'px');
          piece.style.setProperty('--dy', dy + 'px');
          piece.style.setProperty('--rot', rot + 'deg');
          piece.style.setProperty('--duration', duration + 's');
          piece.style.setProperty('--delay', (Math.random() * 0.1) + 's');
          document.body.appendChild(piece);
          setTimeout(() => piece.remove(), (duration + 0.5) * 1000);
        }
      }, 1300);
    }, delay);
  }

  // --- Rocket: smooth upward arc via Web Animations API ---
  const rect = rocket.getBoundingClientRect();
  const startX = rect.left;
  const startY = rect.top;

  const flyer = document.createElement('div');
  flyer.className = 'rocket-flyer';
  flyer.textContent = '🚀';
  flyer.style.left = startX + 'px';
  flyer.style.top = startY + 'px';
  document.body.appendChild(flyer);
  rocket.style.opacity = '0';

  // Rocket sound: 1 launch + 1 whistle
  playSound(SND_LAUNCH, 0.6);
  setTimeout(() => playSound(SND_WHISTLE, 0.4), 500);

  // Smooth arc: rocket climbs up-right with gentle tilt, grows, exits top
  // 🚀 emoji nose points top-right (~315deg / -45deg), so rotate(0) = natural heading
  const flight = flyer.animate([
    { transform: 'scale(1) rotate(0deg)',     opacity: 1, offset: 0 },
    { transform: 'scale(2.5) rotate(-8deg)',  opacity: 1, offset: 0.15 },
    { transform: 'scale(4) rotate(-5deg)',    opacity: 1, offset: 0.35 },
    { transform: 'scale(5) rotate(-12deg)',   opacity: 1, offset: 0.55 },
    { transform: 'scale(6) rotate(-3deg)',    opacity: 1, offset: 0.75 },
    { transform: 'scale(7) rotate(-8deg)',    opacity: 0.8, offset: 0.9 },
    { transform: 'scale(8) rotate(-5deg)',    opacity: 0, offset: 1 },
  ], {
    duration: 3000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards',
  });

  // Move position along a smooth upward arc
  const arcKeyframes = [
    { left: startX + 'px',       top: startY + 'px',    offset: 0 },
    { left: (startX + vw * 0.08) + 'px', top: (startY - vh * 0.25) + 'px', offset: 0.2 },
    { left: (startX + vw * 0.15) + 'px', top: (startY - vh * 0.5) + 'px',  offset: 0.45 },
    { left: (startX + vw * 0.1) + 'px',  top: (startY - vh * 0.75) + 'px', offset: 0.7 },
    { left: (startX + vw * 0.12) + 'px', top: '-100px',                     offset: 1 },
  ];

  flyer.animate(arcKeyframes, {
    duration: 3000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards',
  });

  flight.onfinish = () => {
    flyer.remove();
    rocket.style.opacity = '1';
  };

  // --- Fireworks staggered around the rocket path ---
  // 3 fireworks at different positions flanking the arc, staggered in time
  const fw1x = startX - vw * 0.15 + Math.random() * vw * 0.1;
  const fw1y = vh * 0.35 + Math.random() * vh * 0.1;

  const fw2x = startX + vw * 0.2 + Math.random() * vw * 0.15;
  const fw2y = vh * 0.2 + Math.random() * vh * 0.1;

  const fw3x = vw * 0.5 + Math.random() * vw * 0.15;
  const fw3y = vh * 0.15 + Math.random() * vh * 0.1;

  fireFirework(fw1x, fw1y, 70, 300);
  fireFirework(fw2x, fw2y, 80, 1100);
  fireFirework(fw3x, fw3y, 90, 1900);
}
