import { Controller } from "@hotwired/stimulus"
import { Modal } from "bootstrap"

export default class extends Controller {
    connect() {
    }

    call(e) {
        let message = this.element.getAttribute("data-confirm");
        if (!confirm(message)) {
            e.preventDefault();
        }
    }

    newCall(e) {
        let mainModal = document.getElementById('mainModal');
        let okButton = mainModal.querySelector('#mainModalCompleteBtn');
        let modal = new Modal(mainModal);
        let ask = this.element.getAttribute("data-confirm");
        if (e.target.hasAttribute("data-confirmed")) {
            console.log(e.target);
            return e.target.removeAttribute("data-confirmed");
        }

        e.preventDefault();
        mainModal.querySelector('.modal-body').textContent = ask;
        let containsDelete = ask.toLowerCase().includes("удал");
        okButton.textContent = containsDelete ? "Удалить" : "ОК";
        mainModal.querySelector('#mainModalTitle').textContent = 'Внимание!';
        okButton.classList.remove('btn-primary');
        okButton.classList.add('btn-danger');
        modal.show();

        okButton.addEventListener("click", () => {
            modal.hide();
            e.target.setAttribute("data-confirmed", "true");
            e.target.click();
            setTimeout(() => {
                e.target.removeAttribute("data-confirmed");
            }, 0)
        })
    }
}
