// Single-page script: mobile menu, SA:MP + FiveM UI, Play actions, gallery lightbox, autoplay hint, modals
document.addEventListener('DOMContentLoaded', () => {
  // Config
  const sampIP = "samp.pxr-rp.site:7826";
  const sampUrl = `samp://${sampIP}`;
  const fivemIP = "";
  const discordSamp = "https://discord.gg/aFg2fywWha";
  const discordFivem = "https://discord.gg/hjt9jFsm5e";

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Wire discord links
  document.getElementById('discord-samp')?.setAttribute('href', discordSamp);
  document.getElementById('discord-fivem')?.setAttribute('href', discordFivem);

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      if (open) {
        mobileMenu.hidden = true;
        mobileMenu.setAttribute('aria-hidden','true');
      } else {
        mobileMenu.hidden = false;
        mobileMenu.setAttribute('aria-hidden','false');
      }
    });
    // close menu on mobile link click
    mobileMenu.addEventListener('click', (e) => {
      const link = e.target.closest('[data-scroll], .mobile-link');
      if (!link) return;
      // hide menu after click
      mobileMenu.hidden = true;
      mobileMenu.setAttribute('aria-hidden','true');
      menuToggle.setAttribute('aria-expanded','false');
    });
  }

  // Smooth scroll (keeps URL clean)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    e.preventDefault();
    const sel = btn.getAttribute('data-scroll');
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // Play SA:MP action: copy IP and attempt to open samp://
  async function playSampAction() {
    try {
      await navigator.clipboard.writeText(sampIP);
      showToast('SA:MP IP copied to clipboard');
    } catch {
      showToast('Could not copy IP — copy manually: ' + sampIP);
    }
    setTimeout(() => {
      window.location.href = sampUrl;
      try { window.open(sampUrl, '_blank'); } catch {}
    }, 150);
  }
  document.getElementById('play-samp')?.addEventListener('click', (e) => { e.preventDefault(); playSampAction(); });
  document.getElementById('play-join')?.addEventListener('click', (e) => { e.preventDefault(); playSampAction(); });

  // Connect section Play SA:MP button
  document.getElementById('play-join')?.addEventListener('click', (e) => { e.preventDefault(); playSampAction(); });

  // Play FiveM: opens Coming Soon modal
  const playFivemBtn = document.getElementById('play-fivem');
  const playFivemConnect = document.getElementById('play-fivem-connect');
  const fivemModal = document.getElementById('fivem-modal');
  const fivemModalClose = fivemModal?.querySelector('.modal-close');
  function openFivemModal() {
    if (!fivemModal) return;
    fivemModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeFivemModal() {
    if (!fivemModal) return;
    fivemModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  if (playFivemBtn) playFivemBtn.addEventListener('click', (e) => { e.preventDefault(); openFivemModal(); });
  if (playFivemConnect) playFivemConnect.addEventListener('click', (e) => { e.preventDefault(); openFivemModal(); });
  fivemModalClose && fivemModalClose.addEventListener('click', closeFivemModal);
  fivemModal && fivemModal.addEventListener('click', (e) => { if (e.target === fivemModal) closeFivemModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (fivemModal && fivemModal.getAttribute('aria-hidden') === 'false') closeFivemModal(); } });

  // Toast helper
  function showToast(text, ms = 2200) {
    const id = 'pxr-toast';
    if (document.getElementById(id)) return;
    const t = document.createElement('div');
    t.id = id;
    t.textContent = text;
    Object.assign(t.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      background: 'linear-gradient(90deg, rgba(124,44,200,0.95), rgba(90,31,160,0.95))',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '10px',
      zIndex: 99999,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      fontWeight: '700',
      fontSize: '13px'
    });
    document.body.appendChild(t);
    setTimeout(()=> { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, ms);
    setTimeout(()=> t.remove(), ms + 420);
  }

  // Background audio: best-effort autoplay
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  let playing = false;
  if (audio) {
    audio.muted = true;
    audio.play().then(()=> {
      setTimeout(()=> { try { audio.muted = false; } catch {} }, 700);
    }).catch(()=> {
      showAutoplayHint();
    });

    const saved = localStorage.getItem('pxr_music') === 'true';
    if (saved) audio.play().catch(()=>{});

    if (musicBtn) {
      musicBtn.addEventListener('click', async () => {
        try {
          if (!playing) {
            await audio.play();
            audio.muted = false;
            playing = true;
            localStorage.setItem('pxr_music','true');
          } else {
            audio.pause();
            playing = false;
            localStorage.setItem('pxr_music','false');
          }
        } catch {
          try { audio.muted = false; await audio.play(); playing = true; localStorage.setItem('pxr_music','true'); } catch {}
        }
        musicBtn.textContent = playing ? '⏸' : '▶';
        musicBtn.classList.toggle('playing', playing);
      });
    }

    audio.addEventListener('play', ()=> { playing = true; if (musicBtn) { musicBtn.textContent = '⏸'; musicBtn.classList.add('playing'); } });
    audio.addEventListener('pause', ()=> { playing = false; if (musicBtn) { musicBtn.textContent = '▶'; musicBtn.classList.remove('playing'); } });
  } else if (musicBtn) {
    musicBtn.style.display = 'none';
  }

  function showAutoplayHint(){
    if (document.getElementById('autoplay-hint')) return;
    const t = document.createElement('div');
    t.id = 'autoplay-hint';
    t.innerHTML = 'Audio autoplay blocked — press the ▶ button to enable music';
    Object.assign(t.style, {
      position:'fixed',left:'18px',bottom:'18px',background:'rgba(0,0,0,0.6)',color:'#fff',padding:'10px 14px',borderRadius:'10px',zIndex:9999,fontSize:'13px'
    });
    document.body.appendChild(t);
    setTimeout(()=> { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 7000);
    setTimeout(()=> t.remove(),7600);
  }

  // Account modal
  const accountOpenButtons = Array.from(document.querySelectorAll('#account-open, #mobile-account'));
  const accountModal = document.getElementById('account-modal');
  const accountModalClose = accountModal?.querySelector('.modal-close');
  function openAccount() {
    if (!accountModal) return;
    accountModal.setAttribute('aria-hidden','false');
    const first = accountModal.querySelector('button, a, input, [tabindex]') || accountModal;
    first && first.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeAccount() {
    if (!accountModal) return;
    accountModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  accountOpenButtons.forEach(b => b && b.addEventListener('click', (e)=> { e.preventDefault(); openAccount(); }));
  accountModalClose && accountModalClose.addEventListener('click', closeAccount);
  accountModal && accountModal.addEventListener('click', (e) => { if (e.target === accountModal) closeAccount(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && accountModal && accountModal.getAttribute('aria-hidden') === 'false') closeAccount(); });

  // Lightbox (gallery)
  const galleryImgs = Array.from(document.querySelectorAll('.gallery-item img'));
  const lightbox = document.getElementById('lightbox');
  if (lightbox && galleryImgs.length) {
    const lbImage = lightbox.querySelector('.lb-image');
    const lbCaption = lightbox.querySelector('.lb-caption');
    const lbClose = lightbox.querySelector('.lb-close');
    const lbPrev = lightbox.querySelector('.lb-prev');
    const lbNext = lightbox.querySelector('.lb-next');
    let idx = -1;
    function openLightbox(i) {
      const img = galleryImgs[i];
      if (!img || !lbImage) return;
      lbImage.src = img.dataset.full || img.src;
      lbImage.alt = img.alt || '';
      lbCaption && (lbCaption.textContent = img.closest('figure')?.querySelector('.gallery-title')?.textContent || '');
      lightbox.setAttribute('aria-hidden','false');
      idx = i;
      document.body.style.overflow = 'hidden';
      setTimeout(()=> lbImage.focus?.(), 60);
    }
    function closeLightbox() {
      lightbox.setAttribute('aria-hidden','true');
      lbImage && (lbImage.src = '');
      idx = -1;
      document.body.style.overflow = '';
    }
    function showNext(offset) {
      if (idx === -1) return;
      const next = (idx + offset + galleryImgs.length) % galleryImgs.length;
      openLightbox(next);
    }
    galleryImgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', ()=> openLightbox(i));
      img.addEventListener('keydown', (e)=> { if (e.key === 'Enter') openLightbox(i); });
    });
    lbClose && lbClose.addEventListener('click', closeLightbox);
    lbPrev && lbPrev.addEventListener('click', ()=> showNext(-1));
    lbNext && lbNext.addEventListener('click', ()=> showNext(1));
    document.addEventListener('keydown', (e) => {
      if (!lightbox) return;
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext(1);
        if (e.key === 'ArrowLeft') showNext(-1);
      }
    });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    lightbox.setAttribute('aria-hidden','true');
  }

  // entrance animations
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.animate-in').forEach(el => io.observe(el));

  // gentle parallax on hero media
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia) {
    let t = 0;
    function animate() {
      t += 0.002;
      heroMedia.style.transform = `scale(${1.02 + Math.sin(t) * 0.005}) translateY(${Math.sin(t * 0.7) * 1.6}px)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
});