import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.fadeOutAndRemove();
        }, 7000)
    }

    fadeOutAndRemove() {
        // Добавляем класс для анимации прозрачности
        this.element.classList.add("fade-out");
        // Ждем 0.5 секунды (время анимации) и удаляем элемент
        setTimeout(() => {
            this.element.remove();
        }, 1000);
    }

    close() {
        clearInterval(this.timer);
        this.fadeOutAndRemove();
    }
}