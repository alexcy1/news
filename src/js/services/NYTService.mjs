export class NYTService {
  static API_KEY = 'O9xJTHU436vbdoL1yyrEkjIBCOBcCO4x';
  static BASE_URL = 'https://api.nytimes.com/svc/topstories/v2/home.json';

  static async fetchArticles() {
    try {
      const url = `${NYTService.BASE_URL}?api-key=${NYTService.API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }
}