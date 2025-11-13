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
- **📊 Export Options**: Download posts as CSV or JSON files
- **🔎 Search & Filter**: Search posts by title or content
- **📑 Sorting**: Sort posts by title or content length
- **📖 Pagination**: View posts 5 at a time with accordion-style expansion
- **⚡ Real-time Progress**: Live status updates during scraping process

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

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn**

## 🛠️ Installation

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

## 📖 User Guide

### Basic Usage

1. **Enter Blog URL**:
   - Paste the blog homepage URL (e.g., `https://johnssolarblog.com/`)
   - The app will automatically detect the JSON feed if available

2. **Set Post Limit** (Optional):
   - Enter the maximum number of posts to fetch
   - Leave empty to fetch all available posts

3. **Click "Fetch Posts"**:
   - Watch real-time progress as posts are discovered and fetched
   - Each post's content is extracted individually

4. **Browse Results**:
   - Posts appear in an accordion list (5 per page)
   - Click on a post to expand and read full content
   - Use pagination controls to navigate through posts

5. **Search & Filter**:
   - Use the search box to filter posts by title or content
   - Results update in real-time as you type

6. **Sort Posts**:
   - Sort by title (A-Z or Z-A)
   - Sort by content length (shortest to longest or vice versa)

7. **Export Data**:
   - **Download CSV**: Get a spreadsheet-compatible file
   - **Download JSON**: Get structured data for further processing

### Example Workflow

```
1. Enter URL: https://johnssolarblog.com/
2. Set limit: 10
3. Click "Fetch Posts"
4. Wait for scraping to complete (progress shown)
5. Search for "solar panels"
6. Sort by "Title (A-Z)"
7. Click "Download CSV" to export results
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
interface Post {
  title: string;      // Post title
  content: string;    // Full post content (plain text)
}
```

**Export Formats**:
- **CSV**: `title,content` with proper escaping
- **JSON**: Array of post objects

## 🎯 Use Cases

- **Content Migration**: Export blog posts for migration to another platform
- **Content Analysis**: Analyze blog content, word counts, topics
- **Backup**: Create backups of blog content
- **Research**: Collect and analyze blog posts for research purposes
- **SEO Analysis**: Export content for SEO tools and analysis

## 🐛 Troubleshooting

### "Failed to fetch posts"
- Check if the blog URL is correct and accessible
- Verify the blog has a JSON feed at `/f.json`
- Try a different CORS proxy (automatic fallback should handle this)

### "Content not available"
- The blog structure may not be supported
- Try a GoDaddy Website Builder blog for best results

### Slow Performance
- Reduce the post limit to fetch fewer posts
- The app fetches each post individually for full content (intentional for accuracy)

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
