import express = require('express');
import cors = require('cors');
import swaggerUi = require('swagger-ui-express');
import swaggerJsDoc = require('swagger-jsdoc');
import routes from './routes';
import { env } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Audience Query Management API',
      version: '1.0.0',
    },
  },
  apis: [],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);
app.use(errorHandler);

export default app;
