import { GoogleGenAI, Type } from "@google/genai";
import { BlogPost, ProgressUpdate } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

interface ScrapeOptions {
    limit?: number;
    onProgress: (update: ProgressUpdate) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

/**
 * Fetches the raw HTML content of a URL via a CORS proxy to avoid browser security restrictions.
 */
async function fetchHtmlContent(url: string): Promise<string> {
    // Use a CORS proxy to bypass browser security restrictions for fetching cross-origin content.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            // Try to fetch original error message from proxy if available
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Proxy response: ${errorText}`);
        }
        return await response.text();
    } catch (e: any) {
        throw new Error(`Failed to fetch HTML via proxy for ${url}. This could be a network issue or the proxy service might be down. Error: ${e.message}`);
    }
}


/**
 * Uses the browser's native DOM parser to quickly and reliably extract links from an HTML string.
 */
function getLinksAndNextPage(htmlContent: string): { postUrls: string[]; nextPageUrl: string | null; } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const postUrls = new Set<string>();
    let nextPageUrl: string | null = null;

    // Use a set of common selectors to find post links across different blog platforms.
    const postLinkSelectors = [
        'article h2 a',
        'article h3 a',
        '.post-title a',
        '.entry-title a',
        'h2.entry-title a',
        '.post-header h3 a', // Common in Blogger
    ];
    
    doc.querySelectorAll(postLinkSelectors.join(', ')).forEach(el => {
        const link = el as HTMLAnchorElement;
        // Ensure we have a valid, absolute URL
        if (link.href) {
            postUrls.add(link.href);
        }
    });

    // Use common texts to find the "next page" link.
    const nextPageTexts = ['older posts', 'next page', 'next ›', '»'];
    doc.querySelectorAll('a').forEach(el => {
        const linkText = el.textContent?.trim().toLowerCase();
        if (linkText && nextPageTexts.includes(linkText)) {
            nextPageUrl = (el as HTMLAnchorElement).href;
        }
    });

    return { postUrls: Array.from(postUrls), nextPageUrl };
}


// Helper function to extract content from a single post's HTML content
async function extractContentFromHtml(htmlContent: string): Promise<BlogPost> {
    const prompt = `From the provided HTML content of a blog post, extract the title and the main body content.
Return a single JSON object with two keys: "title" and "content".
- "title": The main heading or title of the blog post.
- "content": The full text content of the post body. Clean the text by removing all HTML tags, navigation elements, sidebars, footers, and comment sections. Preserve paragraph breaks.`;

    const response = await ai.models.generateContent({
        model,
        contents: [{ text: prompt }, { text: htmlContent }], // Pass HTML as separate part
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { 
                        type: Type.STRING,
                        description: "The main title of the blog post."
                    },
                    content: { 
                        type: Type.STRING,
                        description: "The full, cleaned text content of the post."
                    }
                },
                required: ["title", "content"]
            }
        }
    });

    let potentialPost: any;
    try {
        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Gemini returned an empty response for content extraction.");
        }
        potentialPost = JSON.parse(jsonText);
    } catch (e: any) {
        throw new Error(`Failed to parse JSON response from Gemini. Error: ${e.message}`);
    }

    if (typeof potentialPost.title !== 'string' || !potentialPost.title.trim()) {
         throw new Error(`Gemini response is missing a valid 'title'. Response: ${JSON.stringify(potentialPost)}`);
    }
    if (typeof potentialPost.content !== 'string') {
        throw new Error(`Gemini response is missing 'content'. Response: ${JSON.stringify(potentialPost)}`);
    }
    
    return potentialPost as BlogPost;
}


export async function scrapeBlogPosts(url: string, options: ScrapeOptions): Promise<void> {
    const { limit, onProgress, onComplete, onError } = options;
    
    let currentPageUrl: string | null = url;
    const allPostUrls = new Set<string>();

    try {
        onProgress({ type: 'status', message: `Analyzing blog structure...` });
        let pageCount = 1;
        while (currentPageUrl && (!limit || allPostUrls.size < limit)) {
            onProgress({ type: 'status', message: `Fetching page ${pageCount}...` });
            const indexHtml = await fetchHtmlContent(currentPageUrl);

            onProgress({ type: 'status', message: `Analyzing page ${pageCount} for post links...` });
            const { postUrls, nextPageUrl } = getLinksAndNextPage(indexHtml);

            // Resolve URLs to be absolute
            const absolutePostUrls = postUrls.map(postUrl => new URL(postUrl, currentPageUrl!).href);

            for (const postUrl of absolutePostUrls) {
                 if (!limit || allPostUrls.size < limit) {
                    allPostUrls.add(postUrl);
                 } else {
                    break;
                 }
            }
            currentPageUrl = nextPageUrl ? new URL(nextPageUrl, currentPageUrl).href : null;
            pageCount++;
        }

        if (allPostUrls.size === 0) {
            onProgress({ type: 'status', message: `No blog post links found on the provided URL.` });
            onComplete();
            return;
        }

        onProgress({ type: 'status', message: `Found ${allPostUrls.size} total posts. Starting content extraction...` });

        const urlsToProcess = Array.from(allPostUrls);
        for (let i = 0; i < urlsToProcess.length; i++) {
            const postUrl = urlsToProcess[i];
            onProgress({ type: 'status', message: `Fetching post ${i + 1} of ${urlsToProcess.length}...`});
            const postHtml = await fetchHtmlContent(postUrl);

            onProgress({ type: 'status', message: `Extracting post ${i + 1} of ${urlsToProcess.length}...`});
            try {
                const post = await extractContentFromHtml(postHtml);
                onProgress({ type: 'post', data: post });
            } catch(e: any) {
                console.warn(`Skipping post due to extraction error: ${postUrl}`, e.message);
                onProgress({ type: 'status', message: `Warning: Could not extract content from a post, skipping.` });
            }
        }

        onProgress({ type: 'status', message: `Scraping complete! Found ${allPostUrls.size} posts.` });
        onComplete();

    } catch (error) {
        console.error("Error scraping blog posts:", error);
        if (error instanceof Error) {
            onError(new Error(`Scraping failed. Error: ${error.message}`));
        } else {
            onError(new Error("An unknown error occurred while scraping the blog."));
        }
    }
}