
// import { AuthService } from './services/AuthService.mjs';
// import { ErrorService } from './services/ErrorService.mjs';
// import { Validator } from './validation.mjs';
// import { qs, getParam } from './utils.mjs';

// export class ResetPasswordVerification {
//     constructor() {
//         this.token = getParam('token');
//         this.error = getParam('error');
//         this.userId = null;
//         this.init();
//     }

//     async init() {
//         if (this.error) {
//             ErrorService.displayFormError('form-error', decodeURIComponent(this.error));
//             return;
//         }

//         if (!this.token) {
//             ErrorService.displayFormError('form-error', '');
//             return;
//         }

//         try {
//             // Validate token to get userId
//             const response = await fetch(`${AuthService.apiBaseUrl}/api/users/reset-password?token=${this.token}`);
            
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Invalid or expired token');
//             }

//             const data = await response.json();
//             this.userId = data.userId;
//             this.initializeForm();
//         } catch (error) {
//             console.error("Token validation failed:", error);
//             ErrorService.displayFormError('form-error', error.message);
//             setTimeout(() => {
//                 window.location.href = '/forgot-password.html?error=' + encodeURIComponent(error.message);
//             }, 3000);
//         }
//     }

//     initializeForm() {
//         this.form = qs('#reset-password-form');
//         if (this.form) {
//             // Add hidden fields for token and userId
//             const tokenInput = document.createElement('input');
//             tokenInput.type = 'hidden';
//             tokenInput.name = 'token';
//             tokenInput.value = this.token;
//             this.form.appendChild(tokenInput);

//             const userIdInput = document.createElement('input');
//             userIdInput.type = 'hidden';
//             userIdInput.name = 'userId';
//             userIdInput.value = this.userId;
//             this.form.appendChild(userIdInput);

//             this.initEventListeners();
//         }
//     }

//     initEventListeners() {
//         this.form.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             await this.handleResetPassword();
//         });

//         qs('#newPassword').addEventListener('blur', () => this.validateField('newPassword'));
//         qs('#confirmNewPassword').addEventListener('blur', () => this.validateField('confirmNewPassword'));
//     }

//     validateField(fieldName) {
//         const field = qs(`#${fieldName}`);
//         const errorElement = qs(`#${fieldName}-error`);

//         try {
//             switch (fieldName) {
//                 case 'newPassword':
//                     Validator.validatePassword(field.value);
//                     break;
//                 case 'confirmNewPassword':
//                     if (field.value !== qs('#newPassword').value) {
//                         throw new Error('Passwords do not match');
//                     }
//                     break;
//             }
//             errorElement.textContent = '';
//             errorElement.style.display = 'none';
//             return true;
//         } catch (error) {
//             errorElement.textContent = error.message;
//             errorElement.style.display = 'block';
//             return false;
//         }
//     }

//     async handleResetPassword() {
//         ErrorService.clearFormErrors('reset-password-form');
//         const successElement = qs('#form-success');
//         successElement.style.display = 'none'; 
        
//         const submitButton = qs('#reset-password-form .btn');
    
//         // Validate all fields
//         const fieldsValid = ['newPassword', 'confirmNewPassword']
//             .map(field => this.validateField(field))
//             .every(result => result === true);
    
//         if (!fieldsValid || !this.userId || !this.token) {
//             if (!this.userId) {
//                 ErrorService.displayFormError('form-error', 'User verification failed. Please request a new password reset link.');
//             }
//             return;
//         }
    
//         const resetData = {
//             userId: this.userId,
//             token: this.token,
//             newPassword: qs('#newPassword').value,
//             confirmNewPassword: qs('#confirmNewPassword').value
//         };
    
//         try {
//             submitButton.classList.add('loading');
//             submitButton.disabled = true;
    
//             const response = await fetch(`${AuthService.apiBaseUrl}/api/users/reset-password`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(resetData)
//             });
    
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Password reset failed');
//             }
    
//             // Show success message
//             successElement.style.display = 'block';
//             submitButton.disabled = true;
            
//             qs('#newPassword').value = '';
//             qs('#confirmNewPassword').value = '';
            
//             setTimeout(() => {
//                 window.location.href = '/signin.html?reset=success';
//             }, 3000);
            
//         } catch (error) {
//             ErrorService.displayFormError('form-error', error.message);
//         } finally {
//             submitButton.classList.remove('loading');
//         }
//     }

// }

// new ResetPasswordVerification();






















import { AuthService } from './services/AuthService.mjs';
import { ErrorService } from './services/ErrorService.mjs';
import { Validator } from './validation.mjs';
import { qs, getParam } from './utils.mjs';

// export class ResetPasswordVerification {
//     constructor() {
//         this.token = getParam('token');
//         this.error = getParam('error');
//         this.userId = null;
//         this.init();
//     }

//     async init() {
//         if (this.error) {
//             ErrorService.displayFormError('form-error', decodeURIComponent(this.error));
//             return;
//         }

//         if (!this.token) {
//             ErrorService.displayFormError('form-error', '');
//             return;
//         }

//         try {
//             // Validate token to get userId
//             const response = await fetch(`${AuthService.apiBaseUrl}/api/users/reset-password?token=${this.token}`);
            
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Invalid or expired token');
//             }

//             const data = await response.json();
//             this.userId = data.userId;
//             this.initializeForm();
//         } catch (error) {
//             console.error("Token validation failed:", error);
//             ErrorService.displayFormError('form-error', error.message);
//             setTimeout(() => {
//                 window.location.href = '/forgot-password.html?error=' + encodeURIComponent(error.message);
//             }, 3000);
//         }

export class ResetPasswordVerification {
    constructor() {
        // Debug the token immediately
        this.token = getParam('token');
        console.log('Token from URL:', this.token); // Add this line
        
        if (!this.token) {
            console.error('No token found in URL');
            ErrorService.displayFormError('form-error', 'Invalid password reset link');
            return;
        }

        this.error = getParam('error');
        this.userId = null;
        this.init();
    }

    async init() {
        try {
            // Validate token - ADD ENCODING
            const response = await fetch(
                `${AuthService.apiBaseUrl}/api/users/validate-reset-token?token=${encodeURIComponent(this.token)}`
            );
            
            console.log('Token validation response:', response); // Add this

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid or expired token');
            }

            const data = await response.json();
            console.log('Token validation data:', data); // Add this
            
            if (!data.userId) throw new Error('Invalid user ID received');
            
            this.userId = data.userId;
            this.initializeForm();
        } catch (error) {
            console.error("Token validation failed:", error);
            ErrorService.displayFormError('form-error', error.message);
            setTimeout(() => {
                window.location.href = '/forgot-password.html?error=' + encodeURIComponent(error.message);
            }, 3000);
        }
    }

    initializeForm() {
        this.form = qs('#reset-password-form');
        if (this.form) {
            // Add hidden fields for token and userId
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'token';
            tokenInput.value = this.token;
            this.form.appendChild(tokenInput);

            const userIdInput = document.createElement('input');
            userIdInput.type = 'hidden';
            userIdInput.name = 'userId';
            userIdInput.value = this.userId;
            this.form.appendChild(userIdInput);

            this.initEventListeners();
        }
    }

    initEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleResetPassword();
        });

        qs('#newPassword').addEventListener('blur', () => this.validateField('newPassword'));
        qs('#confirmNewPassword').addEventListener('blur', () => this.validateField('confirmNewPassword'));
    }

    validateField(fieldName) {
        const field = qs(`#${fieldName}`);
        const errorElement = qs(`#${fieldName}-error`);

        try {
            switch (fieldName) {
                case 'newPassword':
                    Validator.validatePassword(field.value);
                    break;
                case 'confirmNewPassword':
                    if (field.value !== qs('#newPassword').value) {
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


async handleResetPassword() {
    ErrorService.clearFormErrors('reset-password-form');
    const successElement = qs('#form-success');
    successElement.style.display = 'none'; 
    
    const submitButton = qs('#reset-password-form .btn');

    // Validate all fields
    const fieldsValid = ['newPassword', 'confirmNewPassword']
        .map(field => this.validateField(field))
        .every(result => result === true);

    if (!fieldsValid || !this.userId || !this.token) {
        if (!this.userId) {
            ErrorService.displayFormError('form-error', 'User verification failed. Please request a new password reset link.');
        }
        return;
    }

    const resetData = {
        userId: this.userId,
        token: this.token,
        newPassword: qs('#newPassword').value,
        confirmNewPassword: qs('#confirmNewPassword').value
    };

    try {
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        const response = await fetch(`${AuthService.apiBaseUrl}/api/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resetData),
            credentials: 'include' // Important for cookies if you're using them
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
        }

        // Show success message
        successElement.textContent = data.message;
        successElement.style.display = 'block';
        submitButton.disabled = true;
        
        qs('#newPassword').value = '';
        qs('#confirmNewPassword').value = '';
        
        // Redirect after delay if URL is provided
        if (data.redirectUrl) {
            setTimeout(() => {
                window.location.href = data.redirectUrl;
            }, 3000);
        }
        
    } catch (error) {
        console.error('Reset password error:', error);
        ErrorService.displayFormError('form-error', error.message);
        
        // If token is invalid, redirect to forgot password
        if (error.message.includes('token') && (error.message.includes('invalid') || error.message.includes('expired'))) {
            setTimeout(() => {
                window.location.href = '/forgot-password.html?error=' + encodeURIComponent(error.message);
            }, 3000);
        }
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}
}