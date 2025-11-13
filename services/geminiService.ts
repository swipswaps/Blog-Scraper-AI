import { BlogPost, ProgressUpdate } from '../types';
import { fetchWithProxy } from './proxyService';

interface ScrapeOptions {
    limit?: number;
    onProgress: (update: ProgressUpdate) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

/**
 * Scrapes blog posts from a given URL by fetching the HTML and parsing it directly.
 * This method is designed for sites where content is embedded on the main page.
 *
 * @param baseUrl The URL of the blog to scrape.
 * @param options Callbacks for progress, completion, and errors, plus an optional post limit.
 */
export async function scrapeBlogPosts(baseUrl: string, options: ScrapeOptions): Promise<void> {
    const { onProgress, onComplete, onError, limit } = options;

    try {
        onProgress({ type: 'status', message: `Fetching HTML from ${baseUrl}...` });
        const html = await fetchWithProxy(baseUrl);

        onProgress({ type: 'status', message: 'Parsing HTML content...' });
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // This selector targets the content blocks used in the GoDaddy site builder.
        const postElements = doc.querySelectorAll('[data-ux="ContentBasic"]');
        
        if (postElements.length === 0) {
            onProgress({ type: 'status', message: 'Could not find any potential post content on the page. The site structure may not be supported.' });
            onComplete();
            return;
        }

        const posts: BlogPost[] = [];
        postElements.forEach(el => {
            const titleEl = el.querySelector('[data-ux="ContentHeading"]');
            const contentEl = el.querySelector('[data-ux="ContentText"]');

            if (titleEl && contentEl && titleEl.textContent && contentEl.textContent) {
                const title = titleEl.textContent.trim();
                // Use innerText to better preserve line breaks from the HTML structure.
                const content = (contentEl as HTMLElement).innerText.trim();
                
                // Basic validation to ensure we're not grabbing empty/irrelevant sections.
                if (title && content.length > 20) {
                    posts.push({ title, content });
                }
            }
        });

        const postsToProcess = limit ? posts.slice(0, limit) : posts;
        
        onProgress({ type: 'status', message: `Found ${posts.length} potential posts. Processing ${postsToProcess.length}...` });

        for (const post of postsToProcess) {
            onProgress({ type: 'post', data: post });
        }
        
        if (postsToProcess.length === 0) {
             onProgress({ type: 'status', message: 'Finished processing, but no valid blog posts were extracted.' });
        }

        onComplete();

    } catch (error: any) {
        console.error("An error occurred during HTML scraping:", error);
        onError(new Error(`Failed to scrape the website: ${error.message}`));
    }
}