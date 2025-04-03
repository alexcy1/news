import { BaseNewsComponent } from './BaseNewsComponent.mjs';
import { qs } from '../utils.mjs';

export class FavoritesNews extends BaseNewsComponent {
  constructor() {
    super();
    this.articlesContainer = qs('.articles-container');
  }

  async init() {
    if (!this.checkUserLoggedIn()) {
      window.location.href = '/signin.html?redirect=favorites.html';
      return;
    }

    this.initModal();
    await this.loadAndDisplayFavorites();
    this.setupEventListeners();
  }

  async loadAndDisplayFavorites() {
    try {
      await this.loadFavorites();
      
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
        const articleData = article.article || article;
        if (!articleData || !articleData.title) return;
        
        const articleCard = document.createElement('div');
        articleCard.classList.add('articles-card');
        const imgUrl = articleData.multimedia?.[0]?.url || 'default-image-url.jpg';
        const date = articleData.published_date ? 
          new Date(articleData.published_date).toLocaleDateString() : 
          'Date not available';
        
        articleCard.innerHTML = `
          <img src="${imgUrl}" 
               alt="${articleData.title}" 
               class="article-image" 
               loading="lazy" />
          <h2 class="article-headline">${articleData.title}</h2>
          <p class="article-date">${date}</p>
          <button class="details-button" data-article='${JSON.stringify(articleData)}'>Details</button>
          <a href="${articleData.url}" target="_blank" class="view-button">View</a>
          <button class="delete-favourite-button" data-index="${index}">Delete Favourite</button>
        `;
        this.articlesContainer.appendChild(articleCard);
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.showError();
    }
  }

  setupEventListeners() {
    if (!this.articlesContainer) return;
    
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
    this.loadAndDisplayFavorites();
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