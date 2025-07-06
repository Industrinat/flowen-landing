#!/bin/bash
set -e

echo "🚀 Starting Flowen deployment..."
echo "📅 $(date)"

cd /var/www/flowen

echo "📊 Current git status:"
git status --porcelain

if [[ $(git status --porcelain) ]]; then
    echo "⚠️  Uncommitted changes found - creating backup..."
    git stash push -m "Auto-backup before deploy $(date)"
fi

echo "🔄 Syncing with main branch..."
git fetch origin
git reset --hard origin/main
git clean -fd

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building project..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart flowen
pm2 status

echo "✅ Deployment complete!"
echo "🌐 Check: https://flowen.eu"
pm2 list