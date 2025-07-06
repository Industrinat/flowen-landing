#!/bin/bash

echo "📊 Flowen Server Status"
echo "======================="
echo "📅 $(date)"
echo ""

cd /var/www/flowen

echo "🌟 Git Status:"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git log --oneline -1)"
echo "Dirty files:"
git status --porcelain || echo "  (clean)"
echo ""

echo "📦 Dependencies:"
npm list --depth=0 2>/dev/null | head -5
echo ""

echo "🔄 PM2 Status:"
pm2 list
echo ""

echo "💾 Disk Usage:"
df -h /var/www/flowen
echo ""

echo "🌐 Service Status:"
curl -s -o /dev/null -w "Flowen.eu: %{http_code} (response time: %{time_total}s)\n" https://flowen.eu