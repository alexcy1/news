
export class AuthLogout {
    static get apiBaseUrl() {
      return import.meta.env.PROD 
        ? import.meta.env.VITE_API_BASE_URL 
        : '/api';
    }
  
    static get logoutUrl() {
      return `${this.apiBaseUrl}/users/logout`.replace(/([^:]\/)\/+/g, '$1');
    }
  
    static async logout() {
      try {
        ['user', 'token', 'refreshToken'].forEach(item => localStorage.removeItem(item));
        
        // Call backend logout endpoint
        await fetch(this.logoutUrl, {
          method: 'POST',
          credentials: 'include'
        });
  
        // Redirect to signin page with cache-busting
        window.location.href = '/signin.html?logout=' + Date.now();
      } catch (error) {
        console.error('Logout failed:', error);
        localStorage.clear();
        window.location.replace('/signin.html');
      }
    }
  }