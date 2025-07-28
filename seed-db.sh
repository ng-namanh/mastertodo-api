#!/bin/bash

# Database seeding script for Unix/Linux/Mac systems

echo "Starting database seeding..."

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "Error: tsx is not installed. Please run 'npm install' first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it based on env.example"
    exit 1
fi

# Run database seeding
echo "Running user seeding..."
tsx prisma/seeds/seed-users.ts

if [ $? -eq 0 ]; then
    echo "User seeding completed successfully!"
    
    echo "Running todo seeding..."
    tsx prisma/seeds/seed-todos.ts
    
    if [ $? -eq 0 ]; then
        echo "Todo seeding completed successfully!"
        echo "Database seeding completed! 🎉"
    else
        echo "Todo seeding failed!"
        exit 1
    fi
else
    echo "User seeding failed!"
    exit 1
fi
