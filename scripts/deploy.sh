#!/bin/bash
# =============================================================
# Ecsendia Autos — Deploy Script
# Run on the server: bash scripts/deploy.sh
# =============================================================
set -e

APP_DIR="/var/www/ecsendia-autos"
echo "▶ Deploying Ecsendia Autos..."

cd $APP_DIR

# Pull latest code
echo "▶ Pulling latest code..."
git pull origin main

# Install dependencies
echo "▶ Installing dependencies..."
npm ci --omit=dev

# Generate Prisma client
echo "▶ Generating Prisma client..."
npx prisma generate

# Build Next.js
echo "▶ Building Next.js..."
npm run build

# Restart app with PM2
echo "▶ Reloading PM2..."
pm2 reload ecosystem.config.js --update-env

echo "✅ Deploy complete!"
pm2 status
