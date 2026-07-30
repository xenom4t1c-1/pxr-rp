/* scripts.js - interactions (cleaned up & updated)
   - Preloader
   - Navbar solid on scroll
   - Smooth anchors
   - Posters: hover & click -> color (toggle .active)
   - Particles (lightweight)
   - Copy IP controls and toast feedback (consistent styled buttons)
*/

const qs = (s, e=document) => e.querySelector(s);
const qsa = (s, e=document) => Array.from(e.querySelectorAll(s));
const SERVER_IP = 'samp.pxr-rp.site:7826';

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  const pre = qs('#preloader');
  setTimeout(() => pre && pre.remove(), 600);

  // Hero background set from data attribute
  const hero = qs('.hero');
  if (hero) {
    const url = hero.dataset.hero;
    if (url) hero.style.setProperty('--hero-url', `url('${url}')`);
  }

  // Navbar solid on scroll
  const navbar = qs('#navbar');
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('solid'); else navbar.classList.remove('solid');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Smooth scroll for anchors (# links)
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navH - 12);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Posters: toggle color on click/tap + keyboard accessibility
  qsa('.poster').forEach(p => {
    p.addEventListener('click', () => p.classList.toggle('active'));
    p.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); p.classList.toggle('active'); }
    });
  });

  // Reveal animations for sections & posters
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add('in'); else en.target.classList.remove('in');
    });
  }, {threshold: 0.12});
  qsa('.section, .poster').forEach(el => obs.observe(el));

  // Init particles
  initParticles('particles');

  // Copy IP controls (copy buttons and toast)
  const toast = qs('#toast');
  const showToast = (msg='Copied!') => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  function copyIP(ip) {
    if (!ip) ip = SERVER_IP;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ip).then(() => showToast('IP copied to clipboard'), () => fallbackCopy(ip));
    } else {
      fallbackCopy(ip);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('IP copied to clipboard'); } catch (e) { showToast('Copy failed'); }
    ta.remove();
  }

  // copy-ip buttons (small & large)
  qsa('.copy-ip').forEach(btn => {
    btn.addEventListener('click', () => {
      const ip = btn.dataset.ip || SERVER_IP;
      copyIP(ip);
    });
  });
});

/* Lightweight particle canvas */
function initParticles(id){
  const c = document.getElementById(id);
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = c.width = innerWidth;
  let H = c.height = innerHeight;
  const particles = [];
  const count = Math.min(90, Math.floor(W / 15));
  function rand(a,b){return Math.random()*(b-a)+a}
  // phlox purple rgb: 124,44,200
  for (let i=0;i<count;i++) particles.push({x:Math.random()*W,y:Math.random()*H,r:rand(.6,2.2),vx:rand(-0.15,0.15),vy:rand(0.02,0.35),a:rand(0.02,0.12)});
  window.addEventListener('resize', () => {W=c.width=innerWidth; H=c.height=innerHeight;});
  function loop(){
    ctx.clearRect(0,0,W,H);
    for (let p of particles){
      p.x += p.vx; p.y += p.vy;
      if (p.y > H + 20) { p.y = -10; p.x = Math.random()*W; }
      ctx.beginPath(); ctx.fillStyle = `rgba(124,44,200,${p.a})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
}