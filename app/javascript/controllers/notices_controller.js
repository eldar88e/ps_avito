import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        const observer = new MutationObserver(this.handleMutation.bind(this));
        observer.observe(this.element, { childList: true, subtree: true });

        async function removeElementsWithDelay(elements) {
            for (const element of elements) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                element.style.opacity = 0;
                element.style.height = 0;
                element.style.margin = 0;
                element.style.padding = 0;
                await new Promise(resolve => setTimeout(resolve, 2000));
                element.remove();
            }
        }

        const startList = this.element.querySelectorAll('div');
        removeElementsWithDelay(startList);
    }

    handleMutation(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const newDivs = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE && node.classList.contains('alert'));
                if (newDivs.length > 0) {
                    this.removeAlertsWithDelay(newDivs, 0);
                }
            }
        }
    }

    removeAlertsWithDelay(alerts, index) {
        if (index < alerts.length) {
            setTimeout(() => {
                alerts[index].style.opacity = 0;
                alerts[index].style.margin = 0;
                alerts[index].style.padding = 0;
                alerts[index].style.height = 0;
                setTimeout(() => {
                    alerts[index].remove();
                    this.removeAlertsWithDelay(alerts, index + 1);
                }, 2000);
            }, 2000);
        }
    }
}