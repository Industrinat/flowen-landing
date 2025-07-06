#!/bin/bash
set -e

echo "🔍 Pre-deployment checks..."

if [ ! -f "package.json" ]; then
    echo "❌ Not in project root! Run from flowen-site directory"
    exit 1
fi

BRANCH=$(git branch --show-current)
echo "📍 Current branch: $BRANCH"

if [[ $(git status --porcelain) ]]; then
    echo "⚠️  Uncommitted changes found:"
    git status --short
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🏗️  Testing local build..."
npm run build

if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Not on main branch!"
    read -p "Deploy $BRANCH anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📤 Pushing to origin..."
git push origin $BRANCH

echo "✅ Pre-deployment checks passed!"
echo "🚀 Ready for server deployment"
echo ""
echo "Next steps:"
echo "1. SSH to server: ssh -i ~/.ssh/id_ovh_flowen root@162.19.252.99"
echo "2. Run: ./scripts/deploy.sh"