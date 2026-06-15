#!/bin/bash

# Exit on error
set -e

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm could not be found. Please install Node.js and npm first."
    exit 1
fi

echo "🚀 Starting Team Velocity Tracker setup..."

# Get the absolute path of the project root
PROJECT_ROOT=$(pwd)

# Install and setup Backend
echo "📦 Setting up Backend..."
cd "$PROJECT_ROOT/backend"
npm install
echo "🗄️ Setting up Database..."
npx prisma db push

# Install Frontend
echo "📦 Setting up Frontend..."
cd "$PROJECT_ROOT/frontend"
npm install

# Start both applications
echo "🌟 Starting Backend and Frontend..."
# Using npx to run concurrently without global installation
npx concurrently \
  --kill-others \
  -n "backend,frontend" \
  -c "blue,green" \
  "cd $PROJECT_ROOT/backend && npm run dev" \
  "cd $PROJECT_ROOT/frontend && npm run dev"
