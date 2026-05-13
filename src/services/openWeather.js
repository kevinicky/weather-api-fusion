import axios from 'axios';
import { WeatherProvider } from './weatherProvider.js';
import { config } from '../config.js';

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

export class OpenWeatherProvider extends WeatherProvider {
  constructor() {
    super('openWeather');
  }

  isEnabled() {
    return config.featureFlags.openWeather && 
           config.openWeatherApiKey && 
           config.openWeatherApiKey !== 'your_openweathermap_api_key_here';
  }

  async getCurrentWeather(lat, lon) {
    const response = await axios.get(WEATHER_URL, {
      params: {
        lat,
        lon,
        appid: config.openWeatherApiKey,
        units: 'metric'
      }
    });

    const data = response.data;
    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed * 3.6,
      precipitation: data.rain ? data.rain['1h'] || 0 : 0,
      description: data.weather[0].description
    };
  }

  async getForecast(lat, lon, days = 7) {
    const response = await axios.get(FORECAST_URL, {
      params: {
        lat,
        lon,
        appid: config.openWeatherApiKey,
        units: 'metric',
        cnt: days * 8
      }
    });

    const daily = {};
    response.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) {
        daily[date] = {
          temps: [],
          precipitations: [],
          windSpeeds: [],
          descriptions: []
        };
      }
      daily[date].temps.push(item.main.temp);
      daily[date].precipitations.push(item.pop || 0);
      daily[date].windSpeeds.push(item.wind.speed * 3.6);
      daily[date].descriptions.push(item.weather[0].description);
    });

    return Object.entries(daily).map(([date, data]) => ({
      date,
      tempMax: Math.max(...data.temps),
      tempMin: Math.min(...data.temps),
      precipitation: Math.max(...data.precipitations) * 10,
      windSpeed: Math.max(...data.windSpeeds),
      description: data.descriptions[0]
    }));
  }
}
