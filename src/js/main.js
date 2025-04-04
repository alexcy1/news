
import { loadHeaderFooter } from './utils.mjs';
import { Header } from './components/Header.mjs';
import { Footer } from './components/footer.mjs';
import { Newsletter } from './components/Newsletter.mjs';
import { SignIn } from './components/SignIn.mjs';
import { ForgotPassword } from './forgotPassword.js';
import { ResetPasswordVerification } from './resetPasswordVerification.js';
import { AuthGuard } from './services/AuthGuard.mjs';
import { Profile } from './components/Profile.mjs';
import { AuthService } from './services/AuthService.mjs';
import { HomeNews } from './components/HomeNews.mjs';
import { FavoritesNews } from './components/FavoritesNews.mjs';
import { Services } from './components/Services.mjs';

async function initApp() {
  try {
    AuthGuard.init();

    if (!AuthGuard.shouldInitializeApp()) {
      return;
    }

    // Load common templates
    await loadHeaderFooter();
    
    await Promise.all([
      new Header().init(),
      new Footer().init(),
      new Newsletter().init()
    ]);

    // Initialize page-specific components
    const path = window.location.pathname;
    
    // News components
    if (path.includes('index.html') || path === '/') {
      await new HomeNews().init();
    } 
    else if (path.includes('favourites.html')) {
      await new FavoritesNews().init();
    }
    else if (path.includes('services.html')) {
      await new Services().init();
    }
    // Auth components
    else if (path.includes('profile.html')) {
      await new Profile().init();
    } 
    else if (path.includes('signin.html')) {
      await new SignIn().init();
    } 
    else if (path.includes('forgot-password.html')) {
      new ForgotPassword();
    } 
    else if (path.includes('reset-password-verification.html')) {
      new ResetPasswordVerification();
    }
    else if (path.includes('update-profile.html')) {
      const updateProfileScript = document.createElement('script');
      updateProfileScript.type = 'module';
      updateProfileScript.src = './js/updateProfile.js';
      document.body.appendChild(updateProfileScript);
    }

  } catch (error) {
    handleInitError(error);
  }
}

function handleInitError(error) {
  console.error("App initialization failed:", error);
  
  if (error.message.includes('NetworkError')) {
    showGlobalError("Please check your internet connection and try again.");
  } 
  else if (error.message.includes('401')) {
    window.location.href = `/signin.html?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
  else {
    showGlobalError();
  }
}

function showGlobalError(customMessage) {
  const appContainer = document.getElementById('app') || document.body;
  appContainer.innerHTML = `
    <div class="global-error">
      <h2>Application Error</h2>
      <p>${customMessage || "We're experiencing technical difficulties."}</p>
      <button onclick="window.location.reload()">Reload Page</button>
      <button onclick="window.location.href='/'">Go Home</button>
    </div>
  `;
}

// Start App
if (document.readyState === 'complete') {
  setTimeout(initApp, 0);
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}