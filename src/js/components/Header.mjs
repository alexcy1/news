

import { qs, setClick } from '../utils.mjs';
import { DOMService } from '../services/DOMService.mjs';
import { Validator } from '../validation.mjs';
import { AuthLogout } from '../services/AuthLogout.mjs'; 

export class Header {
  constructor() {
    // Existing elements
    this.toggler = qs(".navbar-toggler");
    this.navCollapse = qs("#navbarNav");
    this.logoData = {
      src: "images/logo.png",
      alt: "Logo",
      class: "navbar-brand-img",
      width: 225,
      height: 225,
      url: "index.html"
    };
    this.companyData = {
      nameTop: "rruki",
      url: "index.html"
    };

    // New auth-related elements
    this.authElements = {
      profileImage: qs('.profile-menu-image'),
      userName: qs('.user-name'),
      signInBtn: qs('.sign-in-btn'),
      userDropdown: qs('.user-dropdown'),
      dropdownMenu: qs('.dropdown-menu')
    };

    this.menuItems = {
      home: qs('.navbar-item a[href="index.html"]')?.parentElement,
      about: qs('.navbar-item a[href="about.html"]')?.parentElement,
      services: qs('.navbar-item a[href="services.html"]')?.parentElement,
      favourites: qs('.navbar-item a[href="favourites.html"]')?.parentElement,
      userDropdown: qs('.user-dropdown')
    };
  }

  init() {
    try {
      this.validateData();
      this.setupMobileMenu();
      this.injectBranding();
      this.setupAuthUI(); // New method for auth functionality
      this.updateMenuVisibility();
    } catch (error) {
      console.error("Header initialization error:", error);
      this.showErrorState();
    }
  }

  // Add this new method
  updateMenuVisibility() {
    const isLoggedIn = Header.checkAuth();
    
    // Always show home
    if (this.menuItems.home) {
      this.menuItems.home.style.display = 'block';
    }
    
    // Show/hide other menu items based on auth status
    const itemsToToggle = [
      this.menuItems.home,
      this.menuItems.about,
      this.menuItems.services,
      this.menuItems.favourites,
      this.menuItems.userDropdown
    ];
    
    itemsToToggle.forEach(item => {
      if (item) {
        item.style.display = isLoggedIn ? 'block' : 'none';
      }
    });
    
    // Special handling for sign-in button
    if (this.authElements.signInBtn) {
      this.authElements.signInBtn.style.display = isLoggedIn ? 'none' : 'block';
      this.authElements.signInBtn.textContent = 'Sign In';
      this.authElements.signInBtn.href = 'signin.html';
    }
  }

  validateData() {
    Validator.validateRequiredFields(this.logoData, ["src", "alt", "url"]);
    Validator.validateRequiredFields(this.companyData, ["nameTop", "url"]);
  }

  setupMobileMenu() {
    try {
      Validator.validateElement(this.toggler, "Menu toggler");
      Validator.validateElement(this.navCollapse, "Nav collapse");
      
      setClick(".navbar-toggler", () => {
        this.toggler.classList.toggle("open");
        this.navCollapse.classList.toggle("show");
      });
    } catch (error) {
      console.error("Header menu setup error:", error);
      throw error;
    }
  }

  injectBranding() {
    try {
      DOMService.injectLogo(".logo-container", this.logoData);
      DOMService.injectCompanyName(".navbar-brand", this.companyData);
    } catch (error) {
      console.error("Header branding error:", error);
      throw error;
    }
  }

  // NEW AUTH-RELATED METHODS
  setupAuthUI() {
    this.setupDropdownToggle();
    this.setupDropdownLinks();
    this.updateAuthState();
    this.checkAuthRedirect();
  }

  setupDropdownToggle() {
    if (this.authElements.profileImage) {
      this.authElements.profileImage.addEventListener('click', (e) => {
        e.preventDefault();
        this.authElements.dropdownMenu?.classList.toggle('show');
        e.stopPropagation();
      });

      document.addEventListener('click', (e) => {
        if (!this.authElements.dropdownMenu?.contains(e.target) && 
            !this.authElements.profileImage?.contains(e.target)) {
          this.authElements.dropdownMenu?.classList.remove('show');
        }
      });
    }
  }

  setupDropdownLinks() {
    const links = this.authElements.dropdownMenu?.querySelectorAll('.dropdown-link');
    if (links) {
        // Profile link
        links[0]?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'profile.html';
        });

        // Update profile link
        links[1]?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'update-profile.html';
        });

        // Delete account link
        links[2]?.addEventListener('click', (e) => this.handleDeleteUser(e));

        // Logout link (4th item)
        links[3]?.addEventListener('click', (e) => this.handleLogout(e));
    }
}

// components/Header.mjs
handleLogout(e) {
  e.preventDefault();
  e.stopPropagation();
  AuthLogout.logout().then(() => {
      // Optional: You can add any additional cleanup here
      console.log('Logout completed successfully');
  });
}

// components/Header.mjs
handleDeleteUser(e) {
  e.preventDefault();
  e.stopPropagation();
  localStorage.clear();
  window.location.href = '/signin.html?accountDeleted=true';
}

  updateAuthState() {
    const userData = JSON.parse(localStorage.getItem('user'));
    const profileData = JSON.parse(localStorage.getItem('userProfile'));
  
    if (userData) {
      // User is logged in
      if (this.authElements.userName) {
        this.authElements.userName.textContent = userData.username || 'User';
      }
      
      // Use profile image if available
      let profileImage = '';
      if (profileData?.profile?.profileImage) {
        profileImage = profileData.profile.profileImage;
      } else if (userData.profileImage) {
        profileImage = userData.profileImage;
      }
      
      if (profileImage && this.authElements.profileImage) {
        this.authElements.profileImage.setAttribute('src', profileImage);
        this.authElements.profileImage.setAttribute('alt', `${userData.username}'s profile picture`);
      }
  
      if (this.authElements.userDropdown) {
        this.authElements.userDropdown.style.display = 'block';
      }
      if (this.authElements.signInBtn) {
        this.authElements.signInBtn.style.display = 'none';
      }
    } else {
      // User is logged out
      if (this.authElements.userDropdown) {
        this.authElements.userDropdown.style.display = 'none';
      }
      if (this.authElements.signInBtn) {
        this.authElements.signInBtn.style.display = 'block';
      }
    }
  }

  checkAuthRedirect() {
    const userData = JSON.parse(localStorage.getItem('user'));
    const currentPage = window.location.pathname.split('/').pop();

    if (userData && ['signup.html', 'signin.html'].includes(currentPage)) {
      window.location.href = 'profile.html';
    }
  }

  showErrorState() {
    const header = qs("header");
    if (header) {
      header.innerHTML += `<div class="header-error">Navigation failed to load</div>`;
    }
  }

  // Static method to check auth from other components
  static checkAuth() {
    return JSON.parse(localStorage.getItem('user'));
  }

}






































































