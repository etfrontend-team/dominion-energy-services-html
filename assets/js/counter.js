const initCounter = () => {
  const statsSection = document.querySelector('.stats-section');

  if (!statsSection) return;

  const statEls = statsSection.querySelectorAll('.stat-number h3');
  let animated = false;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el, target, suffix, duration = 1800) => {
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutQuart(progress) * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statEls.forEach((el) => {
          const raw = el.textContent.trim();
          const suffix = raw.replace(/[0-9]/g, '');
          const target = parseInt(raw, 10);
          el.textContent = '0' + suffix;
          animateCounter(el, target, suffix);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.4 }
  );

  observer.observe(statsSection);
};

export default initCounter;
