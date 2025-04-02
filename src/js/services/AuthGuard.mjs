
import { AuthSignin } from './AuthSignin.mjs';

export class AuthGuard {
  static init() {
    this.protectCurrentRoute();
    this.preventAuthenticatedAccess();
  }

  static protectCurrentRoute() {
    if (this.isProtectedRoute(window.location.pathname) && !AuthSignin.checkAuth()) {
      this.redirectToSignin();
      return false;
    }
    return true;
  }

  static preventAuthenticatedAccess() {
    if (this.isAuthPage() && AuthSignin.checkAuth()) {
      this.redirectToHome();
      return false;
    }
    return true;
  }

  static shouldInitializeApp() {
    return this.protectCurrentRoute() && this.preventAuthenticatedAccess();
  }

  static isProtectedRoute(path) {
    const protectedRoutes = ['/', '/index.html', '/profile.html'];
    return protectedRoutes.includes(path);
  }

  static isAuthPage() {
    return window.location.pathname.includes('signin.html') || 
           window.location.pathname.includes('signup.html');
  }

  static redirectToSignin() {
    window.location.href = '/signin.html';
  }

  static redirectToHome() {
    window.location.href = '/index.html';
  }

  static checkAuth() {
    return AuthSignin.checkAuth();
  }
}