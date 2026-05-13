import express from 'express';
import { config } from './config.js';
import weatherRoutes from './routes/weather.js';
import { errorHandler } from './middleware/error.js';
import { setupSwagger } from './swagger.js';

const app = express();

app.use(express.json());

setupSwagger(app);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', weatherRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Weather API server running on http://localhost:${config.port}`);
  console.log(`Swagger docs: http://localhost:${config.port}/api-docs`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`API endpoints: http://localhost:${config.port}/api/providers`);
});

export default app;
