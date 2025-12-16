import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const backendDir = path.resolve(process.cwd());
const rootDir = path.resolve(backendDir, '..');

dotenv.config({ path: path.join(backendDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config();

let pgPool: Pool | null = null;
let dbInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeDatabase() {
  if (dbInitialized) return;
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    const connectionString = process.env.DATABASE_URL || 
                            process.env.POSTGRES_URL || 
                            process.env.POSTGRES_URL_NON_POOLING ||
                            process.env.POSTGRES_PRISMA_URL;
    
    if (!connectionString) {
      const error = new Error(
        'Database connection string not found. Please set one of: DATABASE_URL, POSTGRES_URL, POSTGRES_URL_NON_POOLING, or POSTGRES_PRISMA_URL in your environment variables.'
      );
      console.error(error.message);
      throw error;
    }
    
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const requiresSSL = false
    let sslConfig: any = false;
    
    if (requiresSSL) {
      const fs = require('fs');
      const certPaths = [
        process.env.POSTGRES_CA_CERT_PATH,
        path.join(backendDir, 'certs', 'prod-ca-2021 (1).crt'),
        path.join(backendDir, 'certs', 'prod-ca-2021.crt'),
        path.join(backendDir, 'certs', 'prod-ca-2021 (1).pem'),
        path.join(backendDir, 'certs', 'prod-ca-2021.pem'),
        path.join(backendDir, 'certs', 'ca-certificate.crt'),
      ].filter(Boolean);
      
      let certFound = false;
      for (const certPath of certPaths) {
        try {
          if (certPath && fs.existsSync(certPath)) {
            const certContent = fs.readFileSync(certPath, 'utf8');
            if (certContent && certContent.includes('BEGIN CERTIFICATE')) {
              sslConfig = {
                ca: certContent,
                rejectUnauthorized: false
              };
              certFound = true;
              break;
            }
          }
        } catch (err: any) {
        }
      }
      
      if (!certFound) {
        sslConfig = { 
          rejectUnauthorized: false
        };
      }
    }
    
    pgPool = new Pool({
      connectionString: connectionString,
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    });
    
    try {
      const result = await pgPool.query('SELECT 1 as test');
      console.log('PostgreSQL database connected successfully');
      dbInitialized = true;
    } catch (err: any) {
      console.error('PostgreSQL connection error:', err.message);
      const connStr = connectionString || 'undefined';
      console.error('Connection string (first 20 chars):', connStr.substring(0, 20));
      console.error('Available env vars:', {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set'
      });
      throw new Error(`Database connection failed: ${err.message}`);
    }
  })();
  
  return initPromise;
}

export const query = async (text: string, params?: any[]) => {
  try {
    await initializeDatabase();
    
    if (!pgPool) {
      throw new Error('Database pool not initialized');
    }
    
    return await pgPool.query(text, params);
  } catch (error: any) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

const pool = {
  query: query,
  end: async () => {
    if (pgPool) {
      await pgPool.end();
    }
  },
};

if (process.env.VERCEL !== '1') {
  initializeDatabase().catch((err) => {
    console.error('Failed to initialize database on startup:', err);
  });
}

export default pool;
  