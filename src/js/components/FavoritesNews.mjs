import { BaseNewsComponent } from './BaseNewsComponent.mjs';
import { qs, setClick } from '../utils.mjs';

export class FavoritesNews extends BaseNewsComponent {
  constructor() {
    super();
    this.articlesContainer = qs('.articles-container');
    this.favorites = [];
  }

  async init() {
    try {
      if (!this.checkUserLoggedIn()) {
        window.location.href = '/signin.html?redirect=favorites.html';
        return;
      }

      this.initModal();
      await this.loadFavorites();
      this.displayFavorites();
      this.setupEventListeners();
      this.updateLastVisited();
    } catch (error) {
      console.error('Error initializing FavoritesNews:', error);
      this.showError();
    }
  }

  async loadFavorites() {
    try {
      this.favorites = this.getFavorites();
      console.log('Loaded favorites:', this.favorites); // Debug log
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
    }
  }

  displayFavorites() {
    if (!this.articlesContainer) {
      console.error('Articles container not found');
      return;
    }

    if (this.favorites.length === 0) {
      this.articlesContainer.innerHTML = `
        <div class="no-favorites">
          <h3>No favorites added yet</h3>
          <p>Add articles to your favorites from the home page to see them here.</p>
          <a href="/" class="home-link">Browse Articles</a>
        </div>
      `;
      return;
    }

    this.articlesContainer.innerHTML = '';
    
    this.favorites.forEach((article, index) => {
      if (!article || !article.title) {
        console.warn('Invalid article at index:', index);
        return;
      }

      const articleCard = document.createElement('div');
      articleCard.classList.add('articles-card');
      
      const imgUrl = article.multimedia?.[0]?.url || 'default-image-url.jpg';
      const date = article.published_date ? new Date(article.published_date).toLocaleDateString() : 'Date not available';

      articleCard.innerHTML = `
        <img src="${imgUrl}" 
             alt="${article.title}" 
             class="article-image" 
             loading="lazy" />
        <h2 class="article-headline">${article.title}</h2>
        <p class="article-date">${date}</p>
        <button class="details-button" data-article='${JSON.stringify(article)}'>Details</button>
        <a href="${article.url}" target="_blank" class="view-button">View</a>
        <button class="delete-favourite-button" data-index="${index}">Delete Favourite</button>
      `;
      this.articlesContainer.appendChild(articleCard);
    });
  }

  setupEventListeners() {
    if (!this.articlesContainer) return;

    // Use arrow functions to maintain 'this' context
    this.articlesContainer.addEventListener('click', (event) => {
      const target = event.target;
      
      if (target.classList.contains('details-button')) {
        try {
          const article = JSON.parse(target.dataset.article);
          this.openModal(article);
        } catch (error) {
          console.error('Error parsing article data:', error);
        }
      }
      
      if (target.classList.contains('delete-favourite-button')) {
        const index = parseInt(target.dataset.index);
        if (!isNaN(index)) {
          this.removeFavorite(index);
        }
      }
    });
  }

  removeFavorite(index) {
    if (index < 0 || index >= this.favorites.length) {
      console.error('Invalid favorite index:', index);
      return;
    }

    this.favorites.splice(index, 1);
    this.updateFavorites(this.favorites);
    this.displayFavorites();
  }

  updateLastVisited() {
    try {
      const lastVisitedString = localStorage.getItem('lastVisited');
      const now = new Date();
      
      if (!lastVisitedString) {
        localStorage.setItem('lastVisited', now.toISOString());
        return;
      }
      
      const lastVisitedElement = qs('#lastVisited');
      if (!lastVisitedElement) return;
      
      const lastVisitedDate = new Date(lastVisitedString);
      const timeDiff = now - lastVisitedDate;
      
      const seconds = Math.floor(timeDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      let timeString = '';
      if (days > 0) {
        timeString = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        const hours12 = hours % 12 === 0 ? 12 : hours % 12; 
        const ampm = hours >= 12 ? 'PM' : 'AM';
        timeString = `${hours12} hour${hours12 > 1 ? 's' : ''} ${ampm} ago`;
      } else if (minutes > 0) {
        timeString = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else {
        timeString = 'Just now';
      }
      
      lastVisitedElement.innerHTML = `<strong>Last visited:</strong> ${timeString}`;
      localStorage.setItem('lastVisited', now.toISOString());
    } catch (error) {
      console.error('Error updating last visited:', error);
    }
  }

  showError() {
    if (this.articlesContainer) {
      this.articlesContainer.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Favorites</h3>
          <p>Please try refreshing the page or check back later.</p>
          <button onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
    }
  }
}