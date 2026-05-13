import { config } from './config.js';

const isVercel = process.env.VERCEL === '1';

let app;

if (isVercel) {
  const express = await import('express');
  const weatherRoutes = await import('./routes/weather.js');
  const errorHandler = await import('./middleware/error.js');
  const swagger = await import('./swagger.js');

  app = express.default();
  app.use(express.default().json());

  swagger.setupSwagger(app);

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.use('/api', weatherRoutes.default);
  app.use(errorHandler.errorHandler);
} else {
  const server = await import('./server.js');
  app = server.default;
}

export default app;
