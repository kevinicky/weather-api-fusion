import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  weatherApiKey: process.env.WEATHERAPI_KEY,
  cacheTtl: 600,
  featureFlags: {
    openMeteo: process.env.ENABLE_OPEN_METEO !== 'false',
    openWeather: process.env.ENABLE_OPENWEATHER === 'true',
    weatherApi: process.env.ENABLE_WEATHERAPI === 'true'
  },
  weights: {
    openMeteo: parseFloat(process.env.WEIGHT_OPEN_METEO) || 0.4,
    openWeather: parseFloat(process.env.WEIGHT_OPENWEATHER) || 0.3,
    weatherApi: parseFloat(process.env.WEIGHT_WEATHERAPI) || 0.3
  }
};
