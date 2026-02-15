import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());

const allowedOrigins = env.frontendOrigin.split(',').map((o) => o.trim()).filter(Boolean);
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true); // Allow non-browser requests
			if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
			return callback(new Error('Not allowed by CORS'));
		},
		credentials: true,
	})
);
app.use(express.json());
app.use(morgan('combined'));

app.use('/api', routes);
app.use(errorHandler);

export { app };
