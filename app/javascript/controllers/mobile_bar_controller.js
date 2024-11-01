import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    showLeftBar() {
        document.querySelector('.left-bar').classList.toggle('hidden-left-bar');
    }

    showMainMenu() {
        document.querySelector('.navbar-toggler').click();
    }

    up() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
