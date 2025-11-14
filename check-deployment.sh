#!/bin/bash

echo "🔍 Checking GitHub Pages deployment status..."
echo ""

# Check latest workflow run
echo "📊 Latest Deployments:"
gh run list --limit 5

echo ""
echo "🌐 Testing site availability..."

# Test with different user agents
echo ""
echo "Desktop User-Agent:"
curl -s -I https://swipswaps.github.io/Blog-Scraper-AI/ | grep -E "HTTP|cache"

echo ""
echo "Mobile User-Agent:"
curl -s -I -A "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0.4472.120 Mobile Safari/537.36" https://swipswaps.github.io/Blog-Scraper-AI/ | grep -E "HTTP|cache"

echo ""
echo "✅ If both show 'HTTP/2 200', the site is working!"
echo "⏱️  Wait 5 more minutes for CDN cache to fully propagate"
echo ""
echo "📱 Then test on your Android phone:"
echo "   1. Clear Chrome cache"
echo "   2. Close Chrome completely"
echo "   3. Reopen and visit: https://swipswaps.github.io/Blog-Scraper-AI/"

