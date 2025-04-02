
import { AuthService } from './services/AuthService.mjs';
import { ErrorService } from './services/ErrorService.mjs';
import { Validator } from './validation.mjs';
import { qs } from './utils.mjs';

export class ForgotPassword {
    constructor() {
        setTimeout(() => {
            this.initialize();
        }, 50);
    }

    initialize() {
        this.form = qs('#forgot-password-form');
        this.initEventListeners();
    }

    initEventListeners() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleForgotPassword();
        });

        qs('#email').addEventListener('blur', () => this.validateField('email'));
    }

    validateField(fieldName) {
        const field = qs(`#${fieldName}`);
        const errorElement = qs(`#${fieldName}-error`);
        
        try {
            switch(fieldName) {
                case 'email':
                    Validator.validateEmail(field.value);
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

    async handleForgotPassword() {
        ErrorService.clearFormErrors('forgot-password-form');
        const successElement = qs('#form-success');
        successElement.style.display = 'none'; // Hide success message on new submission
        
        const emailValid = this.validateField('email');
        if (!emailValid) return;
    
        const email = qs('#email').value;
        const submitButton = qs('#forgot-password-form .btn');
    
        try {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
    
            const response = await fetch(`${AuthService.apiBaseUrl}/api/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send password reset email');
            }
    
            // Show success message instead of redirecting
            successElement.style.display = 'block';
            localStorage.setItem('temp-email', email);
            
        } catch (error) {
            ErrorService.displayFormError('form-error', error.message);
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

}