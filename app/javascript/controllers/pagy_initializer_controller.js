import { Controller } from "@hotwired/stimulus";
import Pagy from "../others/pagy.mjs";

export default class extends Controller {
    connect() {
        Pagy.init(this.element);
    }
}
