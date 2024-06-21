import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    clearForm() {
        document.addEventListener("turbo:submit-end", (event) => {
            if (event.detail.success) {
                this.element.reset();
            }
        });
    }
}
