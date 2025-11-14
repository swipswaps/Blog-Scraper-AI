<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Blog Scraper AI

A powerful React-based web application that scrapes blog posts from websites and allows you to filter, sort, and export them in CSV or JSON format. Specifically optimized for GoDaddy Website Builder blogs with support for JSON Feed format.

## 🌟 Features

- **🔍 Smart Blog Scraping**: Automatically discovers and fetches blog posts from websites
- **📡 JSON Feed Support**: Detects and uses JSON Feed (`/f.json`) for efficient post discovery
- **📄 Full Content Extraction**: Fetches complete article content from individual post pages
- **🎯 GoDaddy Optimized**: Specialized parsing for GoDaddy Website Builder blog structure
- **🔄 CORS Proxy Handling**: Multiple fallback proxies to bypass CORS restrictions
- **📊 Export Options**: Download posts as CSV or JSON files with dates
- **🔎 Search & Filter**: Search posts by title or content in real-time
- **📅 Date Display**: Shows publication date below each post title
- **📑 Advanced Sorting**: Sort by date (newest/oldest), title (A-Z), or content length
- **📖 Pagination**: View posts 5 at a time with accordion-style expansion
- **⚡ Real-time Progress**: Live status updates during scraping process
- **⌨️ Keyboard Shortcuts**: Press Ctrl+Enter to fetch posts quickly

## ⚡ Quick Start (Automated)

**👋 First time here? Start with the [Complete Beginner's Guide](GETTING_STARTED.md)**

**New users? Run this one command:**

```bash
./setup-wizard.sh
```

This interactive wizard will:
- ✅ Check your system
- ✅ Install dependencies
- ✅ Test the app locally
- ✅ Deploy to your chosen platform

**Already set up? Deploy in one command:**

```bash
./deploy.sh
```

**📚 Documentation:**
- [🚀 Getting Started Guide](GETTING_STARTED.md) - Complete beginner's walkthrough
- [📜 Scripts Guide](SCRIPTS_GUIDE.md) - All automated deployment options
- [🤖 Automation Guide](AUTOMATION_GUIDE.md) - How automation works

---

## 🚀 How It Works

### Architecture

1. **Feed Discovery**: The app first attempts to find a JSON Feed at `/f.json` (common for GoDaddy blogs)
2. **Post Enumeration**: Extracts post metadata (title, URL, date) from the feed
3. **Content Fetching**: Visits each individual post URL to fetch full content
4. **Smart Parsing**:
   - Extracts content from `window._BLOG_DATA` JavaScript object (GoDaddy structure)
   - Parses Draft.js JSON format to get clean text content
   - Falls back to DOM parsing if JavaScript extraction fails
5. **Data Processing**: Filters, sorts, and displays posts with search functionality

### Supported Blog Platforms

- **GoDaddy Website Builder** (Primary support with JSON Feed)
- Any blog with JSON Feed format (`/f.json`)
- Generic blogs (with limited support via DOM parsing)

### Content Extraction Strategy

The scraper uses a multi-layered approach:

1. **JSON Feed** (`/f.json`): Discovers all posts and their URLs
2. **JavaScript Data Extraction**: Parses `window._BLOG_DATA.post.fullContent` from each post page
3. **Draft.js Parser**: Extracts text from Draft.js content blocks
4. **DOM Fallback**: Uses CSS selectors (`[data-ux="BlogPostContent"]`, `article`, etc.) if JavaScript parsing fails
5. **Feed Excerpt**: Uses HTML content from feed as last resort

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

**Don't have these?** The `setup-wizard.sh` script will help you!

## 🛠️ Installation

### Option 1: Automated Setup (Recommended) ⭐

**For first-time users:**
```bash
git clone https://github.com/swipswaps/Blog-Scraper-AI.git
cd Blog-Scraper-AI
./setup-wizard.sh
```

The wizard will:
- ✅ Check system requirements
- ✅ Install dependencies
- ✅ Test the app locally
- ✅ Optionally deploy

### Option 2: Manual Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/swipswaps/Blog-Scraper-AI.git
   cd Blog-Scraper-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📖 Complete User Guide

### Step-by-Step Tutorial

#### Step 1: Enter Blog URL

1. **Locate the URL input field** at the top of the page (labeled "Blog URL")
2. **Paste or type the blog's homepage URL**
   - ✅ Good: `https://johnssolarblog.com/`
   - ✅ Good: `https://example.godaddysites.com`
   - ❌ Bad: `https://johnssolarblog.com/post/my-first-post` (don't use individual post URLs)
3. **The app will automatically**:
   - Normalize the URL (remove trailing slashes)
   - Look for a JSON feed at `/f.json`
   - Fall back to HTML scraping if no feed is found

#### Step 2: Set Post Limit (Optional)

1. **Locate the "Post Limit" field** next to the URL input
2. **Enter a number** (e.g., `10`, `50`, `100`)
   - Leave blank to fetch **all available posts**
   - Recommended: Start with `10` for testing
   - Maximum: `1000` posts
3. **Why use a limit?**
   - Faster testing and preview
   - Avoid overwhelming your browser with hundreds of posts
   - You can always fetch more later

#### Step 3: Fetch Posts

**Option A: Click the Button**
- Click the **"Fetch Blog Posts"** button

**Option B: Keyboard Shortcut** ⚡
- Press **Ctrl+Enter** (or **Cmd+Enter** on Mac)

**What happens next:**
1. **Progress messages appear** showing:
   - "Looking for blog feed..."
   - "Found JSON feed with X posts"
   - "Fetching post 1/10 (10%): Post Title"
2. **Posts appear one by one** as they're fetched
3. **Status updates** show success/failure counts
4. **Completion message** appears when done

#### Step 4: View Posts

**Understanding the Post List:**
- Posts appear in an **accordion-style list**
- **5 posts per page** (use pagination to see more)
- Each post shows:
  - **Title** (large, bold text)
  - **Date** (below title, e.g., "Jan 15, 2024")
  - **Expand arrow** (▼) on the right

**To read a post:**
1. **Click anywhere on the post header**
2. **Content expands** with smooth animation
3. **Copy button** appears (📋 icon)
4. **Click again to collapse**

**Pagination:**
- **Previous/Next buttons** at the bottom
- **Page indicator** shows "Page 1 of 5"
- **Smooth scroll** to top when changing pages

#### Step 5: Search Posts

1. **Locate the search box** (has a 🔍 icon)
2. **Type your search query**
   - Searches both **title** and **content**
   - Case-insensitive
   - Real-time filtering (no need to press Enter)
3. **Results update instantly** as you type
4. **Clear the search** to see all posts again

**Search Examples:**
- `solar` - Finds all posts mentioning "solar"
- `2024` - Finds posts from 2024 or mentioning "2024"
- `how to` - Finds tutorial-style posts

#### Step 6: Sort Posts

1. **Locate the "Sort by" dropdown** (top right of results)
2. **Click to open** the dropdown menu
3. **Select your preferred sorting**:

**Sorting Options:**
- **Default Order** - As they appear in the feed
- **Date (Newest First)** ⭐ - Most recent posts at top
- **Date (Oldest First)** - Historical posts first
- **Title (A-Z)** - Alphabetical order
- **Title (Z-A)** - Reverse alphabetical
- **Length (Shortest)** - Brief posts first
- **Length (Longest)** - Detailed posts first

**Pro Tips:**
- Use **Date (Newest First)** to find recent content
- Use **Date (Oldest First)** to read chronologically
- Use **Length (Longest)** to find in-depth articles
- Combine with **search** for powerful filtering

#### Step 7: Export Data

**CSV Export (Spreadsheet-Compatible):**
1. Click **"Download CSV"** button (📥 CSV)
2. File downloads as `blog-posts-YYYY-MM-DD.csv`
3. **Opens in**: Excel, Google Sheets, Numbers
4. **Columns**: `title`, `date`, `content`

**JSON Export (Developer-Friendly):**
1. Click **"Download JSON"** button (📥 JSON)
2. File downloads as `blog-posts-YYYY-MM-DD.json`
3. **Use for**: Data analysis, migration scripts, APIs
4. **Format**: Array of post objects with title, date, content

**Limit Export (Optional):**
- Enter a number in the **"Limit"** field next to download buttons
- Downloads only the first N posts from filtered results
- Leave blank to download **all filtered posts**

### Example Workflows

#### Workflow 1: Quick Content Backup
```
1. Enter URL: https://myblog.com/
2. Leave limit blank (fetch all)
3. Click "Fetch Posts" (or Ctrl+Enter)
4. Wait for completion
5. Click "Download JSON"
6. Save backup file
```

#### Workflow 2: Find Recent Posts About a Topic
```
1. Enter URL: https://johnssolarblog.com/
2. Set limit: 50
3. Click "Fetch Posts"
4. Sort by: "Date (Newest First)"
5. Search: "solar panels"
6. Review filtered results
7. Download CSV for analysis
```

#### Workflow 3: Content Migration
```
1. Enter URL: https://oldblog.com/
2. Fetch all posts (no limit)
3. Sort by: "Date (Oldest First)"
4. Download JSON
5. Use JSON file with migration script
```

#### Workflow 4: Find Longest Articles
```
1. Enter URL: https://blog.example.com/
2. Set limit: 20
3. Fetch posts
4. Sort by: "Length (Longest)"
5. Read top posts for in-depth content
```

## 🔧 Technical Details

### Tech Stack

- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS**: Custom styling with responsive design

### Key Components

- **`App.tsx`**: Main application component with state management
- **`PostList.tsx`**: Post display with accordion, pagination, and search
- **`geminiService.ts`**: Core scraping logic with feed discovery and content extraction
- **`proxyService.ts`**: CORS proxy handling with multiple fallback services

### CORS Proxy Services

The app uses multiple proxy services with automatic fallback:

1. `https://api.allorigins.win/raw?url=`
2. `https://corsproxy.io/?`
3. `https://api.codetabs.com/v1/proxy?quest=`
4. `https://cors-anywhere.herokuapp.com/`

### Data Structure

**Post Object**:
```typescript
interface BlogPost {
  title: string;      // Post title
  content: string;    // Full post content (plain text)
  date?: string;      // Publication date (ISO 8601 format)
}
```

**Export Formats**:
- **CSV**: `title,date,content` with proper escaping
- **JSON**: Array of post objects with title, date, and content fields

## 🎯 Use Cases

- **Content Migration**: Export blog posts for migration to another platform
- **Content Analysis**: Analyze blog content, word counts, topics
- **Backup**: Create backups of blog content
- **Research**: Collect and analyze blog posts for research purposes
- **SEO Analysis**: Export content for SEO tools and analysis

## 🐛 Comprehensive Troubleshooting Guide

### Common Issues and Solutions

#### ❌ "Failed to fetch posts" Error

**Possible Causes:**
1. **Invalid URL**
2. **Blog doesn't exist or is offline**
3. **CORS proxy issues**
4. **Network connectivity problems**

**Solutions:**

**Step 1: Verify the URL**
- ✅ Use the **homepage URL**, not an individual post URL
- ✅ Include `https://` at the beginning
- ✅ Remove any trailing slashes (app does this automatically)
- ❌ Don't use: `https://blog.com/post/my-post`
- ✅ Use: `https://blog.com/`

**Step 2: Test the Blog URL**
1. Open the URL in a new browser tab
2. Verify the blog loads correctly
3. Check if you can see blog posts on the page

**Step 3: Check for JSON Feed**
1. Try accessing `https://yourblog.com/f.json` directly
2. If you see JSON data, the feed exists
3. If you get a 404, the blog may not support JSON feeds

**Step 4: Try a Known Working Blog**
- Test with: `https://johnssolarblog.com/`
- If this works, the issue is with your target blog
- If this fails, check your internet connection

**Step 5: Check Browser Console**
1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for error messages
4. Common errors:
   - `CORS error` - Proxy issue (should auto-retry)
   - `Network error` - Check internet connection
   - `404` - Blog or feed doesn't exist

---

#### ❌ "Content not available" for Some Posts

**Why This Happens:**
- The blog structure is not recognized
- Post content is loaded dynamically via JavaScript
- Content is behind a paywall or login

**Solutions:**

**For GoDaddy Blogs:**
- ✅ Should work perfectly (optimized for this platform)
- If not, the blog may use a custom template

**For Other Blogs:**
1. **Check if posts have content in the feed**:
   - Visit `https://yourblog.com/f.json`
   - Look for `html_content` or `content_html` fields
   - If present, app will use this as fallback

2. **Try reducing the post limit**:
   - Some posts may work, others may not
   - Fetch 5-10 posts to see which ones work

3. **Report the blog structure**:
   - Open an issue on GitHub with the blog URL
   - We can add support for new blog platforms

---

#### ⏱️ Slow Performance / Long Wait Times

**This is Normal!**
- The app fetches **each post individually** for full content
- This ensures you get complete articles, not just excerpts
- 10 posts = 10 separate requests = 10-30 seconds

**Expected Times:**
- **10 posts**: 10-30 seconds
- **50 posts**: 1-2 minutes
- **100 posts**: 2-5 minutes

**How to Speed Up:**

**Option 1: Reduce Post Limit**
```
Instead of: 100 posts
Try: 10-20 posts for testing
```

**Option 2: Fetch in Batches**
```
First batch: Limit 20, fetch
Second batch: Limit 40, fetch
Third batch: Limit 60, fetch
```

**Option 3: Use Filters After Fetching**
```
1. Fetch all posts (be patient)
2. Use search to filter
3. Use sort to organize
4. Export only what you need
```

**Why Not Faster?**
- We prioritize **accuracy** over speed
- Full content extraction requires visiting each post
- CORS proxies add slight delays
- This prevents overwhelming the target server

---

#### 🔍 Search Not Finding Posts

**Check These:**

1. **Spelling**: Search is case-insensitive but spelling matters
   - ❌ `solor` won't find "solar"
   - ✅ `solar` will find "Solar", "SOLAR", "solar"

2. **Search Scope**: Searches both title AND content
   - If a word appears in content but not title, it will still match

3. **Clear Previous Searches**:
   - Click the ❌ in the search box
   - Or delete all text manually

4. **Try Partial Words**:
   - Instead of `"solar panels"`, try just `"solar"`
   - Instead of `"installation"`, try `"install"`

---

#### 📅 Dates Not Showing

**Why This Happens:**
- The blog feed doesn't include `date_modified` field
- The blog platform doesn't provide dates
- Older posts may not have date metadata

**What You'll See:**
- Posts **with dates**: Show "Jan 15, 2024" below title
- Posts **without dates**: No date shown (just title)

**Solutions:**

1. **Check the Feed**:
   - Visit `https://yourblog.com/f.json`
   - Look for `date_modified` or `date_published` fields
   - If missing, dates won't be available

2. **Date Sorting**:
   - Posts without dates go to the **end** of sorted lists
   - Use "Date (Newest First)" to see dated posts first

3. **Export Still Works**:
   - CSV/JSON exports include empty date field
   - You can manually add dates later if needed

---

#### 📥 Download Not Working

**Check These:**

**Browser Blocking Downloads:**
1. Check for a **download blocked** notification in browser
2. Click **Allow** or **Keep** when prompted
3. Check browser's download settings

**Pop-up Blocker:**
1. Disable pop-up blocker for this site
2. Or allow downloads in browser settings

**File Location:**
1. Check your **Downloads** folder
2. File name: `blog-posts-YYYY-MM-DD.csv` or `.json`
3. Sort by **Date Modified** to find recent downloads

**Large Files:**
- 100+ posts = large file
- May take a few seconds to generate
- Wait for download to complete

**Try Different Format:**
- If CSV fails, try JSON
- If JSON fails, try CSV
- One may work better for large datasets

---

#### 🔄 "Port 3000 is in use" Error

**What This Means:**
- Another app is using port 3000
- Or a previous dev server is still running

**Solutions:**

**Option 1: Kill the Process**
```bash
# Find the process
lsof -i :3000

# Kill it (replace PID with actual number)
kill -9 PID
```

**Option 2: Use a Different Port**
```bash
# Vite will automatically try port 3001, 3002, etc.
npm run dev
# Look for: "Local: http://localhost:3001/"
```

**Option 3: Use Process Manager Script**
```bash
./scripts/process-manager.sh stop
npm run dev
```

---

#### 🌐 Deployment Issues

**GitHub Pages Shows 404:**

**Problem**: Site deployed but shows "There isn't a GitHub Pages site here"

**Solution**:
1. Go to: `https://github.com/YOUR-USERNAME/Blog-Scraper-AI/settings/pages`
2. Under **"Build and deployment"**:
   - Source: Select **"GitHub Actions"** (NOT "Deploy from a branch")
3. Click **Save**
4. Wait 2-3 minutes for deployment
5. Visit: `https://YOUR-USERNAME.github.io/Blog-Scraper-AI`

**Vercel Deployment Fails:**

**Problem**: "Project not found" or authentication errors

**Solution**:
```bash
# Re-authenticate
vercel login

# Deploy again
./quick-deploy.sh vercel

# When asked "Link to existing project?":
# - Choose "No" if first time
# - Choose "Yes" if project exists
```

**Build Fails:**

**Problem**: Errors during `npm run build`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

#### 🖥️ Browser Compatibility

**Recommended Browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Known Issues:**
- ❌ Internet Explorer (not supported)
- ⚠️ Older browsers may have issues with modern JavaScript

**If App Doesn't Load:**
1. Update your browser to the latest version
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try in incognito/private mode
4. Try a different browser

---

#### 💾 Memory Issues (Browser Crashes)

**Symptoms:**
- Browser becomes slow
- Tab crashes
- "Out of memory" errors

**Causes:**
- Fetching too many posts (500+)
- Very long post content
- Browser has limited RAM

**Solutions:**

**Reduce Post Limit:**
```
Instead of: 500 posts
Try: 50-100 posts at a time
```

**Fetch in Batches:**
```
1. Fetch posts 1-100
2. Download CSV
3. Refresh page
4. Fetch posts 101-200
5. Download CSV
6. Combine CSV files later
```

**Close Other Tabs:**
- Free up browser memory
- Close unused tabs and windows

**Use a Different Browser:**
- Chrome: Good for large datasets
- Firefox: Better memory management
- Try both to see which works better

---

### Still Having Issues?

**Get Help:**

1. **Check Existing Issues**:
   - Visit: https://github.com/swipswaps/Blog-Scraper-AI/issues
   - Search for your problem
   - See if others have found solutions

2. **Open a New Issue**:
   - Click "New Issue"
   - Provide:
     - Blog URL you're trying to scrape
     - Error message (exact text)
     - Browser and version
     - Steps to reproduce
     - Screenshot if possible

3. **Include Debug Info**:
   - Press F12 → Console tab
   - Copy any error messages
   - Include in your issue report

**Quick Diagnostics:**
```bash
# Check your setup
node --version    # Should be v18+
npm --version     # Should be 8+

# Test build
npm run build     # Should complete without errors

# Check for updates
git pull origin main
npm install
```

## 🌐 Deployment

### 🚀 Automated Deployment (Easiest)

**Interactive deployment with guided setup:**
```bash
./deploy.sh
```

This script will:
- ✅ Check dependencies and install if needed
- ✅ Build your project automatically
- ✅ Show platform comparison
- ✅ Handle authentication
- ✅ Deploy to your chosen platform
- ✅ Open deployed site in browser

**One-command deployment (if you know which platform):**
```bash
./quick-deploy.sh vercel    # Deploy to Vercel
./quick-deploy.sh netlify   # Deploy to Netlify
./quick-deploy.sh github    # Deploy to GitHub Pages
```

See [SCRIPTS_GUIDE.md](SCRIPTS_GUIDE.md) for detailed script documentation.

---

### 📖 Manual Deployment

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel login
npm run build
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
- Already configured! Just push to `main` branch
- Enable GitHub Pages in repository settings
- Your site: `https://yourusername.github.io/Blog-Scraper-AI/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guides.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **GitHub Repository**: https://github.com/swipswaps/Blog-Scraper-AI
- **AI Studio App**: https://ai.studio/apps/drive/1189JMGs17tA_m6151_MmETPyKF7p6cbi

## 👨‍💻 Author

**swipswaps**

## 🙏 Acknowledgments

- Built with React and TypeScript
- Uses multiple CORS proxy services for reliability
- Optimized for GoDaddy Website Builder blogs
