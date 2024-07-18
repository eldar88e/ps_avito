import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.removeAlert();
        }, 5000)
    }

    removeAlert() {
        const alerts = this.element;
        alerts.remove();
    }
}