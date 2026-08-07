// Enhanced single-page script: lightbox, music toggle (saved), copy IP, account modal, entrance animations
document.addEventListener('DOMContentLoaded', () => {
  const serverIP = "samp.pxr-rp.site:7826";
  const joinUrl = `samp://${serverIP}`;
  const discordInvite = "https://discord.gg/aFg2fywWha";

  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // DOM elements
  const serverIpEl = document.getElementById('server-ip');
  const joinLink = document.getElementById('join-link');
  const discordLink = document.getElementById('discord-link');
  const scrollGallery = document.getElementById('scroll-gallery');
  if (serverIpEl) serverIpEl.textContent = serverIP;
  if (joinLink) joinLink.href = joinUrl;
  if (discordLink) discordLink.href = discordInvite;
  if (scrollGallery) scrollGallery.addEventListener('click', ()=> document.getElementById('gallery')?.scrollIntoView({behavior:'smooth'}));

  // music: persist preference
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  let playing = false;
  const saved = localStorage.getItem('pxr_music') === 'true';
  if (audio) {
    if (saved) {
      // do not autoplay; just set state (user must click to actually play per browser rules)
      playing = false;
      musicBtn && musicBtn.classList.add('saved-pref');
    }
    const setMusicBtn = () => {
      if (!musicBtn) return;
      musicBtn.textContent = playing ? '⏸' : '▶';
      musicBtn.classList.toggle('playing', playing);
      musicBtn.setAttribute('aria-pressed', String(playing));
    };
    musicBtn && musicBtn.addEventListener('click', async () => {
      try {
        if (!playing) { await audio.play(); playing = true; localStorage.setItem('pxr_music','true'); } else { audio.pause(); playing = false; localStorage.setItem('pxr_music','false'); }
      } catch (err) {
        try { audio.muted = false; audio.play(); playing = true; localStorage.setItem('pxr_music','true'); } catch {}
      }
      setMusicBtn();
    });
    audio.addEventListener('play', ()=> { playing = true; setMusicBtn(); });
    audio.addEventListener('pause', ()=> { playing = false; setMusicBtn(); });
    setMusicBtn();
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

  // Account modal
  const accountOpenButtons = Array.from(document.querySelectorAll('#account-open, #account-open-2, #account-open-3'));
  const accountModal = document.getElementById('account-modal');
  const modalClose = accountModal?.querySelector('.modal-close');
  function openAccount() {
    if (!accountModal) return;
    accountModal.setAttribute('aria-hidden','false');
    // trap focus (simple)
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

  // Gallery lightbox
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

  // Section entrance animations using IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.animate-in').forEach(el => io.observe(el));

  // unify any discord anchors
  document.querySelectorAll('a[href^="https://discord.gg/"]').forEach(a => a.href = discordInvite);
});