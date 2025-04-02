import { qs } from '../utils.mjs';
import { Validator } from '../validation.mjs';

export class Newsletter {
  constructor() {
    this.form = qs('#newsletter-form');
    this.modal = qs('#successModal');
    this.successMessage = qs('#successMessage');
    this.emailInput = qs('#email', this.form);
  }

  init() {
    try {
      this.validateElements();
      this.setupEventListeners();
    } catch (error) {
      console.error("Newsletter initialization error:", error);
      this.showErrorState();
    }
  }

  validateElements() {
    Validator.validateElement(this.form, "Newsletter form");
    Validator.validateElement(this.modal, "Success modal");
    Validator.validateElement(this.emailInput, "Email input");
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.setupModalClose();
  }

  handleSubmit(e) {
    e.preventDefault();
    
    try {
      const email = this.emailInput.value.trim();
      Validator.validateEmail(email);
      this.showSuccessMessage(email);
      this.form.reset();
    } catch (error) {
      this.showValidationError(error.message);
    }
  }

  showSuccessMessage(email) {
    this.successMessage.textContent = `Thank you! You've subscribed with: ${email}`;
    this.modal.style.display = 'block';
  }

  showValidationError(message) {
    let errorElement = qs('.newsletter-error', this.form);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'newsletter-error';
      this.form.insertBefore(errorElement, this.form.firstChild);
    }
    errorElement.textContent = message;
  }

  setupModalClose() {
    const closeButton = qs('.close', this.modal);
    if (!closeButton) return;

    closeButton.onclick = () => this.modal.style.display = 'none';
    
    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.modal.style.display = 'none';
      }
    };
  }
}