#!/bin/bash

# Setup script for Todo API with PostgreSQL and Prisma

echo "🚀 Setting up Todo API with PostgreSQL and Prisma..."

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker version > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "✅ Docker is running"

# Start PostgreSQL with Docker Compose
echo "🐘 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run db:generate

# Push schema to database
echo "📊 Creating database tables..."
bun run db:push

echo "✅ Database setup complete!"
echo "🎉 You can now run 'bun run dev' to start the development server"
echo "📊 Access Prisma Studio with 'bun run db:studio'" 