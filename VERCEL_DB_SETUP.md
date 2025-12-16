# Vercel Database Setup Guide

This guide walks through setting up a Vercel Postgres database for the Sweet Shop Management System.

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel Dashboard at [vercel.com](https://vercel.com) and log in
2. Select your project (or create a new one)
3. Click on the **Storage** tab in the top menu
4. Click **Create Database**
5. Select **Postgres** from the database options
6. Choose a plan (Hobby plan is free for small projects)
7. Give your database a name (e.g., "sweet-shop-db")
8. Click **Create**

Wait 1-2 minutes for Vercel to create your database. Once ready, you'll see it in the Storage tab.

## Step 2: Get Connection String

1. Click on your newly created Postgres database
2. Go to the **.env.local** tab or **Settings** tab
3. Look for `POSTGRES_URL` or `DATABASE_URL`
4. Copy the entire connection string (it will look like: `postgres://username:password@host:port/database`)

## Step 3: Set Environment Variables in Vercel

1. In your Vercel project dashboard, click **Settings** in the top menu
2. Click **Environment Variables** in the left sidebar
3. Click **Add New**
4. Add the following variables:

   **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: Paste your `POSTGRES_URL` connection string
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

   **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: Any random string (e.g., `my-super-secret-jwt-key-12345`)
   - Environment: Select all
   - Click **Save**

   **JWT_EXPIRES_IN**
   - Key: `JWT_EXPIRES_IN`
   - Value: `24h`
   - Environment: Select all
   - Click **Save**

   **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production` (for production) or `development` (for preview/dev)
   - Environment: Select appropriate environment
   - Click **Save**

## Step 4: Set Up Local Environment

For local development, create a `.env` file in the `backend` folder:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a new file named `.env`:
```env
DATABASE_URL=your_postgres_url_from_vercel_here
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
```

3. Replace `your_postgres_url_from_vercel_here` with the actual `POSTGRES_URL` you copied from Vercel

## Step 5: Run Database Migrations

You need to create the database tables. You have two options:

### Option A: Using Vercel CLI

1. Install Vercel CLI (if not installed):
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
cd backend
vercel link
```

4. Pull environment variables:
```bash
vercel env pull .env.local
```

5. Run migrations using psql:

On Windows (PowerShell):
```powershell
$env:DATABASE_URL = (Get-Content .env.local | Select-String "DATABASE_URL" | ForEach-Object { $_.ToString().Split('=')[1] })
psql $env:DATABASE_URL -f migrations/001_initial_schema.sql
```

On Mac/Linux:
```bash
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2)
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

### Option B: Using Vercel Dashboard

1. Go to your database in Vercel
2. Navigate to Storage → Your Database → **Data** tab
3. Click **Query** or **SQL Editor**
4. Copy and paste this SQL (from `backend/migrations/001_initial_schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sweets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sweets_category ON sweets(category);
CREATE INDEX IF NOT EXISTS idx_sweets_name ON sweets(name);
```

5. Click **Run** or **Execute**

## Step 6: Seed the Database

Create the default admin user:

1. Make sure your `.env` file is set up (Step 4)
2. Run the seed script:
```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@sweetshop.com`
- Password: `admin123`

## Step 7: Redeploy Application

1. If you're on Vercel:
   - After setting environment variables, Vercel will automatically redeploy
   - Or manually trigger a redeploy: Go to Deployments → Click "..." → "Redeploy"

2. If running locally:
```bash
cd backend
npm run dev
```

## Step 8: Test the Login

1. Go to your login page
2. Use these credentials:
   - Email: `admin@sweetshop.com`
   - Password: `admin123`

## Troubleshooting

### Still seeing "Database connection error"?

1. **Check environment variables are set**:
   - In Vercel: Settings → Environment Variables → Make sure `DATABASE_URL` exists
   - Locally: Check `backend/.env` file exists and has `DATABASE_URL`

2. **Verify the connection string**:
   - Make sure you copied the FULL `POSTGRES_URL` from Vercel
   - It should start with `postgres://` or `postgresql://`

3. **Check database tables exist**:
   - Go to Vercel → Storage → Your Database → Data tab
   - You should see `users` and `sweets` tables

4. **Check backend logs**:
   - In Vercel: Go to Deployments → Click on latest deployment → View Function Logs
   - Look for database connection errors

5. **Make sure you ran migrations** (Step 5)

### Need Help?

- Check Vercel logs for specific error messages
- Verify your `DATABASE_URL` is correct
- Make sure all environment variables are set in Vercel

## Quick Checklist

- [ ] Created Vercel Postgres database
- [ ] Copied `POSTGRES_URL` connection string
- [ ] Set `DATABASE_URL` in Vercel environment variables
- [ ] Created `backend/.env` file with `DATABASE_URL`
- [ ] Ran database migrations (created tables)
- [ ] Ran `npm run seed` (created admin user)
- [ ] Redeployed application
- [ ] Tested login with admin credentials
