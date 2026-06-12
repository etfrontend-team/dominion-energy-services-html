// ══ HERO CANVAS — enhanced molecular network with hub nodes + pulse rings ═
const initHeroCanvas = () => {
  const canvas = document.getElementById('hero-bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const section = canvas.closest('section');

  const PARTICLE_COUNT = 95;
  const HUB_COUNT = 7;          // large anchor nodes that emit pulse rings
  const CONNECT_DIST = 175;
  const SPEED = 0.28;

  // Brand palette
  const COL_NAVY = '56,72,146';
  const COL_BLUE = '31,94,168';
  const COL_HUB  = '38,82,160';  // slightly brighter blue for hub glow

  let W, H, particles;
  let rings = [];               // active pulse ring objects

  const resize = () => {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const initParticles = () => {
    particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const isHub = i < HUB_COUNT;
      return {
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-SPEED, SPEED) * (isHub ? 0.55 : 1),
        vy: rand(-SPEED, SPEED) * (isHub ? 0.55 : 1),
        r: isHub ? rand(5, 8) : (Math.random() > 0.78 ? rand(2.5, 3.5) : rand(1.2, 2)),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.010, 0.026),
        col: isHub ? COL_HUB : (Math.random() > 0.45 ? COL_NAVY : COL_BLUE),
        isHub,
        // Hub pulse ring timer
        ringTimer: isHub ? rand(0, 200) : 0,
        ringInterval: isHub ? rand(160, 320) : 0,
      };
    });
  };

  // Mouse cursor — nearby particles get pulled slightly
  let mouseX = -9999, mouseY = -9999;
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (W / rect.width);
    mouseY = (e.clientY - rect.top)  * (H / rect.height);
  });
  canvas.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // ── Update positions ──────────────────────────────────
    particles.forEach((p) => {
      // Subtle mouse attraction within 120px
      const mdx = mouseX - p.x;
      const mdy = mouseY - p.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 120 && md > 1) {
        p.vx += (mdx / md) * 0.012;
        p.vy += (mdy / md) * 0.012;
      }

      // Speed cap
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpd = SPEED * (p.isHub ? 0.6 : 1.4);
      if (spd > maxSpd) { p.vx = (p.vx / spd) * maxSpd; p.vy = (p.vy / spd) * maxSpd; }

      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      // Wrap
      if (p.x < -24) p.x = W + 24;
      if (p.x > W + 24) p.x = -24;
      if (p.y < -24) p.y = H + 24;
      if (p.y > H + 24) p.y = -24;

      // Hub emits expanding ring
      if (p.isHub) {
        p.ringTimer++;
        if (p.ringTimer >= p.ringInterval) {
          p.ringTimer = 0;
          p.ringInterval = rand(180, 340);
          rings.push({ x: p.x, y: p.y, r: p.r * 1.2, alpha: 0.28, speed: rand(1.2, 2.0) });
        }
      }
    });

    // ── Pulse rings ───────────────────────────────────────
    rings = rings.filter((rg) => rg.alpha > 0.008);
    rings.forEach((rg) => {
      rg.r += rg.speed;
      rg.alpha *= 0.962;
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${COL_HUB},${rg.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // ── Connection lines ──────────────────────────────────
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const baseFade = 1 - dist / CONNECT_DIST;
          const isHubLine = a.isHub || b.isHub;
          const alpha = baseFade * (isHubLine ? 0.32 : 0.18);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${isHubLine ? COL_HUB : a.col},${alpha})`;
          ctx.lineWidth = isHubLine ? 1.1 : 0.75;
          ctx.stroke();
        }
      }
    }

    // ── Particles ─────────────────────────────────────────
    particles.forEach((p) => {
      const pulseMult = 1 + Math.sin(p.pulse) * (p.isHub ? 0.32 : 0.22);
      const r = p.r * pulseMult;

      if (p.isHub) {
        // Radial gradient glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r + 18);
        grd.addColorStop(0,   `rgba(${COL_HUB},0.22)`);
        grd.addColorStop(0.5, `rgba(${COL_HUB},0.08)`);
        grd.addColorStop(1,   `rgba(${COL_HUB},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 18, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COL_HUB},0.72)`;
        ctx.fill();

        // Highlight dot
        ctx.beginPath();
        ctx.arc(p.x - r * 0.28, p.y - r * 0.28, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,0.28)`;
        ctx.fill();
      } else {
        // Regular node — small glow on larger ones
        if (p.r > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.col},0.07)`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col},${p.r > 2 ? 0.50 : 0.32})`;
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(section);

  resize();
  initParticles();
  draw();
};

// ════════════════════════════════════════════════════════════════════════

const initAnimations = () => {
  // Canvas runs regardless of GSAP / reduced-motion (it's decorative, not scroll-driven)
  initHeroCanvas();

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Sync Lenis virtual scroll with ScrollTrigger so it doesn't add phantom body height
  if (window.__lenis) {
    window.__lenis.on('scroll', ScrollTrigger.update);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ══ 1. PARALLAX IMAGES ══════════════════════════════

  // Hero image block — entire block drifts down on scroll (parallax)
  const heroImgWrap = document.getElementById('hero-img-wrap');
  if (heroImgWrap) {
    gsap.to(heroImgWrap, {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4,
      },
    });
  }

  // ══ 2. STAGGER GRID REVEALS ══════════════════════════

  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    gsap.fromTo(
      productsGrid.children,
      { opacity: 0, y: 48, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: productsGrid,
          start: 'top 85%',
          once: true,
        },
      }
    );
  }

  // Expertise bento grid
  const expertiseSec = document.querySelector('section[aria-label="Technical expertise"]');
  if (expertiseSec) {
    const bento = expertiseSec.querySelectorAll('.grid > *');
    gsap.fromTo(
      bento,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.72,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: expertiseSec.querySelector('.grid'),
          start: 'top 88%',
          once: true,
        },
      }
    );
  }

  // ══ 3. SECTION CONTENT STAGGER (each block triggers on its own position) ══

  const EXPAND = new Set(['what-we-do-grid', 'what-we-do-details', 'energy-offering-grid', 'technical-expertise-cards', 'market-cards']);

  const setupAnim = (el) => {
    const inExpand = [...el.classList].some((c) => EXPAND.has(c));
    if (!inExpand) {
      gsap.set(el, { opacity: 0, y: 50 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      return;
    }
    const children = [...el.children];
    const allLeaf = children.every((c) => ![...c.classList].some((cls) => EXPAND.has(cls)));
    if (allLeaf) {
      gsap.set(children, { opacity: 0, y: 50 });
      gsap.to(children, { opacity: 1, y: 0, duration: 0.85, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    } else {
      children.forEach(setupAnim);
    }
  };

  gsap.utils.toArray('main section').forEach((s) => {
    const wrap = s.querySelector(':scope > div');
    if (!wrap) return;
    const direct = Array.from(wrap.children);
    const base = direct.length > 1 ? direct : direct[0] ? Array.from(direct[0].children) : [];
    base.forEach(setupAnim);
  });

  // ══ 4. COUNTER ANIMATION ════════════════════════════

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
      onUpdate() {
        el.textContent = Math.round(obj.val) + suffix;
      },
    });
  });

  // ══ 5. 3D CARD TILT ════════════════════════════════

  document.querySelectorAll('.card-lift').forEach((card) => {
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'box-shadow 0.3s ease';

    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const rx = ((e.clientY - cy) / (height / 2)) * -9;
      const ry = ((e.clientX - cx) / (width / 2)) * 9;
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 900,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      card.style.boxShadow = `${-ry * 0.5}px ${rx * 0.5}px 32px rgba(0,0,0,0.14)`;
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.55)',
        overwrite: 'auto',
      });
      card.style.boxShadow = '';
    });
  });

  // Expertise bento cards 3D tilt
  document.querySelectorAll(
    'section[aria-label="Technical expertise"] .bg-white, section[aria-label="Technical expertise"] .bg-black'
  ).forEach((card) => {
    if (!card.closest('[class*="grid"]')) return;
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const rx = (((e.clientY - top) / height) - 0.5) * -8;
      const ry = (((e.clientX - left) / width) - 0.5) * 8;
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 900,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto',
      });
    });
  });

  // ══ 6. IMPACT STATS SLIDE-IN ════════════════════════

  document.querySelectorAll('section[aria-label*="Creating impact"] .flex.gap-22').forEach((row, i) => {
    gsap.fromTo(
      row,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.85,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });
};

export default initAnimations;
