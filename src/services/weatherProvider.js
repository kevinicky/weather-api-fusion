export class WeatherProvider {
  constructor(name) {
    if (new.target === WeatherProvider) {
      throw new Error('WeatherProvider is abstract');
    }
    this.name = name;
  }

  async getCurrentWeather(lat, lon) {
    throw new Error('Method getCurrentWeather() must be implemented');
  }

  async getForecast(lat, lon, days) {
    throw new Error('Method getForecast() must be implemented');
  }

  isEnabled() {
    return true;
  }

  async fetchCurrent(lat, lon) {
    try {
      const data = await this.getCurrentWeather(lat, lon);
      return {
        name: this.name,
        status: 'fulfilled',
        value: data
      };
    } catch (error) {
      return {
        name: this.name,
        status: 'rejected',
        reason: error.message
      };
    }
  }

  async fetchForecast(lat, lon, days) {
    try {
      const data = await this.getForecast(lat, lon, days);
      return {
        name: this.name,
        status: 'fulfilled',
        value: data
      };
    } catch (error) {
      return {
        name: this.name,
        status: 'rejected',
        reason: error.message
      };
    }
  }
}
