/* PrimeX Reality Roleplay - scripts.js
   Clean, organized Javascript (no libraries) for interactivity:
   - Preloader
   - Navbar solid on scroll
   - Hamburger menu
   - Particle canvas and slow parallax effect
   - IntersectionObserver for reveal animations
   - Animated counters
   - Gallery lightbox
   - FAQ accordion
   - Back to top + year
*/

/* Helpers */
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  const pre = qs('#preloader');
  window.setTimeout(() => { pre && pre.remove(); }, 700);

  // Set current year
  qs('#year').textContent = new Date().getFullYear();

  // Hero background: set CSS variable to use in CSS (for progressive enhancement)
  const hero = qs('.hero');
  if (hero && hero.dataset.heroImage) {
    hero.style.setProperty('--hero-image', `url('${hero.dataset.heroImage}')`);
    // Also set background image on pseudo-element using inline style if needed
    hero.style.backgroundImage = `url('${hero.dataset.heroImage}')`;
  }

  // NAVBAR: solid on scroll
  const navbar = qs('#navbar');
  const navTrigger = 60;
  const onScroll = () => {
    if (window.scrollY > navTrigger) navbar.classList.add('solid'); else navbar.classList.remove('solid');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // HAMBURGER menu
  const hamburger = qs('#hamburger');
  const nav = qs('#nav');
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('data-open') === 'true';
    hamburger.setAttribute('data-open', !open);
    hamburger.setAttribute('aria-expanded', String(!open));
    // Toggle nav visibility for mobile
    if (!open) {
      nav.style.display = 'block';
    } else {
      nav.style.display = '';
    }
  });

  // Smooth scroll for anchor links
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
      // close mobile nav if open
      if (hamburger.getAttribute('data-open') === 'true') {
        hamburger.click();
      }
    });
  });

  // PARTICLES canvas
  initParticles('particles');

  // Parallax subtle on mouse / scroll
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    if (hero) hero.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  // IntersectionObserver for reveal animations
  const ioOptions = {root: null, rootMargin: '0px', threshold:0.12};
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, ioOptions);

  qsa('.feature-card').forEach((el,i) => {
    // stagger animation with CSS transition delay
    el.style.transitionDelay = `${i*60}ms`;
    revealObserver.observe(el);
  });
  qsa('.card').forEach(el => revealObserver.observe(el));
  qsa('.stat-card').forEach(el => revealObserver.observe(el));

  // COUNTERS
  const counters = qsa('.stat-value');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        runCount(el, parseInt(el.dataset.count || '0'), 1400);
        countObserver.unobserve(el);
      }
    });
  }, {threshold:0.6});
  counters.forEach(c => countObserver.observe(c));

  // GALLERY LIGHTBOX
  initGalleryLightbox();

  // FAQ Accordion
  qsa('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const panel = btn.nextElementSibling;
      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = null;
      }
    });
  });

  // Back to top button
  const backToTop = qs('#backToTop');
  backToTop && window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop.style.opacity = '1'; else backToTop.style.opacity = '.6';
  });
});

/* ======= Animated counter ======= */
function runCount(el, target, duration = 1200) {
  let start = 0;
  const startTime = performance.now();
  function frame(now){
    const p = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(p);
    el.textContent = Math.floor(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(frame); else el.textContent = target;
  }
  requestAnimationFrame(frame);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3) }

/* ======= Gallery & Lightbox ======= */
function initGalleryLightbox(){
  const galleryImgs = qsa('.gallery-item img');
  const lightbox = qs('#lightbox');
  const lbImage = qs('.lb-image');
  const closeBtn = qs('.lb-close');
  const nextBtn = qs('.lb-next');
  const prevBtn = qs('.lb-prev');
  let currentIdx = 0;
  const imgs = galleryImgs.map(i => i.dataset.full || i.src);

  function open(idx){
    currentIdx = idx;
    lbImage.src = imgs[currentIdx];
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function next(){ open((currentIdx+1)%imgs.length) }
  function prev(){ open((currentIdx-1+imgs.length)%imgs.length) }

  galleryImgs.forEach((img, i) => {
    img.addEventListener('click', () => open(i));
  });
  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
  });
}

/* ======= PARTICLES Canvas (lightweight) ======= */
function initParticles(canvasId){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const particles = [];
  const count = Math.min(120, Math.floor(W/12));

  function rand(min,max){return Math.random()*(max-min)+min;}
  function create(){
    for (let i=0;i<count;i++){
      particles.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: rand(0.6,2.2),
        vx: rand(-0.2,0.2),
        vy: rand(-0.1,0.4),
        alpha: rand(0.02,0.12)
      });
    }
  }
  create();

  function resize(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
  window.addEventListener('resize', resize);

  function draw(){
    ctx.clearRect(0,0,W,H);
    // subtle gradient overlay so particles glow with accent color
    for (let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > H + 20) { p.y = -10; p.x = Math.random()*W; }
      if (p.x > W + 20) { p.x = -10; }
      if (p.x < -20) { p.x = W + 10; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(217,4,41,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    // draw slow connecting lines for depth
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 90){
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(217,4,41,'+ (0.02 + (90 - d)/180) +')';
          ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ======= Utility: smooth reveal on load for elements already visible ======= */
window.addEventListener('load', () => {
  // reveal items visible on load
  qsa('.feature-card, .card, .stat-card').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < innerHeight - 40) el.classList.add('visible');
  });
});