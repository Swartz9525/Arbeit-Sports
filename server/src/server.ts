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

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // For ease of loading external models/images in dev
}));

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const sanitizedOrigin = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

const corsOptions = {
  origin: sanitizedOrigin,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arbeit-sports';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    await seedAdminUser();
    await seedProducts();
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

// Seed Initial Products
const seedProducts = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('Products already exist in database. Skipping product seeding.');
      return;
    }
    console.log('Seeding initial sports products...');
    const sampleProducts = [
      {
        name: 'Apex Runner X1',
        description: 'High-performance running shoe engineered with lightweight carbon fiber plates, ultra-responsive cushioning, and breathable knit mesh. Designed to break speed limits.',
        price: 189.99,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Footwear',
        brand: 'Arbeit Performance',
        stock: 45,
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['Red', 'Black', 'Blue'],
        rating: 4.8,
        numReviews: 12,
        reviews: [],
        threeDModelUrl: 'ApexRunner'
      },
      {
        name: 'Titan Grip Basketball',
        description: 'Premium composite leather match basketball with micro-fiber textured grip and deep channels for ultimate control, whether indoors or outdoors.',
        price: 59.99,
        images: [
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Equipment',
        brand: 'Arbeit Court',
        stock: 120,
        sizes: ['Size 7'],
        colors: ['Classic Orange', 'Matte Black'],
        rating: 4.6,
        numReviews: 8,
        reviews: [],
        threeDModelUrl: 'TitanBall'
      },
      {
        name: 'Vortex Carbon Tennis Racket',
        description: 'Full carbon composite frame offering unmatched stiffness-to-weight ratio, boosting swing speed and smash power. Ideal for intermediate to advanced competitors.',
        price: 249.99,
        images: [
          'https://images.unsplash.com/photo-1617083934383-df462e086716?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Equipment',
        brand: 'Vortex Sports',
        stock: 22,
        sizes: ['4 3/8"', '4 1/2"'],
        colors: ['Neon Green', 'Carbon Stealth'],
        rating: 4.9,
        numReviews: 5,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Quantum Gym Bag',
        description: 'Water-resistant athletic duffel bag featuring a dedicated ventilated shoe compartment, secure waterproof pocket for valuables, and heavy-duty padded straps.',
        price: 45.00,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Accessories',
        brand: 'Arbeit Fit',
        stock: 80,
        sizes: ['30L', '50L'],
        colors: ['Charcoal Grey', 'Olive Drab'],
        rating: 4.5,
        numReviews: 18,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Olympus Hex Dumbbells (Set)',
        description: 'Professional grade solid cast iron hex dumbbells with ergonomic chrome-plated handles. Perfect for strength building and full-body conditioning.',
        price: 89.99,
        images: [
          'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Equipment',
        brand: 'Olympus Gear',
        stock: 35,
        sizes: ['20lbs', '30lbs', '40lbs'],
        colors: ['Cast Iron Black'],
        rating: 4.7,
        numReviews: 14,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Vanguard Smart Fitness Band',
        description: 'Next-generation fitness tracker monitoring heart rate, sleep quality, and active calories with 10 days of battery life and swim-proof IP68 rating.',
        price: 119.99,
        images: [
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Accessories',
        brand: 'Vanguard Tech',
        stock: 60,
        sizes: ['One Size'],
        colors: ['Obsidian Black', 'Lunar White', 'Slate Blue'],
        rating: 4.4,
        numReviews: 21,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Pro-Flex Windbreaker Jacket',
        description: 'Ultra-lightweight windproof and water-resistant running jacket with reflective panels for low-light safety and high-ventilation back yoke.',
        price: 75.00,
        images: [
          'https://images.unsplash.com/photo-1552047832-901861537cd6?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Accessories',
        brand: 'Arbeit Performance',
        stock: 50,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Stealth Black', 'Safety Yellow'],
        rating: 4.6,
        numReviews: 9,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Strike-Force Soccer Ball',
        description: 'FIFA-quality thermobonded match soccer ball with textured outer casing for aerodynamic precision, high-rebound bladder, and exceptional shape retention.',
        price: 49.99,
        images: [
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Equipment',
        brand: 'Arbeit Court',
        stock: 90,
        sizes: ['Size 5'],
        colors: ['White/Solar Red', 'White/Neon Blue'],
        rating: 4.8,
        numReviews: 15,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Hydra-Flow Thermal Flask',
        description: 'Double-walled vacuum insulated stainless steel water bottle keeping drinks cold for 24 hours or hot for 12. Complete with leak-proof straw lid.',
        price: 29.99,
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Accessories',
        brand: 'Arbeit Fit',
        stock: 150,
        sizes: ['32oz'],
        colors: ['Ocean Blue', 'Granite Black', 'Mint Green'],
        rating: 4.7,
        numReviews: 40,
        reviews: [],
        threeDModelUrl: ''
      },
      {
        name: 'Ergo-Foam Pro Yoga Mat',
        description: 'Extra thick non-slip eco-friendly TPE mat providing premium joint support and perfect traction for intense workouts, yoga, or pilates sessions.',
        price: 34.99,
        images: [
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Accessories',
        brand: 'Arbeit Fit',
        stock: 75,
        sizes: ['72" x 24"'],
        colors: ['Plum Purple', 'Slate Grey'],
        rating: 4.5,
        numReviews: 24,
        reviews: [],
        threeDModelUrl: ''
      }
    ];
    await Product.insertMany(sampleProducts);
    console.log('Successfully seeded database with expanded catalog!');
  } catch (error) {
    console.error('Error seeding products:', error);
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
