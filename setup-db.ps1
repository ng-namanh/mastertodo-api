# Setup script for Todo API with PostgreSQL and Prisma

Write-Host "🚀 Setting up Todo API with PostgreSQL and Prisma..." -ForegroundColor Green

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL with Docker Compose
Write-Host "🐘 Starting PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
bun run db:generate

# Push schema to database
Write-Host "📊 Creating database tables..." -ForegroundColor Yellow
bun run db:push

Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host "🎉 You can now run 'bun run dev' to start the development server" -ForegroundColor Green
Write-Host "📊 Access Prisma Studio with 'bun run db:studio'" -ForegroundColor Green 