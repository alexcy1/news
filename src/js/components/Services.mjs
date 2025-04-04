import { qs, renderListWithTemplate } from '../utils.mjs';

export class Services {
  constructor() {
    this.servicesContainer = qs('#services-container');
    this.servicesUrl = '/json/services.json';
  }

  async init() {
    try {
      await this.loadServices();
      this.renderServices();
    } catch (error) {
      console.error('Services initialization failed:', error);
      this.showError();
    }
  }

  async loadServices() {
    const response = await fetch(this.servicesUrl);
    if (!response.ok) {
      throw new Error(`Failed to load services: ${response.status}`);
    }
    this.services = await response.json();
  }

  serviceCardTemplate(service) {
    return `
      <div class="service-card">
        <img 
          data-src="${service.image}" 
          alt="${service.name}" 
          class="lazy-load"
          loading="lazy"
        />
        <div class="service-card-content">
          <h3>${service.name}</h3>
          <p>${service.message}</p>
        </div>
      </div>
    `;
  }

  renderServices() {
    if (!this.services || !this.services.length) {
      throw new Error('No services data available');
    }

    renderListWithTemplate(
      this.serviceCardTemplate.bind(this),
      this.servicesContainer,
      this.services
    );

    this.setupLazyLoading();
  }

  setupLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-load');

    if ('IntersectionObserver' in window) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target;
            image.src = image.dataset.src;
            image.classList.add('loaded');
            intersectionObserver.unobserve(image);
          }
        });
      });

      lazyImages.forEach(image => {
        intersectionObserver.observe(image);
      });
    } else {
      lazyImages.forEach(image => {
        image.src = image.dataset.src;
      });
    }
  }

  showError() {
    this.servicesContainer.innerHTML = `
      <div class="error-message">
        <p>We're having trouble loading our services. Please try again later.</p>
      </div>
    `;
  }
}