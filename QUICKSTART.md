# Quick Start Guide

Get your Todo API running with PostgreSQL and Prisma in minutes!

## Prerequisites

- Node.js (v16 or higher)
- Bun package manager
- Docker Desktop

## Quick Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment:**
   ```bash
   copy env.example .env
   ```

3. **Start PostgreSQL and set up database (Windows):**
   ```bash
   bun run setup
   ```

   **Or on Unix-like systems:**
   ```bash
   bun run setup:unix
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```

## Manual Setup (Alternative)

If you prefer to set up manually:

1. **Start PostgreSQL with Docker:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Generate Prisma client:**
   ```bash
   bun run db:generate
   ```

3. **Create database tables:**
   ```bash
   bun run db:push
   ```

4. **Start the server:**
   ```bash
   bun run dev
   ```

## Verify Installation

1. **Check API health:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **View API documentation:**
   ```bash
   curl http://localhost:3000/
   ```

3. **Open Prisma Studio (database GUI):**
   ```bash
   bun run db:studio
   ```

## Test the API

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Create a todo (use the token from login):**
   ```bash
   curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{
       "title": "Test todo",
       "description": "This is a test todo"
     }'
   ```

## Troubleshooting

### Docker Issues
- Make sure Docker Desktop is running
- Check if port 5432 is available
- Try `docker-compose down` and `docker-compose up -d postgres`

### Database Connection Issues
- Verify PostgreSQL is running: `docker ps`
- Check the DATABASE_URL in your .env file
- Ensure the database credentials match docker-compose.yml

### Prisma Issues
- Regenerate the client: `bun run db:generate`
- Reset the database: `bun run db:push --force-reset`

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Set up your frontend application
- Configure production deployment

Happy coding! 🚀 