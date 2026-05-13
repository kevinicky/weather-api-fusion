import { Router } from 'express';
import { WeatherStrategy } from '../services/weatherStrategy.js';
import { aggregateCurrentWeather, aggregateForecast } from '../services/aggregator.js';
import { geocodeCity } from '../services/geocoder.js';
import { getCached, setCached } from '../cache.js';

const router = Router();
const strategy = new WeatherStrategy();

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Get aggregated current weather
 *     description: Fetches weather from multiple providers and returns weighted average
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City name (alternative to lat/lon)
 *     responses:
 *       200:
 *         description: Aggregated weather data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                 aggregated:
 *                   type: object
 *                   properties:
 *                     temp:
 *                       type: number
 *                       description: Temperature in Celsius
 *                     humidity:
 *                       type: number
 *                       description: Humidity percentage
 *                     windSpeed:
 *                       type: number
 *                       description: Wind speed in km/h
 *                     precipitation:
 *                       type: number
 *                       description: Precipitation in mm
 *                     description:
 *                       type: string
 *                 sources:
 *                   type: object
 *                   description: Individual provider data
 *                 confidence:
 *                   type: number
 *                   description: Confidence score (0.5-1.0)
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing location parameters
 *       500:
 *         description: All providers failed
 */
router.get('/weather', async (req, res, next) => {
  try {
    let { lat, lon, city } = req.query;

    if (city) {
      const location = await geocodeCity(city);
      lat = location.lat;
      lon = location.lon;
    }

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Provide either lat/lon or city parameter'
      });
    }

    const cacheKey = `weather:${lat}:${lon}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const results = await strategy.fetchAllCurrent(parseFloat(lat), parseFloat(lon));
    const aggregated = aggregateCurrentWeather(results);

    const response = {
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      ...aggregated,
      timestamp: new Date().toISOString()
    };

    setCached(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/forecast:
 *   get:
 *     summary: Get aggregated weather forecast
 *     description: Fetches forecast from multiple providers and returns weighted average
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City name (alternative to lat/lon)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of forecast days
 *     responses:
 *       200:
 *         description: Aggregated forecast data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                 days:
 *                   type: integer
 *                 aggregated:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       tempMax:
 *                         type: number
 *                       tempMin:
 *                         type: number
 *                       precipitation:
 *                         type: number
 *                       windSpeed:
 *                         type: number
 *                       description:
 *                         type: string
 *                 sources:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing location parameters
 *       500:
 *         description: All providers failed
 */
router.get('/forecast', async (req, res, next) => {
  try {
    let { lat, lon, city, days } = req.query;
    days = parseInt(days) || 7;

    if (city) {
      const location = await geocodeCity(city);
      lat = location.lat;
      lon = location.lon;
    }

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Provide either lat/lon or city parameter'
      });
    }

    const cacheKey = `forecast:${lat}:${lon}:${days}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const results = await strategy.fetchAllForecast(parseFloat(lat), parseFloat(lon), days);
    const aggregated = aggregateForecast(results);

    const response = {
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      days,
      ...aggregated,
      timestamp: new Date().toISOString()
    };

    setCached(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Get enabled weather providers
 *     description: Lists all configured weather providers and their status
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Provider configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 providers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                 weights:
 *                   type: object
 *                   description: Provider weighting for aggregation
 */
router.get('/providers', (req, res) => {
  res.json({
    providers: strategy.getProviderNames(),
    weights: {
      openMeteo: process.env.WEIGHT_OPEN_METEO || 0.4,
      openWeather: process.env.WEIGHT_OPENWEATHER || 0.3,
      weatherApi: process.env.WEIGHT_WEATHERAPI || 0.3
    }
  });
});

export default router;
