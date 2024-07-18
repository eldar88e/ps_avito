import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    call(e) {
        console.log('Hell');
        this.element.classList.toggle('collapse-bar');
    }
}
