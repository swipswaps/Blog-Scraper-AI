import { BlogPost, ProgressUpdate } from '../types';
import { fetchWithProxy } from './proxyService';

interface ScrapeOptions {
    limit?: number;
    onProgress: (update: ProgressUpdate) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

/**
 * Strips HTML tags from a string to return plain text.
 * @param html The HTML string to clean.
 * @returns The plain text content.
 */
function stripHtml(html: string): string {
    // Use the browser's DOMParser to safely convert HTML to text
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

/**
 * Parses a JSON feed string and extracts blog posts.
 * Assumes the GoDaddy/JSONFeed structure.
 */
// FIX: The function was incorrectly typed to return Omit<BlogPost, 'content'>[] but it returns a full BlogPost object with HTML content. Corrected to BlogPost[].
function parseJsonFeed(jsonString: string): BlogPost[] {
    try {
        const feed = JSON.parse(jsonString);
        if (!feed.items || !Array.isArray(feed.items)) {
            return [];
        }
        return feed.items.map((item: any) => ({
            title: item.title || 'Untitled',
            // The content is expected to be HTML
            content: item.content_html || item.summary || ''
        }));
    } catch (e) {
        console.error("Failed to parse JSON feed:", e);
        return [];
    }
}

/**
 * Parses an RSS/Atom (XML) feed string and extracts blog posts.
 */
// FIX: The function was incorrectly typed to return Omit<BlogPost, 'content'>[] but it returns a full BlogPost object with HTML content. Corrected to BlogPost[].
function parseXmlFeed(xmlString: string): BlogPost[] {
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
            // Look for full content first, then fall back to summary/description
            const content = item.querySelector("content, content\\:encoded, description")?.textContent || '';
            return { title, content };
        });

    } catch (e) {
        console.error("Failed to parse XML feed:", e);
        return [];
    }
}

/**
 * Scrapes all blog posts from a given URL by finding and parsing its JSON or RSS feed.
 * This is a "fast path" that avoids AI and direct HTML scraping.
 *
 * @param baseUrl The URL of the blog to scrape.
 * @param options Callbacks for progress, completion, and errors, plus an optional post limit.
 */
export async function scrapeBlogPosts(baseUrl: string, options: ScrapeOptions): Promise<void> {
    const { onProgress, onComplete, onError, limit } = options;

    try {
        // FIX: The posts array should be of type BlogPost[] to match the return type of the parsing functions.
        let posts: BlogPost[] = [];
        let feedType = '';

        // 1. Try to fetch the JSON feed (f.json) - this is common for GoDaddy blogs
        try {
            onProgress({ type: 'status', message: 'Attempting to find JSON feed (f.json)...' });
            const jsonFeedUrl = new URL('f.json', baseUrl).href;
            const jsonString = await fetchWithProxy(jsonFeedUrl);
            posts = parseJsonFeed(jsonString);
            if (posts.length > 0) {
                feedType = 'JSON';
            }
        } catch (e) {
            console.warn("JSON feed (f.json) not found or failed to parse. Trying RSS next.", e);
        }

        // 2. If JSON feed fails or is empty, try the RSS feed (f.rss)
        if (posts.length === 0) {
            try {
                onProgress({ type: 'status', message: 'JSON feed not found. Trying RSS feed (f.rss)...' });
                const rssFeedUrl = new URL('f.rss', baseUrl).href;
                const xmlString = await fetchWithProxy(rssFeedUrl);
                posts = parseXmlFeed(xmlString);
                if (posts.length > 0) {
                    feedType = 'RSS';
                }
            } catch (e) {
                 console.warn("RSS feed (f.rss) also not found or failed to parse.", e);
            }
        }

        if (posts.length === 0) {
            onProgress({ type: 'status', message: 'No compatible JSON or RSS feed found. This site may not be supported by the direct scraper.' });
            onComplete();
            return;
        }

        onProgress({ type: 'status', message: `Successfully parsed ${feedType} feed. Found ${posts.length} posts.` });

        const postsToProcess = limit ? posts.slice(0, limit) : posts;
        
        for (const post of postsToProcess) {
            const cleanContent = stripHtml(post.content);
            const finalPost: BlogPost = { title: post.title, content: cleanContent };
            onProgress({ type: 'post', data: finalPost });
        }
        
        onComplete();

    } catch (error: any) {
        console.error("Error scraping blog posts:", error);
        onError(error);
    }
}