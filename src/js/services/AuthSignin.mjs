
import { ErrorService } from './ErrorService.mjs';
import { Validator } from '../validation.mjs';

// export class AuthSignin {
//   static get apiBaseUrl() {
//     // Use the same configuration as your working AuthService
//     return import.meta.env.PROD 
//       ? import.meta.env.VITE_API_BASE_URL 
//       : 'http://localhost:3000';
//   }


export class AuthSignin {
  static get apiBaseUrl() {
    // Use the same configuration as your working AuthService
    return import.meta.env.PROD
      ? import.meta.env.VITE_API_BASE_URL || 'https://ellux.onrender.com'
      : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  static get loginUrl() {
    return `${this.apiBaseUrl}/api/users/login`;
  }

  static async loginUser(credentials) {
    try {
      // Input validation (keep your existing validation)
      Validator.validateRequiredFields(credentials, ['email', 'password']);
      Validator.validateEmail(credentials.email);

      console.log('Making request to:', this.loginUrl);

      const response = await fetch(this.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      // Handle response (keep your existing response handling)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned unexpected format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      /* CRITICAL FIX: Add return statement before redirect */
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('authTime', Date.now());

      // Debug log to verify we reach this point
      console.log('Login successful, redirecting...');

      // Redirect after successful login
      window.location.href = '/index.html';

      return data; // This may not be reached due to redirect
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error messages
      let userMessage;
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Unable to connect to server. Check your connection.';
      } else if (error.message.includes('404')) {
        userMessage = 'Login service unavailable. Please try again later.';
      } else if (error.message.includes('401')) {
        userMessage = 'Invalid email or password.';
      } else {
        userMessage = error.message || 'Login failed. Please try again.';
      }
      
      // IMPORTANT: Re-throw the error to be caught by the SignIn component
      throw new Error(userMessage);
    }
  }

  // Keep these utility methods
  static checkAuth() {
    const token = localStorage.getItem('token');
    const authTime = localStorage.getItem('authTime');
    const ONE_HOUR = 3600000;
    
    if (!token || !authTime) return false;
    
    if (Date.now() - parseInt(authTime) > ONE_HOUR) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  static clearAuth() {
    ['token', 'user', 'authTime', 'refreshToken'].forEach(item => 
      localStorage.removeItem(item)
    );
  }
}