import { config } from './config.js';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Weather API Fusion',
    version: '1.0.0',
    description: 'Multi-source weather aggregation API with improved accuracy through weighted averaging of multiple providers',
    contact: {
      name: 'API Support'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Local development'
    },
    {
      url: 'https://your-app.vercel.app',
      description: 'Vercel production'
    }
  ],
  paths: {
    '/api/weather': {
      get: {
        summary: 'Get aggregated current weather',
        description: 'Fetches weather from multiple providers and returns weighted average',
        tags: ['Weather'],
        parameters: [
          {
            name: 'lat',
            in: 'query',
            schema: { type: 'number' },
            description: 'Latitude coordinate'
          },
          {
            name: 'lon',
            in: 'query',
            schema: { type: 'number' },
            description: 'Longitude coordinate'
          },
          {
            name: 'city',
            in: 'query',
            schema: { type: 'string' },
            description: 'City name (alternative to lat/lon)'
          }
        ],
        responses: {
          '200': {
            description: 'Aggregated weather data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    location: {
                      type: 'object',
                      properties: {
                        lat: { type: 'number' },
                        lon: { type: 'number' }
                      }
                    },
                    aggregated: {
                      type: 'object',
                      properties: {
                        temp: { type: 'number', description: 'Temperature in Celsius' },
                        humidity: { type: 'number', description: 'Humidity percentage' },
                        windSpeed: { type: 'number', description: 'Wind speed in km/h' },
                        precipitation: { type: 'number', description: 'Precipitation in mm' },
                        description: { type: 'string' }
                      }
                    },
                    sources: { type: 'object', description: 'Individual provider data' },
                    confidence: { type: 'number', description: 'Confidence score (0.5-1.0)' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '400': { description: 'Missing location parameters' },
          '500': { description: 'All providers failed' }
        }
      }
    },
    '/api/forecast': {
      get: {
        summary: 'Get aggregated weather forecast',
        description: 'Fetches forecast from multiple providers and returns weighted average',
        tags: ['Weather'],
        parameters: [
          {
            name: 'lat',
            in: 'query',
            schema: { type: 'number' },
            description: 'Latitude coordinate'
          },
          {
            name: 'lon',
            in: 'query',
            schema: { type: 'number' },
            description: 'Longitude coordinate'
          },
          {
            name: 'city',
            in: 'query',
            schema: { type: 'string' },
            description: 'City name (alternative to lat/lon)'
          },
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', default: 7 },
            description: 'Number of forecast days'
          }
        ],
        responses: {
          '200': {
            description: 'Aggregated forecast data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    location: {
                      type: 'object',
                      properties: {
                        lat: { type: 'number' },
                        lon: { type: 'number' }
                      }
                    },
                    days: { type: 'integer' },
                    aggregated: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          date: { type: 'string', format: 'date' },
                          tempMax: { type: 'number' },
                          tempMin: { type: 'number' },
                          precipitation: { type: 'number' },
                          windSpeed: { type: 'number' },
                          description: { type: 'string' }
                        }
                      }
                    },
                    sources: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '400': { description: 'Missing location parameters' },
          '500': { description: 'All providers failed' }
        }
      }
    },
    '/api/providers': {
      get: {
        summary: 'Get enabled weather providers',
        description: 'Lists all configured weather providers and their status',
        tags: ['Configuration'],
        responses: {
          '200': {
            description: 'Provider configuration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    providers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          enabled: { type: 'boolean' }
                        }
                      }
                    },
                    weights: {
                      type: 'object',
                      description: 'Provider weighting for aggregation'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function setupSwagger(app) {
  app.get('/api-docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather API Fusion - Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis]
      });
    };
  </script>
</body>
</html>
    `);
  });
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
