// Horizontal Slide Navigation
let currentSlide = 0;
const totalSlides = 12;
const slidesContainer = document.querySelector('.slides-container');
const currentSlideEl = document.querySelector('.current-slide');
const totalSlidesEl = document.querySelector('.total-slides');
const prevBtn = document.querySelector('.nav-prev');
const nextBtn = document.querySelector('.nav-next');
const progressDotsContainer = document.querySelector('.progress-dots');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set total slides
  totalSlidesEl.textContent = totalSlides;

  // Create progress dots
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('progress-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    progressDotsContainer.appendChild(dot);
  }

  // Initial state
  updateNavigation();

  console.log('CrazyForAI — Slide deck ready');
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

  // Update UI
  currentSlideEl.textContent = currentSlide + 1;
  updateNavigation();
  updateProgressDots();
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
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
  }
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
