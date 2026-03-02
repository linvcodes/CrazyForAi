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
function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateSlides();
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlides();
  }
}

function goToSlide(index) {
  if (index >= 0 && index < totalSlides) {
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

  // Reset users slide reveal when leaving
  if (usersContent && currentSlide !== USERS_SLIDE_INDEX) {
    usersContent.classList.remove('users-revealed');
  }

  // Load iframe only when its slide is active, unload when leaving
  if (lazyIframe && LAZY_IFRAME_INDEX !== -1) {
    if (currentSlide === LAZY_IFRAME_INDEX) {
      if (!lazyIframe.src) lazyIframe.src = lazyIframe.dataset.src;
    } else {
      lazyIframe.src = '';
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
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
    const speeds = [0.5, 1, 1.5, 2, 3];
    const bar = document.createElement('div');
    bar.className = 'video-speed-bar';
    speeds.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'video-speed-btn';
      btn.textContent = s + 'x';
      if (s === 0.5) btn.classList.add('active');
      btn.addEventListener('click', () => {
        video.playbackRate = s;
        bar.querySelectorAll('.video-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      bar.appendChild(btn);
    });
    video.playbackRate = 0.5;
    video.parentElement.appendChild(bar);

    video.addEventListener('play', () => {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    });

    video.addEventListener('ended', () => {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    });
  });
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

slidesContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slidesContainer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swiped left - next slide
      nextSlide();
    } else {
      // Swiped right - previous slide
      prevSlide();
    }
  }
}

// Expose functions globally for onclick handlers
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;

console.log('CrazyForAI — Navigation initialized');

// Stopwatch — counts down from 20:00, starts on first ArrowRight
const stopwatchEl = document.getElementById('stopwatch');
let swStarted = false;
let swTotal = 20 * 60; // seconds
let swRemaining = swTotal;
let swInterval = null;

function swTick() {
  swRemaining--;
  const m = Math.floor(Math.abs(swRemaining) / 60);
  const s = Math.abs(swRemaining) % 60;
  const neg = swRemaining < 0 ? '-' : '';
  stopwatchEl.textContent = neg + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  stopwatchEl.classList.toggle('warn', swRemaining <= 300 && swRemaining > 0);
  stopwatchEl.classList.toggle('over', swRemaining <= 0);
}

function swStart() {
  if (swStarted) return;
  swStarted = true;
  swInterval = setInterval(swTick, 1000);
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.slide img:not(.cl-watermark):not(.speaker-image)').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
  });
});

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('active');
  lightboxImg.src = '';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') lightbox.classList.remove('active');
});
