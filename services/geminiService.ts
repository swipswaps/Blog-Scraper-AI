import { BlogPost, ProgressUpdate } from '../types';
import { fetchWithProxy } from './proxyService';

interface ScrapeOptions {
    limit?: number;
    onProgress: (update: ProgressUpdate) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

interface JSONFeedItem {
    id: string;
    title: string;
    url: string;
    html_content?: string;
    date_modified?: string;
}

interface JSONFeed {
    version: string;
    title: string;
    items: JSONFeedItem[];
}

/**
 * Extracts text content from HTML string, preserving line breaks and structure.
 */
function extractTextFromHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get the text content, which preserves some structure
    const text = doc.body.innerText || doc.body.textContent || '';
    return text.trim();
}

/**
 * Scrapes blog posts from a given URL by first checking for JSON feeds,
 * then fetching individual post content from their URLs.
 *
 * @param baseUrl The URL of the blog to scrape.
 * @param options Callbacks for progress, completion, and errors, plus an optional post limit.
 */
export async function scrapeBlogPosts(baseUrl: string, options: ScrapeOptions): Promise<void> {
    const { onProgress, onComplete, onError, limit } = options;

    try {
        // Normalize the base URL
        const normalizedUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        // Try to fetch JSON feed first (common for GoDaddy sites)
        onProgress({ type: 'status', message: 'Looking for blog feed...' });

        let feedUrl = `${normalizedUrl}/f.json`;
        let feedData: JSONFeed | null = null;

        try {
            const feedResponse = await fetchWithProxy(feedUrl);
            feedData = JSON.parse(feedResponse) as JSONFeed;
            onProgress({ type: 'status', message: `Found JSON feed with ${feedData.items.length} posts` });
        } catch (e) {
            // JSON feed not found, try RSS
            onProgress({ type: 'status', message: 'JSON feed not found, trying RSS feed...' });
            try {
                feedUrl = `${normalizedUrl}/f.rss`;
                const rssResponse = await fetchWithProxy(feedUrl);
                // Parse RSS (simplified - would need proper XML parsing for production)
                onProgress({ type: 'status', message: 'RSS feed found but not yet supported. Falling back to HTML scraping...' });
            } catch (rssError) {
                onProgress({ type: 'status', message: 'No feed found. Falling back to HTML scraping...' });
            }
        }

        if (feedData && feedData.items && feedData.items.length > 0) {
            // Process JSON feed
            const itemsToProcess = limit ? feedData.items.slice(0, limit) : feedData.items;

            onProgress({ type: 'status', message: `Processing ${itemsToProcess.length} posts...` });

            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < itemsToProcess.length; i++) {
                const item = itemsToProcess[i];
                const progress = Math.round(((i + 1) / itemsToProcess.length) * 100);

                onProgress({
                    type: 'status',
                    message: `Fetching post ${i + 1}/${itemsToProcess.length} (${progress}%): ${item.title}`
                });

                try {
                    // Fetch the full post content from its URL
                    const postHtml = await fetchWithProxy(item.url);

                    let contentText = '';

                    // Try to extract content from window._BLOG_DATA (GoDaddy blog structure)
                    const blogDataMatch = postHtml.match(/window\._BLOG_DATA\s*=\s*({[\s\S]*?});/);
                    if (blogDataMatch) {
                        try {
                            const blogData = JSON.parse(blogDataMatch[1]);
                            if (blogData.post && blogData.post.fullContent) {
                                // Parse the Draft.js content format
                                const draftContent = JSON.parse(blogData.post.fullContent);
                                if (draftContent.blocks && Array.isArray(draftContent.blocks)) {
                                    // Extract text from all blocks
                                    const textBlocks = draftContent.blocks
                                        .map((block: any) => block.text || '')
                                        .filter((text: string) => text.trim().length > 0);
                                    contentText = textBlocks.join('\n\n');
                                }
                            }
                        } catch (jsonError) {
                            console.warn(`Failed to parse blog data JSON for "${item.title}"`);
                        }
                    }

                    // If we didn't get content from _BLOG_DATA, try DOM parsing
                    if (!contentText || contentText.length < 50) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(postHtml, 'text/html');

                        // Look for blog post content containers
                        const contentSelectors = [
                            '[data-ux="BlogPostContent"]',
                            '[data-ux="ContentText"]',
                            'article',
                            '.blog-post-content',
                            'main'
                        ];

                        for (const selector of contentSelectors) {
                            const contentEl = doc.querySelector(selector);
                            if (contentEl) {
                                contentText = (contentEl as HTMLElement).innerText.trim();
                                if (contentText.length > 100) {
                                    break;
                                }
                            }
                        }
                    }

                    // Clean up the content
                    if (contentText) {
                        contentText = contentText
                            .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
                            .trim();
                    }

                    if (contentText && contentText.length > 20) {
                        onProgress({
                            type: 'post',
                            data: {
                                title: item.title,
                                content: contentText
                            }
                        });
                        successCount++;
                    } else {
                        // Fallback to HTML content from feed if available
                        if (item.html_content) {
                            const fallbackContent = extractTextFromHTML(item.html_content);
                            onProgress({
                                type: 'post',
                                data: {
                                    title: item.title,
                                    content: fallbackContent || 'Content not available'
                                }
                            });
                            successCount++;
                        } else {
                            failCount++;
                            console.warn(`No content available for post: ${item.title}`);
                        }
                    }

                    // Small delay to avoid overwhelming the server
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (postError: any) {
                    failCount++;
                    console.warn(`Failed to fetch post "${item.title}":`, postError.message);
                    // Use excerpt from feed as fallback
                    if (item.html_content) {
                        const fallbackContent = extractTextFromHTML(item.html_content);
                        onProgress({
                            type: 'post',
                            data: {
                                title: item.title,
                                content: fallbackContent || 'Content not available'
                            }
                        });
                        successCount++;
                        failCount--;
                    }
                }
            }

            // Report completion stats
            if (failCount > 0) {
                onProgress({
                    type: 'status',
                    message: `Completed: ${successCount} posts fetched successfully, ${failCount} failed`
                });
            } else {
                onProgress({
                    type: 'status',
                    message: `Successfully fetched all ${successCount} posts`
                });
            }

            onComplete();
            return;
        }

        // Fallback: HTML scraping (original method)
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
        console.error("An error occurred during scraping:", error);
        onError(new Error(`Failed to scrape the website: ${error.message}`));
    }
}