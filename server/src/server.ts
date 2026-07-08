import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import couponRoutes from './routes/couponRoutes';
import userRoutes from './routes/userRoutes';
import addressRoutes from './routes/addressRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { Product } from './models/Product';
import { User } from './models/User';

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Vercel)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // For ease of loading external models/images in dev
}));

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const sanitizedOrigin = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://arbeit-sports.vercel.app',
  'https://www.arbeitsports.in',
  'https://arbeitsports.in'
];
if (!allowedOrigins.includes(sanitizedOrigin)) {
  allowedOrigins.push(sanitizedOrigin);
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 100, // Limit each IP to 100 requests per second
  message: { message: 'Too many requests from this IP, please try again in a second' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not set. Please configure it in your .env file or Vercel project settings.');
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    await seedAdminUser();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@arbeitsports.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log('Seeding default administrator account...');
      await User.create({
        name: 'Arbeit Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      console.log('Default administrator account created (admin@arbeitsports.com / admin123)');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};


// Serve static uploaded files locally
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Arbeit Sports API is running smoothly.');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
