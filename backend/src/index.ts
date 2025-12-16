import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';

const backendDir = __dirname.includes('dist') 
  ? path.resolve(__dirname, '..')
  : path.resolve(__dirname, '..');
const rootDir = path.resolve(backendDir, '..');

dotenv.config({ path: path.join(backendDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type', 'Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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

if (process.env.NODE_ENV !== 'test' && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

