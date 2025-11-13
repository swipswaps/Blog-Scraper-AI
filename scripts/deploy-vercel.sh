#!/bin/bash

# Deploy to Vercel Script
# This script helps you deploy the Blog Scraper AI to Vercel

set -e

echo "🚀 Blog Scraper AI - Vercel Deployment"
echo "======================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
    echo ""
fi

echo "✅ Authenticated!"
echo ""

# Build the project
echo "🔨 Building project..."
npm run build
echo "✅ Build complete!"
echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""

# Ask if production or preview
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to production..."
    vercel --prod
else
    echo "Deploying preview..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 View your deployment:"
echo "   vercel ls"
echo ""
echo "🌐 Open in browser:"
echo "   vercel open"
echo ""

