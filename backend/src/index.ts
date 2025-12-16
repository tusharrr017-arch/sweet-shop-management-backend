import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';

// Load environment variables - try multiple locations
// Try loading from backend/.env first, then root .env, then default
const backendDir = __dirname.includes('dist') 
  ? path.resolve(__dirname, '..')  // If running from dist/
  : path.resolve(__dirname, '..'); // If running from src/
const rootDir = path.resolve(backendDir, '..');

dotenv.config({ path: path.join(backendDir, '.env') }); // backend/.env
dotenv.config({ path: path.join(rootDir, '.env') });    // Root .env
dotenv.config(); // Default location (current working directory)

// Environment variables loaded

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'] // Expose headers to JavaScript
}));

// Additional CORS headers middleware to ensure they're always set
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Increase JSON body size limit to handle base64 images (50MB - Vercel serverless function max)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', async (req, res) => {
  try {
    const pool = await import('./config/database');
    await pool.default.query('SELECT 1');
    res.json({ status: 'ok', message: 'Sweet Shop API is running', database: 'connected' });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Sweet Shop API is running but database connection failed',
      error: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

// Only start server if not running as Netlify function
if (process.env.NODE_ENV !== 'test' && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

