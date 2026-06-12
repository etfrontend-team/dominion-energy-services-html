const initHeader = () => {
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav-close');

  // ── Topbar Swiper ──
  if (typeof window.Swiper !== 'undefined' && document.querySelector('#topbar-swiper')) {
    new window.Swiper('#topbar-swiper', {
      direction: 'horizontal',
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      allowTouchMove: false,
      speed: 1500,
    });
  }

  // ── Topbar contact dropdown (mobile) ──
  const topbarToggle = document.getElementById('topbar-contact-toggle');
  const topbarDropdown = document.getElementById('topbar-contact-dropdown');

  if (topbarToggle && topbarDropdown) {
    topbarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = topbarDropdown.classList.toggle('is-open');
      topbarToggle.setAttribute('aria-expanded', String(isOpen));
      topbarDropdown.setAttribute('aria-hidden', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!topbarToggle.contains(e.target) && !topbarDropdown.contains(e.target)) {
        topbarDropdown.classList.remove('is-open');
        topbarToggle.setAttribute('aria-expanded', 'false');
        topbarDropdown.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ── Sticky shadow on scroll ──
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (!hamburger || !mobileNav) return;

  mobileNav.querySelectorAll('.mobile-nav-links > *').forEach((item, index) => {
    item.style.setProperty('--nav-delay', `${80 + index * 30}ms`);
  });

  const isNavOpen = () => mobileNav.classList.contains('is-open');

  const closeNav = () => {
    if (!isNavOpen()) return;
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  // ── Hamburger toggle ──
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // ── Close button inside nav ──
  if (closeBtn) {
    closeBtn.addEventListener('click', closeNav);
  }

  // ── Close on outside click ──
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      closeNav();
    }
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        closeNav();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Close nav on mobile nav link click ──
  document.querySelectorAll('.mobile-nav-item, .mobile-nav-sub-item').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
};

export default initHeader;
