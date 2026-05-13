# Agent Context

## Project Overview
Weather Aggregation API - Multi-source weather API with improved accuracy through weighted averaging.

## Architecture
- **Pattern**: Strategy Pattern for weather providers
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Deployment**: Vercel serverless

## Key Files
- `src/services/weatherProvider.js` - Abstract base class for providers
- `src/services/weatherStrategy.js` - Manages provider instances
- `src/services/aggregator.js` - Weighted averaging logic
- `src/config.js` - Feature flags and weights

## Adding a New Provider
1. Create new file in `src/services/` extending `WeatherProvider`
2. Implement `getCurrentWeather()` and `getForecast()`
3. Register in `weatherStrategy.js`
4. Add feature flag in `config.js` and `.env`

## Feature Flags
- `ENABLE_OPEN_METEO` - Open-Meteo (free, no key)
- `ENABLE_OPENWEATHER` - OpenWeatherMap (needs API key)
- `ENABLE_WEATHERAPI` - WeatherAPI.com (needs API key)

## Commands
- `npm run dev` - Start with hot reload
- `npm start` - Start production
- `npm test` - Run tests
