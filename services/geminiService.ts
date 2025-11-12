
import { BlogPost, ProgressUpdate } from '../types';
import { fetchWithProxy } from './proxyService';

interface PostInfo {
    title: string;
    url: string;
}

interface ScrapeOptions {
    limit?: number;
    onProgress: (update: ProgressUpdate) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

/**
 * Extracts the main article content from a full HTML page string.
 * It intelligently finds the main content container, removes clutter,
 * and converts the result to formatted plain text.
 * @param html The full HTML string of a blog post page.
 * @returns The cleaned, readable plain text of the article.
 */
function extractArticleContent(html: string): string {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Remove elements that are almost always not part of the main content.
    // This is now more aggressive and specific to the target site's structure.
    doc.querySelectorAll(
      'script, style, link, meta, noscript, header, footer, nav, aside, ' +
      '.widget-header, .widget-footer, .widget-social, .widget-contact, ' + // Specific to GoDaddy builder
      '.comments, #comments, .sidebar, #sidebar, .social-links, ' +
      '.post-meta, form, .related-posts, #related-posts, [data-aid="FOOTER_POWERED_BY_AIRO_RENDERED"]'
    ).forEach(el => el.remove());


    // 2. Find the most likely container for the main article content.
    // Added '.widget-content' as a high-priority selector.
    const selectors = ['.widget-content', 'article', '.post-body', '.post-content', '#main-content', '[role="article"]', '#content', 'main', '.entry-content'];
    let mainContent: HTMLElement | null = null;
    for (const selector of selectors) {
        mainContent = doc.querySelector(selector);
        if (mainContent) break;
    }

    const container = mainContent || doc.body;

    // 3. To preserve formatting, append markers to block-level elements before getting text content.
    container.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre, tr').forEach(el => {
        el.append('__P__'); // Paragraph break marker
    });
    container.querySelectorAll('br, hr').forEach(el => {
        el.replaceWith(document.createTextNode('__P__'));
    });

    // 4. Get the text content, which now includes our markers.
    let text = container.textContent || '';

    // 5. Replace markers with newlines and clean up whitespace for final output.
    // Also includes a failsafe to remove any lingering boilerplate text.
    return text
        .replace(/Welcome to\s+John's Solar Blog!/g, '') // Failsafe removal
        .replace(/__P__/g, '\n')      // Replace markers with newlines
        .replace(/[ \t]+/g, ' ')       // Collapse consecutive spaces and tabs
        .replace(/ \n/g, '\n')         // Remove spaces before newlines
        .replace(/\n /g, '\n')         // Remove spaces after newlines
        .replace(/(\n){3,}/g, '\n\n')  // Collapse 3+ newlines into two
        .trim();
}


/**
 * Parses a JSON feed string and extracts post titles and URLs.
 */
function parseJsonFeed(jsonString: string): PostInfo[] {
    try {
        const feed = JSON.parse(jsonString);
        if (!feed.items || !Array.isArray(feed.items)) {
            return [];
        }
        return feed.items.map((item: any) => ({
            title: item.title || 'Untitled',
            url: item.url || item.id || ''
        })).filter(post => post.url); // Ensure we have a URL to fetch
    } catch (e) {
        console.error("Failed to parse JSON feed:", e);
        return [];
    }
}

/**
 * Parses an RSS/Atom (XML) feed string and extracts post titles and URLs.
 */
function parseXmlFeed(xmlString: string): PostInfo[] {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, "application/xml");
        const errorNode = doc.querySelector("parsererror");
        if (errorNode) {
            console.error("Failed to parse XML feed:", errorNode.textContent);
            return [];
        }

        const items = Array.from(doc.querySelectorAll("item, entry"));
        return items.map(item => {
            const title = item.querySelector("title")?.textContent || 'Untitled';
            const linkEl = item.querySelector("link");
            const url = linkEl?.getAttribute('href') || linkEl?.textContent || '';
            return { title, url };
        }).filter(post => post.url); // Ensure we have a URL to fetch

    } catch (e) {
        console.error("Failed to parse XML feed:", e);
        return [];
    }
}

/**
 * Scrapes all blog posts from a given URL using a two-phase, code-based approach.
 * Phase 1: Discover post URLs from feeds.
 * Phase 2: Fetch each post page and extract its full content.
 *
 * @param baseUrl The URL of the blog to scrape.
 * @param options Callbacks for progress, completion, and errors, plus an optional post limit.
 */
export async function scrapeBlogPosts(baseUrl: string, options: ScrapeOptions): Promise<void> {
    const { onProgress, onComplete, onError, limit } = options;

    try {
        let postInfos: PostInfo[] = [];
        let feedType = '';

        // Phase 1: Link Discovery
        // Try to fetch the JSON feed first.
        try {
            onProgress({ type: 'status', message: 'Attempting to find JSON feed (f.json)...' });
            const jsonFeedUrl = new URL('f.json', baseUrl).href;
            const jsonString = await fetchWithProxy(jsonFeedUrl);
            postInfos = parseJsonFeed(jsonString);
            if (postInfos.length > 0) {
                feedType = 'JSON';
            }
        } catch (e) {
            console.warn("JSON feed (f.json) not found or failed. Trying RSS next.", e);
        }

        // If JSON fails or is empty, try the RSS feed.
        if (postInfos.length === 0) {
            try {
                onProgress({ type: 'status', message: 'JSON feed not found. Trying RSS feed (f.rss)...' });
                const rssFeedUrl = new URL('f.rss', baseUrl).href;
                const xmlString = await fetchWithProxy(rssFeedUrl);
                postInfos = parseXmlFeed(xmlString);
                if (postInfos.length > 0) {
                    feedType = 'RSS';
                }
            } catch (e) {
                 console.warn("RSS feed (f.rss) also not found or failed.", e);
            }
        }

        if (postInfos.length === 0) {
            onProgress({ type: 'status', message: 'No compatible JSON or RSS feed found. This site may not be supported.' });
            onComplete();
            return;
        }

        onProgress({ type: 'status', message: `Successfully parsed ${feedType} feed. Found ${postInfos.length} posts.` });

        const postsToProcess = limit ? postInfos.slice(0, limit) : postInfos;
        
        // Phase 2: Full Content Extraction
        for (const postInfo of postsToProcess) {
             if (!postInfo.url) {
                console.warn(`Skipping post with no URL: "${postInfo.title}"`);
                continue;
            }
            try {
                onProgress({ type: 'status', message: `Fetching content for: "${postInfo.title}"...` });
                const postHtml = await fetchWithProxy(postInfo.url);
                
                const cleanContent = extractArticleContent(postHtml);
                
                const finalPost: BlogPost = { title: postInfo.title, content: cleanContent };
                onProgress({ type: 'post', data: finalPost });
            } catch(e) {
                console.error(`Failed to process post: "${postInfo.title}" (${postInfo.url})`, e);
                onProgress({ type: 'status', message: `Skipping post due to error: "${postInfo.title}"` });
            }
        }
        
        onComplete();

    } catch (error: any) {
        console.error("Error scraping blog posts:", error);
        onError(error);
    }
}
