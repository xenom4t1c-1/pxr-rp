/* scripts.js — cleaned and robust interaction script
   Features:
   - Preloader removal
   - Navbar solid on scroll
   - Smooth anchor scrolling
   - Poster toggles + keyboard
   - Reveal on scroll (IntersectionObserver)
   - Particles (lightweight) with resize handling
   - Copy IP + toast (clipboard API + fallback)
   - Music player: play/pause, progress, seek, volume, pin, saved prefs, resume-on-gesture
   - Parallax PHLOX motion (lightweight)
*/

const qs = (s, e=document) => e.querySelector(s);
const qsa = (s, e=document) => Array.from(e.querySelectorAll(s));
const SERVER_IP = 'samp.pxr-rp.site:7826';

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  const pre = qs('#preloader');
  if (pre) setTimeout(() => pre.remove(), 600);

  // Hero background from data attribute
  const hero = qs('.hero');
  if (hero) {
    const url = hero.dataset.hero;
    if (url) hero.style.setProperty('--hero-url', `url('${url}')`);
  }

  // Navbar solid on scroll
  const navbar = qs('#navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 60) navbar.classList.add('solid'); else navbar.classList.remove('solid');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth scroll for local anchors
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navH - 12);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Posters: click toggle & keyboard
  qsa('.poster').forEach(p => {
    p.addEventListener('click', () => p.classList.toggle('active'));
    p.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.code === 'Space') { ev.preventDefault(); p.classList.toggle('active'); }
    });
  });

  // Reveal animations
  try {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add('in'); else en.target.classList.remove('in');
      });
    }, { threshold: 0.12 });
    qsa('.section, .poster').forEach(el => obs.observe(el));
  } catch (e) { /* IntersectionObserver not available */ }

  // Init particles
  try { initParticles('particles'); } catch (e) { /* ignore */ }

  // Toast helper
  const toast = qs('#toast');
  function showToast(msg=''){
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // Copy IP helpers
  function fallbackCopy(text){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('IP copied to clipboard'); } catch (e) { showToast('Copy failed'); }
    ta.remove();
  }

  function copyIP(ip){
    if (!ip) ip = SERVER_IP;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ip).then(() => showToast('IP copied to clipboard'), () => fallbackCopy(ip));
    } else fallbackCopy(ip);
  }

  qsa('.copy-ip, button.copy-ip, .copy-ip-large').forEach(btn => {
    btn.addEventListener('click', () => copyIP(btn.dataset.ip || SERVER_IP));
  });

  // --- Music player ---
  const audio = qs('#bg-music');
  const musicBox = qs('.music-box');
  const musicHandle = qs('.music-handle');
  const musicPlay = qs('#music-play');
  const musicPin = qs('#music-pin');
  const volRange = qs('#music-volume');
  const progressBar = qs('.music-progress-bar');
  const progressFilled = qs('.music-progress-filled');
  const timeCur = qs('.music-time .cur');
  const timeDur = qs('.music-time .dur');

  if (audio) {
    // Restore volume
    try {
      const saved = localStorage.getItem('phlox_music_vol');
      if (saved !== null) audio.volume = parseFloat(saved);
      else if (volRange) audio.volume = parseFloat(volRange.value) || 0.6;
      if (volRange) volRange.value = audio.volume;
    } catch (e){}

    function fmt(s){ if (!isFinite(s)) return '0:00'; const m = Math.floor(s/60), sec = Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sec}`; }

    function updatePlayUI(){
      if (!musicPlay) return;
      const playing = !audio.paused && !audio.ended;
      musicPlay.setAttribute('aria-pressed', String(playing));
      musicPlay.textContent = playing ? '❚❚' : '▶';
      try { localStorage.setItem('phlox_music_playing', playing ? '1' : '0'); } catch (e){}
    }

    // Handle open/close
    if (musicHandle && musicBox) {
      musicHandle.addEventListener('click', () => musicBox.classList.toggle('open'));
      musicHandle.addEventListener('mouseenter', () => musicBox.classList.add('open'));
      musicHandle.addEventListener('focus', () => musicBox.classList.add('open'));
      musicBox.addEventListener('mouseleave', () => {
        if (musicPin && musicPin.getAttribute('aria-pressed') === 'true') return;
        musicBox.classList.remove('open');
      });
    }

    // Play/pause
    if (musicPlay){
      musicPlay.addEventListener('click', () => {
        if (audio.paused) {
          audio.play().catch((err) => {
            showToast('Playback blocked — interact to enable');
          });
        } else {
          audio.pause();
        }
        updatePlayUI();
      });
    }

    audio.addEventListener('play', updatePlayUI);
    audio.addEventListener('pause', updatePlayUI);

    audio.addEventListener('loadedmetadata', () => { if (timeDur) timeDur.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      if (!audio) return;
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      if (progressFilled) progressFilled.style.width = pct + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(pct));
      if (timeCur) timeCur.textContent = fmt(audio.currentTime);
      if (timeDur && isFinite(audio.duration)) timeDur.textContent = fmt(audio.duration);
    });

    // Seeking
    if (progressBar) {
      progressBar.addEventListener('click', (ev) => {
        const r = progressBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        audio.currentTime = (audio.duration || 0) * x;
      });
    }

    // Volume
    if (volRange) {
      volRange.addEventListener('input', () => {
        audio.volume = parseFloat(volRange.value);
        try { localStorage.setItem('phlox_music_vol', audio.volume.toString()); } catch (e){}
      });
      volRange.value = audio.volume;
    }

    // Pin
    if (musicPin){
      musicPin.addEventListener('click', () => {
        const pinned = musicPin.getAttribute('aria-pressed') === 'true';
        musicPin.setAttribute('aria-pressed', String(!pinned));
      });
    }

    // Resume attempt after first gesture if user wanted playback
    window.addEventListener('pointerdown', function resumeIfNeeded(){
      try {
        const savedPlay = localStorage.getItem('phlox_music_playing') === '1';
        if (savedPlay && audio.paused) audio.play().catch(()=>{});
      } catch (e){}
      window.removeEventListener('pointerdown', resumeIfNeeded);
    }, { once: true });

    // initial UI
    updatePlayUI();
  }

  // Parallax
  const parallaxEls = qsa('.parallax-phlox');
  if (parallaxEls.length){
    let ticking = false;
    function onScrollParallax(){
      if (!ticking){
        window.requestAnimationFrame(() => {
          for (const el of parallaxEls){
            const rect = el.getBoundingClientRect();
            const centerY = rect.top + rect.height/2;
            const offset = (window.scrollY / 300) + (centerY - window.innerHeight/2) / 500;
            const x = Math.sin(window.scrollY / 300) * 6;
            const y = Math.max(-20, Math.min(20, offset * 14));
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    onScrollParallax();
  }

}); // DOMContentLoaded

/* Lightweight particles */
function initParticles(id){
  const c = document.getElementById(id);
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = c.width = innerWidth;
  let H = c.height = innerHeight;
  const particles = [];
  const count = Math.min(90, Math.floor(W/15));
  function rand(a,b){ return Math.random()*(b-a)+a; }
  for (let i=0;i<count;i++) particles.push({x:Math.random()*W,y:Math.random()*H,r:rand(.6,2.2),vx:rand(-0.15,0.15),vy:rand(0.02,0.35),a:rand(0.02,0.12)});
  window.addEventListener('resize', () => { W=c.width=innerWidth; H=c.height=innerHeight; });
  function loop(){
    ctx.clearRect(0,0,W,H);
    for (let p of particles){
      p.x += p.vx; p.y += p.vy;
      if (p.y > H + 20){ p.y = -10; p.x = Math.random()*W; }
      ctx.beginPath(); ctx.fillStyle = `rgba(124,44,200,${p.a})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
}
