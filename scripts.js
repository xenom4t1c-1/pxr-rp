/* scripts.js - interactions (cleaned up & updated)
   - Preloader
   - Navbar solid on scroll
   - Smooth anchors
   - Posters: hover & click -> color (toggle .active)
   - Particles (lightweight)
   - Copy IP controls and toast feedback
   - Music box player + controls
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
    if (!navbar) return;
    if (window.scrollY > 60) navbar.classList.add('solid'); else navbar.classList.remove('solid');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Smooth scroll for anchors (# links)
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
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

  // Posters: toggle color on click/tap + keyboard accessibility
  qsa('.poster').forEach(p => {
    p.addEventListener('click', () => p.classList.toggle('active'));
    p.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.code === 'Space') { ev.preventDefault(); p.classList.toggle('active'); }
    });
  });

  // Reveal animations for sections & posters
  try {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add('in'); else en.target.classList.remove('in');
      });
    }, {threshold: 0.12});
    qsa('.section, .poster').forEach(el => obs.observe(el));
  } catch (e) {
    // IntersectionObserver unsupported or errors — ignore
  }

  // Init particles (safe)
  try { initParticles('particles'); } catch (e) {}

  // Copy IP controls (copy buttons and toast)
  const toast = qs('#toast');
  const showToast = (msg='Copied!') => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('IP copied to clipboard'); } catch (e) { showToast('Copy failed'); }
    ta.remove();
  }

  function copyIP(ip) {
    if (!ip) ip = SERVER_IP;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ip).then(() => showToast('IP copied to clipboard'), () => fallbackCopy(ip));
    } else {
      fallbackCopy(ip);
    }
  }

  // copy-ip buttons (small & large)
  qsa('.copy-ip').forEach(btn => {
    btn.addEventListener('click', () => {
      const ip = btn.dataset.ip || SERVER_IP;
      copyIP(ip);
    });
  });

  // --- Music box interaction (robust, defensive) ---
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
    // initialize volume from saved prefs or input default
    try {
      const savedVol = localStorage.getItem('phlox_music_vol');
      if (volRange) {
        if (savedVol !== null) {
          audio.volume = parseFloat(savedVol);
          volRange.value = audio.volume;
        } else {
          // keep the input default (if any), fallback to 0.6
          audio.volume = parseFloat(volRange.value) || audio.volume || 0.6;
          volRange.value = audio.volume;
        }
      } else if (savedVol !== null) {
        audio.volume = parseFloat(savedVol);
      } else {
        audio.volume = audio.volume || 0.6;
      }
    } catch (e){ /* ignore storage errors */ }

    // open on hover & click for music box handle
    if (musicHandle && musicBox) {
      musicHandle.addEventListener('click', () => musicBox.classList.toggle('open'));
      musicHandle.addEventListener('mouseenter', () => musicBox.classList.add('open'));
      musicBox.addEventListener('mouseleave', () => {
        if (musicPin && musicPin.getAttribute('aria-pressed') === 'true') return;
        musicBox.classList.remove('open');
      });
      musicHandle.addEventListener('focus', () => musicBox.classList.add('open'));
    }

    // play/pause UI and behavior
    function updatePlayUI(){
      if (!musicPlay || !audio) return;
      const playing = !audio.paused && !audio.ended;
      musicPlay.setAttribute('aria-pressed', String(playing));
      const playIcon = musicPlay.querySelector('.icon-play');
      const pauseIcon = musicPlay.querySelector('.icon-pause');
      if (playIcon) playIcon.style.display = playing ? 'none' : 'inline';
      if (pauseIcon) pauseIcon.style.display = playing ? 'inline' : 'none';
      try { localStorage.setItem('phlox_music_playing', playing ? '1' : '0'); } catch (e) {}
    }

    // ensure UI reflects initial state
    updatePlayUI();

    if (musicPlay) {
      musicPlay.addEventListener('click', (e) => {
        if (audio.paused) {
          audio.play().catch(() => { showToast('Playback blocked — interact to enable'); });
        } else {
          audio.pause();
        }
        updatePlayUI();
      });
    }

    audio.addEventListener('play', updatePlayUI);
    audio.addEventListener('pause', updatePlayUI);

    // time updates (guarded)
    audio.addEventListener('timeupdate', () => {
      if (!audio) return;
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      if (progressFilled) progressFilled.style.width = pct + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(pct));
      function fmt(s){ if (!isFinite(s)) return '0:00'; const m = Math.floor(s/60), sec = Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sec}`; }
      if (timeCur) timeCur.textContent = fmt(audio.currentTime);
      if (timeDur) timeDur.textContent = isFinite(audio.duration) ? fmt(audio.duration) : '0:00';
    });

    // seek on click
    if (progressBar) {
      progressBar.addEventListener('click', (ev) => {
        const r = progressBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        audio.currentTime = (audio.duration || 0) * x;
      });
    }

    // volume control
    if (volRange) {
      volRange.addEventListener('input', () => {
        audio.volume = parseFloat(volRange.value);
        try { localStorage.setItem('phlox_music_vol', audio.volume.toString()); } catch (e) {}
      });
      // ensure input reflects audio volume
      volRange.value = audio.volume;
    }

    // pin toggle
    if (musicPin) {
      musicPin.addEventListener('click', () => {
        const pinned = musicPin.getAttribute('aria-pressed') === 'true';
        musicPin.setAttribute('aria-pressed', String(!pinned));
      });
    }

    // If user previously wanted playback, try resuming after first gesture
    window.addEventListener('pointerdown', function resumeIfNeeded(){
      try {
        const savedPlay = localStorage.getItem('phlox_music_playing') === '1';
        if (savedPlay && audio.paused) { audio.play().catch(()=>{}); }
      } catch (e) {}
      window.removeEventListener('pointerdown', resumeIfNeeded);
    }, { once: true });
  } // end if audio

  // --- Parallax PHLOX movement (simple & safe) ---
  const parallaxEls = qsa('.parallax-phlox');
  if (parallaxEls.length){
    let ticking = false;
    function onScrollParallax() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          for (const el of parallaxEls) {
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

}); // end DOMContentLoaded

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