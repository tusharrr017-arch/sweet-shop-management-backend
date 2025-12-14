// Script to run database migrations
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
const backendDir = path.resolve(process.cwd());
const rootDir = path.resolve(backendDir, '..');

dotenv.config({ path: path.join(backendDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config();

async function runMigrations() {
  // Get connection string from environment
  const connectionString = process.env.DATABASE_URL || 
                          process.env.POSTGRES_URL || 
                          process.env.POSTGRES_URL_NON_POOLING ||
                          process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    console.error('Error: No database connection string found.');
    console.error('Please set one of: DATABASE_URL, POSTGRES_URL, POSTGRES_URL_NON_POOLING, or POSTGRES_PRISMA_URL');
    process.exit(1);
  }

  console.log('Connecting to database...');
  console.log('Connection string type:', 
    process.env.DATABASE_URL ? 'DATABASE_URL' :
    process.env.POSTGRES_URL ? 'POSTGRES_URL' :
    process.env.POSTGRES_URL_NON_POOLING ? 'POSTGRES_URL_NON_POOLING' :
    'POSTGRES_PRISMA_URL'
  );

  // Configure SSL for cloud databases
  const requiresSSL = connectionString.includes('supabase') ||
                     connectionString.includes('pooler.supabase.com') ||
                     connectionString.includes('aws-') ||
                     !connectionString.includes('localhost');

  const pool = new Pool({
    connectionString,
    ssl: requiresSSL ? { rejectUnauthorized: false } : false,
  });

  try {
    // Get all migration files
    const migrationsDir = path.join(backendDir, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration file(s)`);

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Running migration: ${file}...`);
      await pool.query(sql);
      console.log(`✓ Migration ${file} completed successfully`);
    }

    console.log('\n✅ All migrations completed successfully!');
    await pool.end();
  } catch (error: any) {
    console.error('❌ Migration error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();

