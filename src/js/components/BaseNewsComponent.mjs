import { qs, setClick, getLocalStorage, setLocalStorage } from '../utils.mjs';

export class BaseNewsComponent {
  constructor() {
    this.articles = [];
    this.currentPage = 0;
    this.articlesPerPage = 12;
    this.filteredArticles = [];
    this.activeSectionElement = null;
    this.favorites = [];
    this.modal = null;
    this.modalTitle = null;
    this.modalAbstract = null;
    this.modalImage = null;
    this.modalDate = null;
    this.viewArticleBtn = null;
  }

  initModal() {
    try {
      this.modal = qs('#article-modal');
      if (!this.modal) {
        console.warn('Modal element not found');
        return;
      }

      this.modalTitle = qs('#modal-title', this.modal);
      this.modalAbstract = qs('#modal-abstract', this.modal);
      this.modalImage = qs('#modal-image', this.modal);
      this.modalDate = qs('#modal-date', this.modal);
      this.viewArticleBtn = qs('#view-article', this.modal);

      if (!this.modalTitle || !this.modalAbstract || !this.modalImage || !this.viewArticleBtn) {
        console.warn('One or more modal elements not found');
        return;
      }

      setClick('.close-button', () => this.closeModal());
      setClick('#view-article', () => this.handleViewArticle());
    } catch (error) {
      console.error('Error initializing modal:', error);
    }
  }

  openModal(article) {
    if (!this.modal || !article) return;

    try {
      this.modalTitle.textContent = article.title || 'No title available';
      this.modalAbstract.textContent = article.abstract || 'No abstract available';
      this.modalImage.src = article.multimedia?.[0]?.url || 'default-image-url.jpg';
      this.modalImage.alt = article.title || 'Article image';
      
      const pubDate = article.published_date ? 
        new Date(article.published_date).toLocaleDateString() : 
        'Date not available';
      this.modalDate.textContent = pubDate;
      
      if (article.url) {
        this.viewArticleBtn.setAttribute('data-url', article.url);
      } else {
        this.viewArticleBtn.removeAttribute('data-url');
      }
      
      this.modal.style.display = 'block';
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  handleViewArticle() {
    try {
      if (!this.viewArticleBtn) return;
      
      const articleUrl = this.viewArticleBtn.getAttribute('data-url');
      if (articleUrl) {
        window.open(articleUrl, '_blank');
      }
      this.closeModal();
    } catch (error) {
      console.error('Error handling view article:', error);
    }
  }

  checkUserLoggedIn() {
    try {
      return !!getLocalStorage('user');
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  getCurrentUserId() {
    try {
      const user = getLocalStorage('user');
      return user?.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  async loadFavorites() {
    try {
      this.favorites = this.getFavorites();
      console.log('Loaded favorites:', this.favorites.length);
      return this.favorites;
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
      return [];
    }
  }

  getFavorites() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.log('No user ID - returning empty favorites');
        return [];
      }
      
      const favoritesKey = `user_${userId}_favorites`;
      const favorites = getLocalStorage(favoritesKey) || [];
      console.log(`Retrieved ${favorites.length} favorites for user ${userId}`);
      return favorites;
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  updateFavorites(updatedFavorites) {
    try {
      if (!Array.isArray(updatedFavorites)) {
        console.error('Invalid favorites data - expected array');
        return false;
      }

      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('No user ID - cannot update favorites');
        return false;
      }
      
      const favoritesKey = `user_${userId}_favorites`;
      const success = setLocalStorage(favoritesKey, updatedFavorites);
      
      if (success) {
        console.log(`Successfully updated ${updatedFavorites.length} favorites`);
        this.favorites = updatedFavorites; // Update local cache
      } else {
        console.error('Failed to update favorites in localStorage');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating favorites:', error);
      return false;
    }
  }

  migrateAnonymousFavorites() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.log('No user ID - skipping favorites migration');
        return;
      }
      
      const anonymousFavorites = getLocalStorage('favourites') || [];
      if (anonymousFavorites.length === 0) {
        console.log('No anonymous favorites to migrate');
        return;
      }
      
      console.log(`Migrating ${anonymousFavorites.length} anonymous favorites`);
      
      const userFavorites = this.getFavorites();
      const newFavorites = [...userFavorites];
      let addedCount = 0;
      
      anonymousFavorites.forEach(article => {
        if (!newFavorites.some(fav => fav.url === article.url)) {
          newFavorites.push(article);
          addedCount++;
        }
      });
      
      if (addedCount > 0) {
        this.updateFavorites(newFavorites);
        localStorage.removeItem('favourites');
        console.log(`Migrated ${addedCount} favorites to user account`);
      } else {
        console.log('No new favorites to migrate - all already exist');
      }
    } catch (error) {
      console.error('Error migrating favorites:', error);
    }
  }

  showError(message = 'An unexpected error occurred') {
    console.error('Displaying error:', message);
    // This should be implemented by child classes
  }
}