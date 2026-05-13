import axios from 'axios';
import { WeatherProvider } from './weatherProvider.js';
import { config } from '../config.js';

const WEATHER_URL = 'https://api.weatherapi.com/v1/current.json';
const FORECAST_URL = 'https://api.weatherapi.com/v1/forecast.json';

export class WeatherApiProvider extends WeatherProvider {
  constructor() {
    super('weatherApi');
  }

  isEnabled() {
    return config.featureFlags.weatherApi && 
           config.weatherApiKey && 
           config.weatherApiKey !== 'your_weatherapi_key_here';
  }

  async getCurrentWeather(lat, lon) {
    const response = await axios.get(WEATHER_URL, {
      params: {
        key: config.weatherApiKey,
        q: `${lat},${lon}`
      }
    });

    const data = response.data.current;
    return {
      temp: data.temp_c,
      humidity: data.humidity,
      windSpeed: data.wind_kph,
      precipitation: data.precip_mm,
      description: data.condition.text
    };
  }

  async getForecast(lat, lon, days = 7) {
    const response = await axios.get(FORECAST_URL, {
      params: {
        key: config.weatherApiKey,
        q: `${lat},${lon}`,
        days: Math.min(days, 14)
      }
    });

    return response.data.forecast.forecastday.map(day => ({
      date: day.date,
      tempMax: day.day.maxtemp_c,
      tempMin: day.day.mintemp_c,
      precipitation: day.day.totalprecip_mm,
      windSpeed: day.day.maxwind_kph,
      description: day.day.condition.text
    }));
  }
}
