/* Lightweight canvas particle system for the hero.
   - Simple circles that drift slowly.
   - Optimized for fewer draw calls and devicePixelRatio scaling.
   - Provides an accessible reduced-motion check.
*/

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = 60;
  let width = 0, height = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  // Respect prefers-reduced-motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  function createParticle() {
    const size = 2 + Math.random() * 6;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.05 - Math.random() * 0.2,
      size,
      alpha: 0.08 + Math.random() * 0.12,
      shift: Math.random() * Math.PI * 2
    };
  }

  function init() {
    resize();
    particles = [];
    const count = Math.min(maxParticles, Math.floor((width * height) / 12000));
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function update(dt) {
    if (reducedMotion) return;
    for (let p of particles) {
      p.x += p.vx * dt * 0.06;
      p.y += p.vy * dt * 0.06;
      p.shift += dt * 0.002;
      // wrap
      if (p.y < -20) p.y = height + 20;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#d90429';
    for (let p of particles) {
      ctx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.shift));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Animation loop
  let last = performance.now();
  function loop(now) {
    const dt = now - last;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // Initialize & start
  window.addEventListener('resize', () => {
    resize();
    // throttle re-init
    clearTimeout(window.__particles_resize);
    window.__particles_resize = setTimeout(init, 200);
  });

  init();
  requestAnimationFrame(loop);
})();