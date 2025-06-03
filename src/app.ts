import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import policyRoutes from './routes/policyRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();


const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'insure-api health check',
    })
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/policies', policyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
