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
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true); // non-browser or same-origin
		if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(null, false); // do not throw to avoid 500
	},
	credentials: true,
	methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ensure preflight returns 204 and bypasses downstream middleware

app.use(express.json());
app.use(morgan('combined'));

app.use('/api', routes);
app.use(errorHandler);

export { app };
