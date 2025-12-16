# Sweet Shop Management System

A full-stack web application for managing a sweet shop inventory. Built with Node.js/TypeScript, React, and PostgreSQL. This project demonstrates Test-Driven Development practices, clean coding principles, and modern development workflows.

## Overview

This application provides a complete inventory management system for a sweet shop. Users can browse, search, and purchase sweets, while administrators have full control over inventory management including adding, editing, deleting, and restocking items.

## Features

### User Features
- User registration and authentication
- Browse all available sweets
- Search and filter sweets by name, category, and price range
- Purchase sweets with automatic stock updates
- Responsive design for desktop, tablet, and mobile

### Admin Features
- All user features plus:
- Add new sweets with images
- Edit existing sweet details
- Delete sweets from inventory
- Restock items to increase quantity
- Full inventory management dashboard

## Technology Stack

### Backend
- Node.js with TypeScript
- Express.js framework
- PostgreSQL database (Vercel DB)
- JWT authentication
- Jest for testing
- bcryptjs for password hashing

### Frontend
- React 18 with TypeScript
- Vite build tool
- React Router v6
- Axios for HTTP requests
- Ant Design UI library
- Ant Design Icons

## Prerequisites

Before setting up the project, ensure you have:
- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- PostgreSQL database (Vercel DB recommended for production)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project_01
```

### 2. Database Setup

#### Using Vercel DB (Recommended)

1. Create a PostgreSQL database in your Vercel project dashboard
2. Navigate to the Storage tab and create a new Postgres database
3. Copy the `POSTGRES_URL` connection string from your database settings
4. Use this connection string as your `DATABASE_URL` in environment variables

#### Local PostgreSQL Setup

1. Install PostgreSQL locally if needed
2. Create a database:
```bash
createdb sweet_shop_db
```

3. Run the migration:
```bash
cd backend
psql -d sweet_shop_db -f migrations/001_initial_schema.sql
```

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
```

For Vercel DB, use the `POSTGRES_URL` from your Vercel dashboard as the `DATABASE_URL`.

4. Seed the database with default admin user:
```bash
npm run seed
```

This creates an admin user with:
- Email: `admin@sweetshop.com`
- Password: `admin123`

5. Start the backend server:
```bash
npm run dev
```

The backend API will be running on `http://localhost:3001`

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will be running on `http://localhost:5173`

## Testing

### Backend Tests

Run the test suite:
```bash
cd backend
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Documentation

### Authentication Endpoints

**POST /api/auth/register**
- Register a new user
- Body: `{ "email": "user@example.com", "password": "password123" }`
- Returns: `{ "token": "...", "user": { "id": 1, "email": "...", "role": "user" } }`

**POST /api/auth/login**
- Login and receive JWT token
- Body: `{ "email": "user@example.com", "password": "password123" }`
- Returns: `{ "token": "...", "user": { "id": 1, "email": "...", "role": "user" } }`

### Sweets Endpoints (Protected - Requires Authentication)

**POST /api/sweets** (Admin only)
- Create a new sweet
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "Chocolate Bar", "category": "Chocolate", "price": 2.50, "quantity": 100, "image_url": "..." }`

**GET /api/sweets**
- Get all sweets
- Headers: `Authorization: Bearer <token>`
- Returns: `{ "sweets": [...] }`

**GET /api/sweets/search?name=&category=&minPrice=&maxPrice=**
- Search sweets with filters
- Headers: `Authorization: Bearer <token>`
- Query params: `name`, `category`, `minPrice`, `maxPrice`

**PUT /api/sweets/:id**
- Update a sweet (Admin only for name/category/price, all users can update quantity)
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "Updated Name", "price": 3.00 }`

**DELETE /api/sweets/:id** (Admin only)
- Delete a sweet
- Headers: `Authorization: Bearer <token>`

### Inventory Endpoints (Protected - Requires Authentication)

**POST /api/sweets/:id/purchase**
- Purchase a sweet (decreases quantity)
- Headers: `Authorization: Bearer <token>`
- Body: `{ "quantity": 1 }` (optional, defaults to 1)

**POST /api/sweets/:id/restock** (Admin only)
- Restock a sweet (increases quantity)
- Headers: `Authorization: Bearer <token>`
- Body: `{ "quantity": 50 }`

## Project Structure

```
project_01/
├── backend/
│   ├── api/
│   │   └── index.ts            # Vercel serverless function entry point
│   ├── src/
│   │   ├── __tests__/          # Test files
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth middleware
│   │   ├── routes/             # API routes
│   │   ├── types/              # TypeScript types
│   │   └── index.ts            # Express app entry point
│   ├── migrations/             # Database migrations
│   ├── scripts/                # Utility scripts (seed, make-admin, etc.)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React context (Auth)
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── vercel.json                  # Vercel deployment configuration
└── README.md
```

## Usage

1. **Login**: Use the default admin credentials or register a new account
   - Email: `admin@sweetshop.com`
   - Password: `admin123`

2. **Browse Sweets**: View all available sweets on the dashboard

3. **Search**: Use the search bar to filter sweets by name, category, or price

4. **Purchase**: Click the "Purchase" button to buy a sweet (decreases stock)

5. **Admin Features**: As an admin, you can add, edit, delete, and restock sweets

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set Environment Variables in Vercel dashboard:
   - `JWT_SECRET`: Your JWT secret key
   - `JWT_EXPIRES_IN`: Token expiration (e.g., "24h")
   - `DATABASE_URL`: PostgreSQL connection string

4. Configure Database:
   - Use Vercel Postgres or another PostgreSQL provider
   - Run migrations on your production database
   - Seed initial data if needed

5. Configure Frontend:
   - Set Root Directory to `frontend` in Vercel project settings

After deployment, your application will be available at:
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-project.vercel.app/api`

## My AI Usage

### Tools Used

I used Cursor AI (powered by Claude) throughout the development process.

### How AI Was Used

**Project Setup**
- Generated initial project structure for backend and frontend
- Created TypeScript configuration files
- Set up package.json files with dependencies

**Backend Development**
- Generated Express route and controller structure
- Designed PostgreSQL schema with constraints and indexes
- Implemented JWT authentication flow and password hashing
- Created middleware for route protection
- Set up database configuration and migrations

**Frontend Development**
- Generated React component structure and routing
- Implemented React Context for authentication state
- Created API service layer with TypeScript interfaces
- Built UI components using Ant Design
- Implemented pagination with localStorage persistence

**Testing**
- Generated test file structure and Jest configuration
- Created comprehensive test cases covering edge cases
- Set up test data patterns

**Code Quality**
- Defined TypeScript interfaces and types
- Reviewed code for bugs and security issues
- Generated documentation

**Deployment**
- Set up Vercel configuration for monorepo
- Created serverless function entry points

### Reflection

**Benefits**
- Significantly accelerated development by generating boilerplate
- Suggested modern patterns and best practices
- Helped maintain consistent code style
- Exposed me to new approaches and patterns
- Assisted in debugging complex issues

**Challenges**
- Had to carefully review AI suggestions before using them
- Sometimes needed to provide more context for better results
- AI-generated code still required thorough testing
- Often needed to customize suggestions for project needs

**Approach**
- Reviewed all AI-generated code before committing
- Tested thoroughly to ensure functionality
- Understood the code before using it
- Made customizations based on project requirements
- Used AI as a tool to augment, not replace, development skills

AI was an invaluable tool that enhanced productivity while building this project. It helped me focus on solving business logic problems rather than writing boilerplate code. However, I ensured that I understood every piece of code and maintained full ownership of the final implementation.

## Test Coverage

To generate the test coverage report:

```bash
cd backend
npm run test:coverage
```

The coverage report will be generated in the `backend/coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed coverage report.

Expected coverage:
- Authentication: ~90%+
- Sweets CRUD: ~85%+
- Search: ~80%+
- Overall: ~85%+

## Future Enhancements

- Order history for users
- Shopping cart functionality
- Email notifications
- Rate limiting for API endpoints
- Comprehensive logging
- Analytics dashboard for admins

## License

This project is created for educational purposes as part of a TDD Kata exercise.

## Author

Developed as part of a Test-Driven Development exercise, with AI assistance as documented above.
