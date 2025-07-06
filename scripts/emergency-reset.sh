#!/bin/bash
set -e

echo "🆘 EMERGENCY RESET - This will DESTROY all local changes!"
read -p "Are you SURE? Type 'RESET' to continue: " confirm

if [ "$confirm" != "RESET" ]; then
    echo "❌ Aborted"
    exit 1
fi

cd /var/www/flowen

echo "🗑️  Removing all files..."
rm -rf ./* ./.*[!.]* 2>/dev/null || true

echo "📥 Cloning fresh from GitHub..."
git clone https://github.com/Industrinat/flowen-site.git .

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart flowen

echo "✅ Emergency reset complete!"