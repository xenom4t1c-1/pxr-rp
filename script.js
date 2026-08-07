// Single-page script: smooth scroll, autoplay attempt, lightbox, modal, UI tweaks
document.addEventListener('DOMContentLoaded', () => {
  const serverIP = "samp.pxr-rp.site:7826";
  const joinUrl = `samp://${serverIP}`;
  const discordInvite = "https://discord.gg/aFg2fywWha";

  // YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ELEMENTS
  const joinLink = document.getElementById('join-link');
  const discordLink = document.getElementById('discord-link');
  if (joinLink) joinLink.href = joinUrl;
  if (discordLink) discordLink.href = discordInvite;

  // SMOOTH SCROLL (no hash change)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    e.preventDefault();
    const sel = btn.getAttribute('data-scroll');
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    // visual hint: if Play button used, briefly pulse Join button
    if (btn.id === 'play-btn' || btn.id === 'play-join') {
      const j = document.getElementById('join-link');
      if (j) {
        j.classList.add('pulse');
        setTimeout(()=> j.classList.remove('pulse'), 2200);
      }
    }
  });

  // play-btn: scroll to connect and highlight join
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const target = document.getElementById('community');
      target?.scrollIntoView({behavior:'smooth', block:'start'});
      const j = document.getElementById('join-link');
      if (j) {
        j.classList.add('pulse');
        setTimeout(()=> j.classList.remove('pulse'), 2200);
      }
    });
  }

  // copy IP
  const copyBtn = document.getElementById('copy-addr');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(serverIP);
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(()=> { copyBtn.textContent = prev; copyBtn.classList.remove('copied'); }, 1600);
      } catch {
        alert('Copy failed — please copy manually: ' + serverIP);
      }
    });
  }

  // Background audio: best-effort autoplay muted then unmute if allowed
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  let playing = false;
  if (audio) {
    audio.muted = true;
    audio.play().then(()=> {
      // autoplay succeeded (muted); try unmute
      setTimeout(()=> {
        try { audio.muted = false; } catch {}
      }, 800);
    }).catch(()=> {
      // blocked — user must press button
      // show hint handled by previous logic (not intrusive)
    });

    // persist user pref
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
        } catch (err) {
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

  // Account modal
  const accountOpenButtons = Array.from(document.querySelectorAll('#account-open, #account-open-2'));
  const accountModal = document.getElementById('account-modal');
  const modalClose = accountModal?.querySelector('.modal-close');
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
  modalClose && modalClose.addEventListener('click', closeAccount);
  accountModal && accountModal.addEventListener('click', (e) => { if (e.target === accountModal) closeAccount(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && accountModal && accountModal.getAttribute('aria-hidden') === 'false') closeAccount(); });

  // Lightbox
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

  // unify discord anchors
  document.querySelectorAll('a[href^="https://discord.gg/"]').forEach(a => a.href = discordInvite);

  // gentle parallax/zoom on hero media
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia) {
    let t = 0;
    function animate() {
      t += 0.0025;
      heroMedia.style.transform = `scale(${1.02 + Math.sin(t) * 0.005}) translateY(${Math.sin(t * 0.6) * 1.8}px)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
});