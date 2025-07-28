# Database seeding script for Windows PowerShell

Write-Host "Starting database seeding..." -ForegroundColor Green

# Check if tsx is available
try {
    tsx --version | Out-Null
} catch {
    Write-Host "Error: tsx is not installed. Please run 'npm install' first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (!(Test-Path .env)) {
    Write-Host "Error: .env file not found. Please create it based on env.example" -ForegroundColor Red
    exit 1
}

# Run database seeding
Write-Host "Running user seeding..." -ForegroundColor Yellow
tsx prisma/seeds/seed-users.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "User seeding completed successfully!" -ForegroundColor Green
    
    Write-Host "Running todo seeding..." -ForegroundColor Yellow
    tsx prisma/seeds/seed-todos.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Todo seeding completed successfully!" -ForegroundColor Green
        Write-Host "Database seeding completed! 🎉" -ForegroundColor Green
    } else {
        Write-Host "Todo seeding failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "User seeding failed!" -ForegroundColor Red
    exit 1
}
