import { NYTService } from '../services/NYTService.mjs';
import { BaseNewsComponent } from './BaseNewsComponent.mjs';
import { qs, setClick } from '../utils.mjs';

export class HomeNews extends BaseNewsComponent {
  constructor() {
    super();
    this.sliderContainer = qs('#slider');
    this.articlesContainer = qs('.articles-container');
    this.trendingSections = qs('.trending-sections');
    this.loadMoreBtn = qs('#load-more');
    this.autoSlideInterval = null;
    this.activeSectionElement = null;
    this.filteredArticles = [];
    this.currentPage = 0;
    this.articlesPerPage = 12;
  }

  async init() {
    try {
      this.initModal();
      this.articles = await NYTService.fetchArticles();
      
      if (this.checkUserLoggedIn()) {
        this.migrateAnonymousFavorites();
      }
      
      this.initSlider();
      this.displayTrendingSections();
      this.displayArticles();
      this.setupEventListeners();
      this.updateLastVisited();
    } catch (error) {
      console.error('Error initializing HomeNews:', error);
      this.showError();
    }
  }

  initSlider() {
    if (!this.articles.length) return;
    
    this.displayRandomArticles();
    this.startAutoSlide();
    
    setClick('#next', () => this.swapArticle());
    setClick('#prev', () => this.swapArticle());
    
    const slider = qs('.slider');
    if (slider) {
      slider.addEventListener('mouseover', () => clearInterval(this.autoSlideInterval));
      slider.addEventListener('mouseout', () => this.startAutoSlide());
    }
  }

  displayRandomArticles() {
    if (!this.sliderContainer || !this.articles.length) return;
    
    const shuffled = [...this.articles].sort(() => 0.5 - Math.random());
    const randomArticles = shuffled.slice(0, 3);
    this.displayArticlesOnSlider(randomArticles);
  }

  displayArticlesOnSlider(articlesToDisplay) {
    this.sliderContainer.innerHTML = '';
    articlesToDisplay.forEach((article, index) => {
      if (!article.title) return;
      
      const card = document.createElement('div');
      card.className = `article-card ${index === 0 ? 'large' : ''}`;
      const imgUrl = article.multimedia?.[0]?.url || 'default-image-url.jpg';
      
      card.innerHTML = `
        <img src="${imgUrl}" alt="${article.title}" loading="lazy">
        <h2>${article.title}</h2>
        <p><a href="${article.url}" target="_blank">Read more</a></p>
      `;
      this.sliderContainer.appendChild(card);
    });
  }

  swapArticle() {
    if (!this.articles.length) return;
    
    const randomIndex = Math.floor(Math.random() * this.articles.length);
    const article = this.articles[randomIndex];

    const newCard = document.createElement('div');
    newCard.className = 'article-card large';
    const imgUrl = article.multimedia?.[0]?.url || 'default-image-url.jpg';
    
    newCard.innerHTML = `
      <img src="${imgUrl}" alt="${article.title}" loading="lazy">
      <h2>${article.title}</h2>
      <p><a href="${article.url}" target="_blank">Read more</a></p>
    `;

    const existingCards = this.sliderContainer.children;
    if (existingCards.length > 0) {
      existingCards[0].classList.add('fade-out');
      setTimeout(() => {
        this.sliderContainer.replaceChild(newCard, existingCards[0]);
        newCard.classList.add('fade-in');
      }, 500);
    } else {
      this.sliderContainer.appendChild(newCard);
      newCard.classList.add('fade-in');
    }
  }

  startAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.autoSlideInterval = setInterval(() => this.swapArticle(), 5000);
  }

  displayTrendingSections() {
    if (!this.trendingSections || !this.articles.length) return;
    
    const sections = [...new Set(this.articles.map(article => article.section))];
    
    this.trendingSections.innerHTML = `
      <h3>Trending News:</h3>
      ${sections.map(section => `
        <span class="trending-section" data-section="${section}">${section}</span>
      `).join(', ')}
      <button class="show-all">Show All</button>
      <a href="index.html" class="reload-button">Reload</a>
    `;

    const self = this;
    
    this.trendingSections.addEventListener('click', function(event) {
      const target = event.target;
      
      if (target.classList.contains('trending-section')) {
        const selectedSection = target.getAttribute('data-section');
        self.filterArticlesBySection(selectedSection);
        
        if (self.activeSectionElement) {
          self.activeSectionElement.classList.remove('active');
        }
        target.classList.add('active');
        self.activeSectionElement = target;
      }
      
      if (target.classList.contains('show-all')) {
        self.filteredArticles = [];
        self.currentPage = 0;
        self.displayArticles();
        
        if (self.activeSectionElement) {
          self.activeSectionElement.classList.remove('active');
          self.activeSectionElement = null;
        }
      }
    });
  }

  filterArticlesBySection(section) {
    this.filteredArticles = this.articles.filter(article => article.section === section);
    this.currentPage = 0;
    this.displayArticles();
  }

  displayArticles() {
    if (!this.articlesContainer) return;
    
    const articlesToDisplay = this.filteredArticles.length ? this.filteredArticles : this.articles;
    const startIndex = this.currentPage * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const paginatedArticles = articlesToDisplay.slice(startIndex, endIndex);

    if (this.currentPage === 0) {
      this.articlesContainer.innerHTML = '';
    }

    const favorites = this.getFavorites();
    
    paginatedArticles.forEach(article => {
      if (!article.title) return;
      
      const articleCard = document.createElement('div');
      articleCard.classList.add('articles-card');
      
      const isFavorite = favorites.some(fav => fav.url === article.url);
      const favoriteBtnClass = isFavorite ? 'favourite-button active' : 'favourite-button';
      // const favoriteBtnText = isFavorite ? '★ Favorited' : '☆ Add to Favorites';
      const imgUrl = article.multimedia?.[0]?.url || 'default-image-url.jpg';
      
      articleCard.innerHTML = `
        <img src="${imgUrl}" 
             alt="${article.title}" 
             class="article-image" 
             loading="lazy" />
        <h2 class="article-headline">${article.title}</h2>
        <p class="article-date">${new Date(article.published_date).toLocaleDateString()}</p>
        <button class="details-button" data-article='${JSON.stringify(article)}'>Details</button>
        <a href="${article.url}" target="_blank" class="view-button">View</a>
        
      `;
      this.articlesContainer.appendChild(articleCard);
    });

    this.loadMoreBtn.style.display = 
      (endIndex < articlesToDisplay.length) ? 'block' : 'none';
  }

  setupEventListeners() {
    if (!this.articlesContainer) return;
    
    const self = this;
    
    this.articlesContainer.addEventListener('click', function(event) {
      const target = event.target;
      
      if (target.classList.contains('details-button')) {
        const article = JSON.parse(target.dataset.article);
        self.openModal(article);
      }
      
      if (target.classList.contains('favourite-button')) {
        const article = JSON.parse(target.dataset.article);
        self.toggleFavorite(article, target);
      }
    });

    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.currentPage++;
        this.displayArticles();
      });
    }
  }

  toggleFavorite(article, button) {
    let favorites = this.getFavorites();
    const existingIndex = favorites.findIndex(fav => fav.url === article.url);
    
    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
      button.textContent = '☆ Add to Favorites';
      button.classList.remove('active');
    } else {
      favorites.push(article);
      button.textContent = '★ Favorited';
      button.classList.add('active');
    }
    
    this.updateFavorites(favorites);
  }

  updateLastVisited() {
    const lastVisitedString = localStorage.getItem('lastVisited');
    const now = new Date();
    
    if (!lastVisitedString) {
      localStorage.setItem('lastVisited', now.toISOString());
      return;
    }
    
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
    
    localStorage.setItem('lastVisited', now.toISOString());
  }

  showError() {
    if (!this.articlesContainer) return;
    
    this.articlesContainer.innerHTML = `
      <div class="error-message">
        <h3>Failed to load articles</h3>
        <p>Please try refreshing the page or check back later.</p>
      </div>
    `;
  }
}