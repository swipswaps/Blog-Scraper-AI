#!/bin/bash

cd /home/owner/Documents/Blog-Scraper-AI

echo "📝 Committing date feature and README updates..."

/usr/bin/git add \
  types.ts \
  constants/index.ts \
  services/geminiService.ts \
  components/PostList.tsx \
  App.tsx \
  utils/download.ts \
  README.md \
  DATE_FEATURE_SUMMARY.md

/usr/bin/git commit -m "Add date display and sorting functionality + comprehensive README update

Features Added:
- Display post publication dates below titles
- Sort by date (newest first / oldest first)
- Include dates in CSV/JSON exports
- Extract dates from JSON feed metadata

README Updates:
- Complete step-by-step user guide (no steps skipped)
- Comprehensive troubleshooting guide covering all known issues:
  * Failed to fetch posts
  * Content not available
  * Slow performance
  * Search not working
  * Dates not showing
  * Download issues
  * Port conflicts
  * Deployment problems (GitHub Pages 404, Vercel auth)
  * Browser compatibility
  * Memory issues
- Updated features list
- Updated data structure documentation
- Added example workflows

Files Modified:
- types.ts: Added optional date field to BlogPost
- constants/index.ts: Added DATE_ASC and DATE_DESC sort options
- services/geminiService.ts: Extract date_modified from feed
- components/PostList.tsx: Display formatted dates
- App.tsx: Implement date sorting logic
- utils/download.ts: Include dates in exports
- README.md: Complete rewrite of user guide and troubleshooting

User Benefits:
- Better organization with chronological sorting
- Context with visible publication dates
- Complete guidance for all common issues
- No more confusion about how to use the app"

echo ""
echo "✅ Changes committed!"
echo ""
echo "📤 Pushing to GitHub..."

/usr/bin/git push origin main

echo ""
echo "🎉 Done! Changes pushed to GitHub."
echo ""
echo "🚀 GitHub Actions will deploy in 2-3 minutes"
echo "🔗 Monitor: https://github.com/swipswaps/Blog-Scraper-AI/actions"
echo "🌐 Site: https://swipswaps.github.io/Blog-Scraper-AI"
echo ""
echo "📋 Summary document: DATE_FEATURE_SUMMARY.md"

