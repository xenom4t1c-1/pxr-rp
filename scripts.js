/* Updated JS for the redesigned site:
   - preloader
   - navbar solid on scroll
   - particles
   - smooth scroll for anchors (keeps working)
   - posters: hover + click to toggle color (adds 'active')
   - back-to-top behavior
*/

const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  const pre = qs('#preloader');
  window.setTimeout(() => { pre && pre.remove(); }, 600);

  // Set hero background css var
  const hero = qs('.hero');
  if (hero && hero.dataset.heroImage) {
    hero.style.setProperty('--hero-image', `url('${hero.dataset.heroImage}')`);
    hero.style.backgroundImage = `url('${hero.dataset.heroImage}')`;
  }

  // Navbar solid on scroll
  const navbar = qs('#navbar');
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('solid'); else navbar.classList.remove('solid');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Hamburger toggle (mobile)
  const hamburger = qs('#hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.getAttribute('data-open') === 'true';
      hamburger.setAttribute('data-open', !open);
      hamburger.setAttribute('aria-expanded', String(!open));
      // very small mobile menu: toggle nav-ctas visibility
      const ct = qs('.nav-ctas');
      if (!open) ct.classList.add('open'); else ct.classList.remove('open');
    });
  }

  // Smooth scrolling for anchor links (keeps offset for header)
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: Math.max(0, Math.floor(targetY)), behavior: 'smooth' });
    });
  });

  // Init particles (if canvas present)
  initParticles('particles');

  // Posters: toggle color on click/tap and reveal caption on hover
  qsa('.poster').forEach(p => {
    // keyboard accessibility: Enter toggles active
    p.addEventListener('click', () => p.classList.toggle('active'));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        p.classList.toggle('active');
      }
    });
  });

  // Reveal posters on scroll (simple observer)
  const posterObserver = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) ent.target.classList.add('visible'); else ent.target.classList.remove('visible');
    });
  }, {threshold:0.12});
  qsa('.poster').forEach(p => posterObserver.observe(p));

  // Back to top opacity (if present)
  const backToTop = qs('#backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.style.opacity = window.scrollY > 400 ? '1' : '.6';
    });
  }
});

/* ======= Simple particles (kept lightweight) ======= */
function initParticles(id){
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const particles = [];
  const count = Math.min(100, Math.floor(W/14));
  function rand(a,b){return Math.random()*(b-a)+a}
  for (let i=0;i<count;i++){
    particles.push({x:Math.random()*W,y:Math.random()*H,r:rand(0.6,2.4),vx:rand(-0.2,0.2),vy:rand(-0.05,0.35),a:rand(0.02,0.12)});
  }
  window.addEventListener('resize', () => { W=canvas.width=innerWidth; H=canvas.height=innerHeight; });
  function draw(){
    ctx.clearRect(0,0,W,H);
    for (let p of particles){
      p.x += p.vx; p.y += p.vy;
      if (p.y > H+20){p.y=-10; p.x=Math.random()*W}
      ctx.beginPath(); ctx.fillStyle = `rgba(217,4,41,${p.a})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}