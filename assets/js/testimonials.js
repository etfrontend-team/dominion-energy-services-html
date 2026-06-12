export default function initTestimonials() {
  const slider = document.querySelector('[data-testimonials-swiper]');
  if (!slider || typeof window.Swiper === 'undefined') {
    return;
  }

  const pagination = slider.querySelector('[data-testimonials-pagination]');

  new window.Swiper(slider, {
    slidesPerView: 1,
    spaceBetween: 20,
    speed: 700,
    loop: false,
    grabCursor: true,
    slidesPerGroup: 1,
    pagination: {
      el: pagination,
      clickable: true,
    },
    breakpoints: {
      769: {
        slidesPerView: 2,
        spaceBetween: 21,
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 21,
      },
    },
  });
}
