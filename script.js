// defensive site script: guards, lightbox, music toggle, mobile menu, copy IP
document.addEventListener('DOMContentLoaded', () => {
  const serverIP = "samp.pxr-rp.site:7826";
  const joinUrl = `samp://${serverIP}`;
  const discordInvite = "https://discord.gg/aFg2fywWha";

  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // safe DOM getters
  const serverIpEl = document.getElementById('server-ip');
  const joinLink = document.getElementById('join-link');
  const discordLink = document.getElementById('discord-link');
  if (serverIpEl) serverIpEl.textContent = serverIP;
  if (joinLink) joinLink.href = joinUrl;
  if (discordLink) discordLink.href = discordInvite;

  // audio control
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  if (audio && musicBtn) {
    let playing = false;
    const setMusicBtn = () => {
      musicBtn.textContent = playing ? '⏸' : '▶';
      musicBtn.classList.toggle('playing', playing);
      musicBtn.setAttribute('aria-pressed', String(playing));
    };
    musicBtn.addEventListener('click', async () => {
      try {
        if (!playing) { await audio.play(); playing = true; } else { audio.pause(); playing = false; }
      } catch (err) {
        try { audio.muted = false; audio.play(); playing = true; } catch {}
      }
      setMusicBtn();
    });
    audio.addEventListener('play', ()=> { playing = true; setMusicBtn(); });
    audio.addEventListener('pause', ()=> { playing = false; setMusicBtn(); });
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

  // mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      mobileMenu.hidden = open;
    });
  }

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
      if (lbCaption) lbCaption.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
      lightbox.setAttribute('aria-hidden','false');
      idx = i;
      document.body.style.overflow = 'hidden';
      setTimeout(()=> lbImage.focus?.(), 80);
    }
    function closeLightbox() {
      lightbox.setAttribute('aria-hidden','true');
      if (lbImage) lbImage.src = '';
      document.body.style.overflow = '';
      idx = -1;
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
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext(1);
        if (e.key === 'ArrowLeft') showNext(-1);
      }
    });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    lightbox.setAttribute('aria-hidden','true');
  }

  // unify discord links if there are other discord anchors
  const discordEls = document.querySelectorAll('a[href^="https://discord.gg/"]');
  discordEls.forEach(a => a.href = discordInvite);
});