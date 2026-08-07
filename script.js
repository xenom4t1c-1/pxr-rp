// Single-page script: robust handlers, smooth scroll without changing URL, autoplay best-effort, lightbox, modal
document.addEventListener('DOMContentLoaded', () => {
  const serverIP = "samp.pxr-rp.site:7826";
  const joinUrl = `samp://${serverIP}`;
  const discordInvite = "https://discord.gg/aFg2fywWha";

  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // set elements
  const serverIpEl = document.getElementById('server-ip');
  const joinLink = document.getElementById('join-link');
  const discordLink = document.getElementById('discord-link');
  if (serverIpEl) serverIpEl.textContent = serverIP;
  if (joinLink) joinLink.href = joinUrl;
  if (discordLink) discordLink.href = discordInvite;

  // smooth-scroll without changing URL
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    e.preventDefault();
    const sel = btn.getAttribute('data-scroll');
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    // do NOT update location.hash — keep URL clean
  });

  // scroll-gallery helper
  const scrollGallery = document.getElementById('scroll-gallery');
  scrollGallery && scrollGallery.addEventListener('click', () => {
    document.getElementById('gallery')?.scrollIntoView({behavior:'smooth'});
  });

  // background music: best-effort autoplay (muted start), show play control if blocked
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  let playing = false;

  function updateMusicUI() {
    if (!musicBtn) return;
    musicBtn.textContent = playing ? '⏸' : '▶';
    musicBtn.classList.toggle('playing', playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
  }

  if (audio) {
    // try autoplay muted first
    audio.muted = true;
    audio.play().then(()=> {
      // autoplay succeeded (muted). attempt to unmute after short delay (may still be blocked)
      setTimeout(() => {
        try { audio.muted = false; } catch {}
      }, 700);
    }).catch(()=> {
      // autoplay rejected — leave muted and show button for user
    });

    // if user has previously allowed playback, try to resume unmuted
    const saved = localStorage.getItem('pxr_music') === 'true';
    if (saved) {
      // do not force unmute; only attempt
      audio.play().catch(()=>{});
    }

    musicBtn && musicBtn.addEventListener('click', async () => {
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
        // fallback: try toggling muted + play
        try { audio.muted = false; await audio.play(); playing = true; localStorage.setItem('pxr_music','true'); } catch {}
      }
      updateMusicUI();
    });

    audio.addEventListener('play', ()=> { playing = true; updateMusicUI(); });
    audio.addEventListener('pause', ()=> { playing = false; updateMusicUI(); });
    updateMusicUI();
  } else if (musicBtn) {
    musicBtn.style.display = 'none';
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
        setTimeout(()=> { copyBtn.textContent = prev; copyBtn.classList.remove('copied'); }, 1500);
      } catch {
        alert('Copy failed — please copy manually: ' + serverIP);
      }
    });
  }

  // Account modal (in-page)
  const accountOpenButtons = Array.from(document.querySelectorAll('#account-open, #account-open-2, #account-open-3'));
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
  accountOpenButtons.forEach(b => b && b.addEventListener('click', openAccount));
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
      lbCaption && (lbCaption.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || '');
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

  // Section entrance animations
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
});
