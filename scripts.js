/* PrimeX Reality Roleplay - scripts.js
   Updated per your requests:
   - Smooth scrolling with navbar offset
   - Reveal animations toggle on enter/exit (works scrolling up & down)
   - Connect to server uses samp:// link (set in HTML)
   - Shop on Discord section added
   - Other interactive pieces preserved (particles, preloader)
*/

/* Helpers */
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  const pre = qs('#preloader');
  window.setTimeout(() => { pre && pre.remove(); }, 700);

  // Set current year
  qs('#year') && (qs('#year').textContent = new Date().getFullYear());

  // Hero background: set CSS variable to use in CSS (for progressive enhancement)
  const hero = qs('.hero');
  if (hero && hero.dataset.heroImage) {
    hero.style.setProperty('--hero-image', `url('${hero.dataset.heroImage}')`);
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
    if (!open) {
      nav.style.display = 'block';
    } else {
      nav.style.display = '';
    }
  });

  // Smooth scroll for anchor links with offset for fixed navbar
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - navHeight - 12; // small offset

      window.scrollTo({ top: Math.max(0, Math.floor(targetY)), behavior: 'smooth' });

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
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 6;
    if (hero) hero.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  // IntersectionObserver for reveal animations (toggle visible on enter/exit)
  const ioOptions = {root: null, rootMargin: '0px', threshold:0.12};
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, ioOptions);

  // Observe elements that should animate (cards, why-media, etc.)
  qsa('.card').forEach(el => revealObserver.observe(el));
  qsa('.why-media').forEach(el => revealObserver.observe(el));

  // Counters and other removed sections left safe (no-op if absent)
  const counters = qsa('.stat-value');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          runCount(el, parseInt(el.dataset.count || '0'), 1400);
        }
      });
    }, {threshold:0.6});
    counters.forEach(c => countObserver.observe(c));
  }

  // Shop / Discord CTAs already link to Discord (no extra code needed)

  // FAQ removed — remove accordion init

  // Back to top button opacity behavior
  const backToTop = qs('#backToTop');
  backToTop && window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop.style.opacity = '1'; else backToTop.style.opacity = '.6';
  });
});

/* ======= Animated counter (kept for future) ======= */
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
    // connecting lines
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

/* ======= Utility: reveal on load for elements already visible ======= */
window.addEventListener('load', () => {
  qsa('.card, .why-media').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < innerHeight - 40) el.classList.add('visible');
  });
});
