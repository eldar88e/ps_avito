import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = {
        noImageUrl: String
    };

    connect() {
        this.noImageUrlValue = window.location.origin + window.noimage_url;
        this.processImages();
    }

    processImages() {
        const images = this.element.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', this.handleImageError.bind(this));
        });
    }

    handleImageError(event) {
        const img = event.target;
        img.src = this.noImageUrlValue;
        img.removeEventListener('error', this.handleImageError);
    }
}