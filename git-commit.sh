#!/bin/bash
cd /home/owner/Documents/Blog-Scraper-AI
/usr/bin/git add vite.config.ts check-pages-status.sh enable-github-pages.sh quick-deploy.sh git-commit.sh
/usr/bin/git commit -m "Fix GitHub Pages 404: Set correct base path for repository deployment

Problem: Site deployed but showed 404 error
Root Cause: Vite base path was './' but GitHub Pages needs '/Blog-Scraper-AI/'

Solution:
- Set base to '/Blog-Scraper-AI/' when building in GitHub Actions
- Keep './' for local dev and other platforms
- Detects GitHub Actions environment automatically

Files Changed:
- vite.config.ts: Dynamic base path based on environment
- quick-deploy.sh: Enhanced GitHub Pages guidance
- enable-github-pages.sh: Interactive setup helper
- check-pages-status.sh: Diagnostics tool

This will make the site accessible at:
https://swipswaps.github.io/Blog-Scraper-AI"
/usr/bin/git push origin main
echo ""
echo "✅ Changes pushed! GitHub Actions will deploy in 2-3 minutes."
echo "🔗 Monitor: https://github.com/swipswaps/Blog-Scraper-AI/actions"
echo "🌐 Site will be live at: https://swipswaps.github.io/Blog-Scraper-AI"

