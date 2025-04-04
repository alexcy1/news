
import { ErrorService } from './ErrorService.mjs';
import { Validator } from '../validation.mjs';


export class AuthService {
  static get apiBaseUrl() {
    if (import.meta.env.PROD) {
      return import.meta.env.VITE_API_BASE_URL || 'https://ellux.onrender.com';
    } else {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    }
  }

  // User Registration
  static get signupUrl() {
    return `${this.apiBaseUrl}/api${import.meta.env.VITE_USER_SIGNUP_URL}`.replace(/([^:]\/)\/+/g, '$1');
  }

  static async registerUser(userData) {
    try {
      Validator.validateRequiredFields(userData, ['username', 'email', 'password', 'confirmPassword']);
      Validator.validateEmail(userData.email);
      
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch(this.signupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const responseClone = response.clone();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await responseClone.json();
        } catch (e) {
          const text = await responseClone.text();
          errorData = { 
            message: text || `HTTP error! Status: ${response.status}`,
            status: response.status
          };
        }
        
        throw new Error(errorData.message || `Registration failed (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  // Password Reset Flow
  static get forgotPasswordUrl() {
    return `${this.apiBaseUrl}/api${import.meta.env.VITE_FORGOT_PASSWORD_URL}`.replace(/([^:]\/)\/+/g, '$1');
  }

  static get validateResetTokenUrl() {
    return `${this.apiBaseUrl}/api${import.meta.env.VITE_VALIDATE_RESET_TOKEN_URL || '/users/validate-reset-token'}`.replace(/([^:]\/)\/+/g, '$1');
  }

  static get resetPasswordUrl() {
    return `${this.apiBaseUrl}/api${import.meta.env.VITE_RESET_PASSWORD_URL}`.replace(/([^:]\/)\/+/g, '$1');
  }

  static async forgotPassword(email) {
    try {
      Validator.validateEmail(email);
      const response = await fetch(this.forgotPasswordUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send password reset email');
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  static async validateResetToken(token) {
    try {
        const response = await fetch(`${this.apiBaseUrl}/api/users/reset-password?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Invalid or expired reset token');
        }

        return data;
    } catch (error) {
        console.error('Token validation error:', error);
        throw error;
    }
}

static async resetPassword(resetData) {
    try {
        Validator.validateRequiredFields(resetData, ['token', 'newPassword', 'confirmNewPassword', 'userId']);
        
        if (resetData.newPassword !== resetData.confirmNewPassword) {
            throw new Error('Passwords do not match');
        }

        const response = await fetch(`${this.apiBaseUrl}/api/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: resetData.token,
                newPassword: resetData.newPassword,
                confirmNewPassword: resetData.confirmNewPassword,
                userId: resetData.userId
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
        }

        return data;
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
}
  
  static async resetPassword(resetData) {
    try {
      Validator.validateRequiredFields(resetData, ['token', 'newPassword', 'confirmNewPassword', 'userId']);
      
      const response = await fetch(this.resetPasswordUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetData.token,
          newPassword: resetData.newPassword,
          confirmNewPassword: resetData.confirmNewPassword,
          userId: resetData.userId
        }),
        credentials: 'include'
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
  
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

static async resetPassword(resetData) {
  try {
    Validator.validateRequiredFields(resetData, ['token', 'newPassword', 'confirmNewPassword']);
    
    const response = await fetch(this.resetPasswordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetData),
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

static async resetPassword(resetData) {
  try {
      Validator.validateRequiredFields(resetData, ['token', 'newPassword', 'confirmNewPassword']);
      Validator.validatePassword(resetData.newPassword);

      if (resetData.newPassword !== resetData.confirmNewPassword) {
          throw new Error('Passwords do not match');
      }

      const response = await fetch(this.resetPasswordUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(resetData),
          credentials: 'include'
      });

      const data = await response.json();
      console.log("api response : ", data);
      console.log("api response status : ", response.status);

      if (!response.ok) {
          throw new Error(data.message || 'Failed to reset password');
      }

      return data;
  } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(this.getUserFriendlyError(error));
  }
}

  // Helper method for consistent error messages
  static getUserFriendlyError(error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message.includes('404')) {
      return 'The service is currently unavailable. Please try again later.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}