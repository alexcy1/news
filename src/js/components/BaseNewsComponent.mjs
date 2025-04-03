
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
      const user = getLocalStorage('user');
      if (!user) return false;
      
      // Ensure user object has required properties
      if (typeof user === 'object' && (user.id || user._id)) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  getCurrentUserId() {
    try {
      const user = getLocalStorage('user');
      if (!user) {
        console.warn('No user found in localStorage');
        return null;
      }

      // Handle different user object structures
      if (typeof user === 'object') {
        return user.id || user._id || null;
      }
      return user;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  async loadFavorites() {
    try {
      this.favorites = this.getFavorites();
      console.log('Loaded favorites:', this.favorites);
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
        console.log('No user ID - cannot retrieve favorites');
        return [];
      }
      
      const favoritesKey = `user_${userId}_favorites`;
      const favorites = getLocalStorage(favoritesKey);
      
      if (!Array.isArray(favorites)) {
        console.log('No valid favorites array found - initializing new one');
        return [];
      }
      
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
        console.error('Cannot update favorites - no user ID');
        return false;
      }
      
      const favoritesKey = `user_${userId}_favorites`;
      const success = setLocalStorage(favoritesKey, updatedFavorites);
      
      if (success) {
        this.favorites = updatedFavorites;
        console.log(`Successfully updated ${updatedFavorites.length} favorites`);
      } else {
        console.error('Failed to update favorites in localStorage');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating favorites:', error);
      return false;
    }
  }

  toggleFavorite(article, button = null) {
    if (!article || !article.url) {
      console.error('Invalid article - cannot toggle favorite');
      return false;
    }

    try {
      let favorites = this.getFavorites();
      const existingIndex = favorites.findIndex(fav => fav.url === article.url);
      
      if (existingIndex >= 0) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        if (button) {
          button.textContent = '☆ Add to Favorites';
          button.classList.remove('active');
        }
      } else {
        // Add to favorites - store only necessary data
        const favoriteArticle = {
          title: article.title,
          url: article.url,
          published_date: article.published_date,
          abstract: article.abstract,
          multimedia: article.multimedia ? [article.multimedia[0]] : null,
          section: article.section
        };
        favorites.push(favoriteArticle);
        if (button) {
          button.textContent = '★ Favorited';
          button.classList.add('active');
        }
      }
      
      const success = this.updateFavorites(favorites);
      if (!success) {
        console.error('Failed to update favorites storage');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  migrateAnonymousFavorites() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.log('User not logged in - skipping favorites migration');
        return;
      }
      
      const anonymousFavorites = getLocalStorage('anonymous_favorites') || [];
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
        localStorage.removeItem('anonymous_favorites');
        console.log(`Migrated ${addedCount} favorites to user account`);
      }
    } catch (error) {
      console.error('Error migrating favorites:', error);
    }
  }

  showError(message = 'An unexpected error occurred') {
    console.error('Displaying error:', message);
    // Implementation should be provided by child classes
  }
}