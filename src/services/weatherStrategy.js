import { OpenMeteoProvider } from './openMeteo.js';
import { OpenWeatherProvider } from './openWeather.js';
import { WeatherApiProvider } from './weatherApi.js';

export class WeatherStrategy {
  constructor() {
    this.providers = [
      new OpenMeteoProvider(),
      new OpenWeatherProvider(),
      new WeatherApiProvider()
    ];
  }

  getEnabledProviders() {
    return this.providers.filter(p => p.isEnabled());
  }

  getProviderNames() {
    return this.providers.map(p => ({
      name: p.name,
      enabled: p.isEnabled()
    }));
  }

  async fetchAllCurrent(lat, lon) {
    const enabledProviders = this.getEnabledProviders();
    
    if (enabledProviders.length === 0) {
      throw new Error('No weather providers enabled');
    }

    const promises = enabledProviders.map(p => p.fetchCurrent(lat, lon));
    return Promise.all(promises);
  }

  async fetchAllForecast(lat, lon, days = 7) {
    const enabledProviders = this.getEnabledProviders();
    
    if (enabledProviders.length === 0) {
      throw new Error('No weather providers enabled');
    }

    const promises = enabledProviders.map(p => p.fetchForecast(lat, lon, days));
    return Promise.all(promises);
  }

  addProvider(provider) {
    if (!(provider instanceof WeatherProvider)) {
      throw new Error('Provider must extend WeatherProvider');
    }
    this.providers.push(provider);
  }
}
