import initHeader from './header.js';
import initCounter from './counter.js';
import initCharts from './charts.js';
import initTestimonials from './testimonials.js';
import initLenis from './lenis.js';
import initAnimations from './animations.js';

document.addEventListener('DOMContentLoaded', function () {
  initLenis();
  initHeader();
  initCounter();
  initCharts();
  initTestimonials();
  initAnimations();
});
