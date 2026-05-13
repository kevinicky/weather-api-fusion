# Weather API Fusion

Multi-source weather API with improved accuracy through weighted averaging of multiple providers.

## Why This API?

Most weather APIs give you data from a single source, which can be inaccurate. This API:

- **Aggregates multiple providers** (Open-Meteo, OpenWeatherMap, WeatherAPI.com)
- **Computes weighted average** for better accuracy
- **Returns confidence score** based on provider agreement
- **Shows individual source data** for transparency
- **Uses Strategy Pattern** - easy to add new providers

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/weather?lat=-6.2&lon=106.8` | Current weather by coordinates |
| `GET /api/weather?city=Jakarta` | Current weather by city name |
| `GET /api/forecast?lat=-6.2&lon=106.8&days=7` | 7-day forecast |
| `GET /api/providers` | List enabled providers & weights |
| `GET /api-docs` | Swagger documentation |
| `GET /health` | Health check |

## Response Example

```json
{
  "location": { "lat": -6.2, "lon": 106.8 },
  "aggregated": {
    "temp": 28.5,
    "humidity": 75,
    "windSpeed": 12,
    "precipitation": 0.2,
    "description": "Partly cloudy"
  },
  "sources": {
    "openMeteo": { "temp": 28, "status": "success" },
    "openWeather": { "temp": 29, "status": "success" },
    "weatherApi": { "temp": 28.5, "status": "success" }
  },
  "confidence": 0.95,
  "timestamp": "2026-05-13T10:00:00.000Z"
}
```

## Weather Aggregation Logic

### How It Works

1. **Fetch in parallel** - All enabled providers are queried simultaneously
2. **Normalize data** - Each provider's response is converted to a common format (°C, km/h, mm)
3. **Weighted average** - Configurable weights per provider:
   - Open-Meteo: 40% (default, free, no API key)
   - OpenWeatherMap: 30%
   - WeatherAPI.com: 30%
4. **Confidence score** - Calculated from standard deviation of temperature readings:
   - High agreement (>0.9): Providers agree closely
   - Medium agreement (0.7-0.9): Some variance
   - Low agreement (0.5-0.7): Significant differences, investigate
5. **Fallback handling** - If a provider fails, weights are redistributed among working providers

### Aggregation Formula

```
weighted_temp = Σ(provider_temp × provider_weight) / Σ(weights)
confidence = 1 - (stdDev(temps) / maxDiff)
```

## Feature Flags

Toggle providers on/off without code changes:

```env
ENABLE_OPEN_METEO=true
ENABLE_OPENWEATHER=false
ENABLE_WEATHERAPI=false
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | - |
| `WEATHERAPI_KEY` | WeatherAPI.com key | - |
| `ENABLE_OPEN_METEO` | Enable Open-Meteo | `true` |
| `ENABLE_OPENWEATHER` | Enable OpenWeatherMap | `false` |
| `ENABLE_WEATHERAPI` | Enable WeatherAPI.com | `false` |
| `WEIGHT_OPEN_METEO` | Weight for Open-Meteo | `0.4` |
| `WEIGHT_OPENWEATHER` | Weight for OpenWeatherMap | `0.3` |
| `WEIGHT_WEATHERAPI` | Weight for WeatherAPI.com | `0.3` |

## Deploy to Vercel

```bash
npx vercel
```

Set environment variables in Vercel dashboard.

## Project Structure

```
weather-api/
├── src/
│   ├── index.js                    # Entry point (Vercel + local)
│   ├── server.js                   # Express server (local)
│   ├── config.js                   # Config & feature flags
│   ├── cache.js                    # In-memory cache
│   ├── swagger.js                  # Swagger setup
│   ├── routes/
│   │   └── weather.js              # API routes with Swagger docs
│   ├── services/
│   │   ├── weatherProvider.js      # Abstract base class (Strategy)
│   │   ├── openMeteo.js            # Open-Meteo provider
│   │   ├── openWeather.js          # OpenWeatherMap provider
│   │   ├── weatherApi.js           # WeatherAPI.com provider
│   │   ├── weatherStrategy.js      # Strategy manager
│   │   ├── aggregator.js           # Weighted averaging logic
│   │   └── geocoder.js             # City name to coordinates
│   └── middleware/
│       └── error.js                # Error handler
├── vercel.json                     # Vercel config
├── .env.example
└── package.json
```
