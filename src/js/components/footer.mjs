import { qs } from '../utils.mjs';
import { Validator } from '../validation.mjs';

export class Footer {
  constructor() {
    this.yearElement = qs('#year');
    this.lastModifiedElement = qs('#lastModified');
  }

  init() {
    try {
      this.validateElements();
      this.updateYear();
      this.updateLastModified();
    } catch (error) {
      console.error("Footer initialization error:", error);
      this.showErrorState();
    }
  }

  validateElements() {
    Validator.validateElement(this.yearElement, "Year element");
    Validator.validateElement(this.lastModifiedElement, "Last modified element");
  }

  updateYear() {
    this.yearElement.textContent = new Date().getFullYear();
  }

  updateLastModified() {
    this.lastModifiedElement.textContent = document.lastModified;
  }

  showErrorState() {
    const footer = qs('footer');
    if (footer) {
      footer.innerHTML += `<div class="footer-error">Footer failed to load</div>`;
    }
  }
}