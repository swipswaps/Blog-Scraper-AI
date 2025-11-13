#!/bin/bash

# Deploy to Netlify Script
# This script helps you deploy the Blog Scraper AI to Netlify

set -e

echo "🚀 Blog Scraper AI - Netlify Deployment"
echo "========================================"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Netlify CLI not found. Installing..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installed!"
    echo ""
fi

# Check if user is logged in
echo "🔐 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "Please log in to Netlify:"
    netlify login
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
echo "🚀 Deploying to Netlify..."
echo ""

# Ask if production or preview
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to production..."
    netlify deploy --prod --dir=dist
else
    echo "Deploying preview..."
    netlify deploy --dir=dist
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 View your site:"
echo "   netlify open"
echo ""

