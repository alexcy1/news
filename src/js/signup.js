
import { AuthService } from './services/AuthService.mjs';
import { ErrorService } from './services/ErrorService.mjs';
import { Validator } from './validation.mjs';
import { qs, setClick } from './utils.mjs';

class Signup {
  constructor() {
    this.form = qs('#signup-form');
    this.submitButton = qs('#signup-form button[type="submit"]');
    this.initEventListeners();
  }

  initEventListeners() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submission
      await this.handleSignup();
    });

    // Add real-time validation
    qs('#username').addEventListener('blur', () => this.validateField('username'));
    qs('#email').addEventListener('blur', () => this.validateField('email'));
    qs('#password').addEventListener('blur', () => this.validateField('password'));
    qs('#confirmPassword').addEventListener('blur', () => this.validateField('confirmPassword'));
    qs('#terms').addEventListener('change', () => this.validateTerms());
  }

  validateField(fieldName) {
    const field = qs(`#${fieldName}`);
    const errorElement = qs(`#${fieldName}-error`);
    
    try {
      switch(fieldName) {
        case 'username':
          Validator.validateUsername(field.value);
          break;
        case 'email':
          Validator.validateEmail(field.value);
          break;
        case 'password':
          Validator.validatePassword(field.value);
          break;
        case 'confirmPassword':
          if (field.value !== qs('#password').value) {
            throw new Error('Passwords do not match');
          }
          break;
      }
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      return true;
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.style.display = 'block';
      return false;
    }
  }

  validateTerms() {
    const termsCheckbox = qs('#terms');
    const errorElement = qs('#terms-error');
    
    try {
      if (!termsCheckbox.checked) {
        throw new Error('You must accept the terms and conditions');
      }
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      return true;
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.style.display = 'block';
      return false;
    }
  }

  async handleSignup() {
    ErrorService.clearFormErrors('signup-form');
    
    // Validate all fields including terms
    const fieldsValid = ['username', 'email', 'password', 'confirmPassword']
      .map(field => this.validateField(field))
      .every(result => result === true);
      
    const termsValid = this.validateTerms();

    if (!fieldsValid || !termsValid) return;

    // Add loading state
    this.submitButton.classList.add('loading');
    this.submitButton.disabled = true;

    const userData = {
      username: qs('#username').value,
      email: qs('#email').value,
      password: qs('#password').value,
      confirmPassword: qs('#confirmPassword').value
    };

    try {
      const response = await AuthService.registerUser(userData);
      
      // On successful registration
      localStorage.setItem('temp-email', userData.email);
      window.location.href = '/verify-email.html';
    } catch (error) {
      ErrorService.displayFormError('form-error', error.message);
    } finally {
      // Remove loading state whether successful or not
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Signup();
});



