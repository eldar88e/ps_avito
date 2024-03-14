// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import "bootstrap/dist/js/bootstrap"
import "./main"

import { Fancybox } from "@fancyapps/ui";
document.addEventListener("DOMContentLoaded", function() {
    Fancybox.bind("[data-fancybox]");
});
