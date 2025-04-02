
import { AuthSignin } from '../services/AuthSignin.mjs';
import { ErrorService } from '../services/ErrorService.mjs';
import { Validator } from '../validation.mjs';

export class SignIn {
  constructor() {
    this.form = document.querySelector('.auth-form form');
    this.errorElement = document.querySelector('.auth-form .error-message');
    this.init();
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  }

  async handleLogin() {
    try {
      // Clear previous errors
      if (this.errorElement) {
        this.errorElement.textContent = '';
        this.errorElement.style.display = 'none';
      }

      // Get form data
      const email = this.form.querySelector('#email').value.trim();
      const password = this.form.querySelector('#password').value;

      // Validate
      Validator.validateEmail(email);
      Validator.validateRequiredFields({ email, password }, ['email', 'password']);

      // Show loading state
      const submitButton = this.form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';

      // Call login service
      await AuthSignin.loginUser({ email, password });

      // Redirect happens in AuthSignin.loginUser()
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error to user
      if (this.errorElement) {
        this.errorElement.textContent = error.message;
        this.errorElement.style.display = 'block';
      }

      // Reset button state
      const submitButton = this.form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
      }
    }
  }
}