import axios from 'axios';
import { WeatherProvider } from './weatherProvider.js';
import { config } from '../config.js';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export class OpenMeteoProvider extends WeatherProvider {
  constructor() {
    super('openMeteo');
  }

  isEnabled() {
    return config.featureFlags.openMeteo;
  }

  async getCurrentWeather(lat, lon) {
    const response = await axios.get(WEATHER_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
        timezone: 'auto'
      }
    });

    const current = response.data.current;
    return {
      temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      description: this.getWeatherDescription(current.weather_code)
    };
  }

  async getForecast(lat, lon, days = 7) {
    const response = await axios.get(WEATHER_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: days
      }
    });

    const daily = response.data.daily;
    return daily.time.map((date, i) => ({
      date,
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      precipitation: daily.precipitation_sum[i],
      windSpeed: daily.wind_speed_10m_max[i],
      weatherCode: daily.weather_code[i],
      description: this.getWeatherDescription(daily.weather_code[i])
    }));
  }

  getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snowfall',
      73: 'Moderate snowfall',
      75: 'Heavy snowfall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  }
}
