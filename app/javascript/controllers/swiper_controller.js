import { Controller } from "@hotwired/stimulus";
import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';

export default class extends Controller {
    connect() {
      this.swiper = new Swiper('.games_swiper', {
        modules: [Navigation, Autoplay],

        // Optional parameters
        slidesPerView: 12,
        spaceBetween: 5,
        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerView: 2,
            spaceBetween: 5
          },
          // when window width is >= 480px
          480: {
            slidesPerView: 3,
            spaceBetween: 5
          },
          // when window width is >= 768px
          768: {
            slidesPerView: 5,
            spaceBetween: 5
          },
          // when window width is >= 992px
          992: {
            slidesPerView: 12,
            spaceBetween: 5
          }
        },
        loop: true,
        autoplay: {
          delay: 3000,
        },

        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
    }
}
