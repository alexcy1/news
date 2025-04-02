
export class ErrorService {
  static handleApiError(error) {
    console.error('API Error:', error);
    return error.message; // Now AuthService formats all error messages
  }

  static displayFormError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    }
  }

  static clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
      const errorElements = form.querySelectorAll('.error-message');
      errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
      });
    }
  }
}