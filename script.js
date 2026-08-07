// site interactivity: music, mobile menu, copy IP, join, accessible lightbox with proper hidden state
document.addEventListener('DOMContentLoaded', () => {
  // config
  const serverIP = "samp.pxr-rp.site:7826";
  const joinUrl = `samp://${serverIP}`;
  const discordInvite = "https://discord.gg/aFg2fywWha";

  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // set links & IP
  const serverIpEl = document.getElementById('server-ip');
  const joinLink = document.getElementById('join-link');
  const dlink = document.getElementById('discord-link');
  if (serverIpEl) serverIpEl.textContent = serverIP;
  if (joinLink) joinLink.href = joinUrl;
  if (dlink) dlink.href = discordInvite;

  // music toggle
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn && audio) {
    let playing = false;
    const setMusicBtn = () => {
      musicBtn.textContent = playing ? '⏸' : '▶';
      musicBtn.classList.toggle('playing', playing);
      musicBtn.setAttribute('aria-pressed', String(playing));
      musicBtn.title = playing ? 'Pause background music' : 'Play background music';
    };
    musicBtn.addEventListener('click', async () => {
      try {
        if (!playing) { await audio.play(); playing = true; } else { audio.pause(); playing = false; }
      } catch (e) {
        try { audio.muted = false; audio.play(); playing = true; } catch(e2){ playing = false; }
      }
      setMusicBtn();
    });
    audio.addEventListener('play', ()=>{ playing = true; setMusicBtn(); });
    audio.addEventListener('pause', ()=>{ playing = false; setMusicBtn(); });
  }

  // copy IP
  const copyBtn = document.getElementById('copy-addr');
  copyBtn && copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(serverIP);
      const prev = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(()=> { copyBtn.textContent = prev; copyBtn.classList.remove('copied'); }, 1800);
    } catch (err) {
      alert('Copy failed — please copy manually: ' + serverIP);
    }
  });

  // mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  menuToggle && menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    if (mobileMenu) mobileMenu.hidden = open;
  });

  // Gallery lightbox (accessible) — hidden by default via aria-hidden
  const gallery = Array.from(document.querySelectorAll('.gallery-item img'));
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImage = lightbox.querySelector('.lb-image');
    const lbCaption = lightbox.querySelector('.lb-caption');
    const lbClose = lightbox.querySelector('.lb-close');
    const lbPrev = lightbox.querySelector('.lb-prev');
    const lbNext = lightbox.querySelector('.lb-next');
    let idx = -1;

    function openLightbox(i) {
      const img = gallery[i];
      if(!img) return;
      const src = img.dataset.full || img.src;
      if (lbImage) {
        lbImage.src = src;
        lbImage.alt = img.alt || '';
        lbImage.tabIndex = -1;
      }
      if (lbCaption) lbCaption.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
      lightbox.setAttribute('aria-hidden','false');
      idx = i;
      document.body.style.overflow = 'hidden';
      // move focus into lightbox after it appears
      setTimeout(()=> lbImage && lbImage.focus && lbImage.focus(), 60);
    }

    function closeLightbox() {
      lightbox.setAttribute('aria-hidden','true');
      if (lbImage) lbImage.src = '';
      idx = -1;
      document.body.style.overflow = '';
      // return focus to gallery thumbnail if possible
      const thumb = gallery[Math.max(0, idx)];
      if (thumb && thumb.focus) thumb.focus();
    }

    function showNext(offset) {
      if (idx === -1) return;
      let next = (idx + offset + gallery.length) % gallery.length;
      openLightbox(next);
    }

    gallery.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', ()=> openLightbox(i));
      img.addEventListener('keydown', (e)=> { if (e.key === 'Enter') openLightbox(i); });
    });

    lbClose && lbClose.addEventListener('click', closeLightbox);
    lbPrev && lbPrev.addEventListener('click', ()=> showNext(-1));
    lbNext && lbNext.addEventListener('click', ()=> showNext(1));

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox) return;
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext(1);
        if (e.key === 'ArrowLeft') showNext(-1);
      }
    });

    // close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // ensure it's hidden initially
    lightbox.setAttribute('aria-hidden','true');
  }

  // ensure all Discord links match
  const discordEls = document.querySelectorAll('a[href^="https://discord.gg/"]');
  discordEls.forEach(a => a.href = discordInvite);
});