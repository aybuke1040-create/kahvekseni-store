import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import b2bRoutes from './routes/b2b.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middlewares/error.middleware';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    process.env.WEB_URL || 'http://localhost:3000',
    'http://localhost:8081', // Expo
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Çok fazla istek. Lütfen bekleyin.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'KAHVEKSENİ API', version: '1.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/payment', paymentRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`KAHVEKSENİ API ${PORT} portunda çalışıyor (${process.env.NODE_ENV})`);
});

export default app;
