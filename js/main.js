/* Main interaction script:
   - Handles navigation behavior (transparent -> solid on scroll).
   - Mobile menu toggling.
   - IntersectionObserver animations for elements with .fade-* classes.
   - Lazy loads images with class .lazy (data-src).
   - Gallery lightbox.
   - Accordion FAQ.
   - Back-to-top button and year injection.
   - Loading screen removal.
*/

document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('primary-menu');
  const backToTop = document.getElementById('back-to-top');
  const yearEl = document.getElementById('year');
  const lazyImages = document.querySelectorAll('img.lazy');

  // Set current year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // NAV: change to solid on scroll
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('solid'), header.classList.remove('transparent');
    else header.classList.add('transparent'), header.classList.remove('solid');

    // back to top display
    if (window.scrollY > 400) backToTop.style.display = 'block';
    else backToTop.style.display = 'none';
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  // Smooth scroll offset (account for fixed nav)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = header.offsetHeight + 8;
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - navHeight;
      window.scrollTo({top, behavior: 'smooth'});
      // close mobile menu
      menu.classList.remove('show');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('show');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // IntersectionObserver: reveal animations
  const animItems = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .zoom');
  if ('IntersectionObserver' in window) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
        }
      });
    }, {threshold: 0.16});
    animItems.forEach(item => animObserver.observe(item));
  } else {
    // Fallback show all
    animItems.forEach(i => i.classList.add('is-visible'));
  }

  // Lazy load images
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) img.src = src;
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, {rootMargin: '200px'});
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    // fallback: load all
    lazyImages.forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }

  // Gallery lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox && lightbox.querySelector('img');
  const lightboxClose = lightbox && lightbox.querySelector('.lightbox-close');
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', (e) => {
      const src = e.currentTarget.src || e.currentTarget.dataset.src;
      if (!src) return;
      lightboxImg.src = src;
      lightboxImg.alt = e.currentTarget.alt || 'Gallery image';
      lightbox.classList.add('show');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  });
  if (lightbox) lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) { lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden', 'true'); }
  });

  // Accordion
  document.querySelectorAll('.accordion-item').forEach(item => {
    const btn = item.querySelector('.accordion-toggle');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Back to top
  backToTop.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });

  // Initialize counters (counter.js exposes a function)
  if (window.__primex_counters_init) window.__primex_counters_init();

  // Remove loading screen on window load for smoother UX
  window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 420);
    }
  });
});