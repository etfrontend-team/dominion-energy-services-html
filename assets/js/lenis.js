export default function initLenis() {
  if (!window.Lenis) return;
  const lenis = new window.Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenis;
}
