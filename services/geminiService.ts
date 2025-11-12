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
 * Fetches the raw HTML content of a URL.
 * NOTE: This can be blocked by CORS policy on some websites. A backend proxy is the
 * standard solution in a production environment.
 */
async function fetchHtmlContent(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (e: any) {
        throw new Error(`Failed to fetch HTML from ${url}. This might be a CORS issue or network problem. Error: ${e.message}`);
    }
}

// Helper function to extract links from an index page's HTML content
async function getLinksAndNextPage(htmlContent: string): Promise<{ postUrls: string[]; nextPageUrl: string | null; }> {
    const prompt = `From the provided HTML content, extract all URLs that lead to individual blog posts and the URL for the link to the next page of posts (often labeled "Older Posts" or "Next").
Return a single JSON object with two keys: "postUrls" and "nextPageUrl".
- "postUrls": An array of strings, where each string is a URL to a blog post. It can be relative (e.g., "/2024/01/post.html") or absolute.
- "nextPageUrl": A string containing the URL to the next page of posts. If there is no next page link, this value must be null.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    postUrls: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A list of URLs (relative or absolute) to individual blog posts."
                    },
                    nextPageUrl: {
                        type: Type.STRING,
                        nullable: true,
                        description: "The URL (relative or absolute) to the next page of posts, or null if not present."
                    }
                },
                required: ["postUrls", "nextPageUrl"]
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        if (!Array.isArray(parsed.postUrls)) {
            throw new Error("Response missing 'postUrls' array.");
        }
        return parsed as { postUrls: string[]; nextPageUrl: string | null; };
    } catch (e: any) {
        throw new Error(`Failed to parse link extraction response from Gemini. Error: ${e.message}`);
    }
}

// Helper function to extract content from a single post's HTML content
async function extractContentFromHtml(htmlContent: string): Promise<BlogPost> {
    const prompt = `From the provided HTML content of a blog post, extract the title and the main body content.
Return a single JSON object with two keys: "title" and "content".
- "title": The main heading or title of the blog post.
- "content": The full text content of the post body. Clean the text by removing all HTML tags, navigation elements, sidebars, footers, and comment sections. Preserve paragraph breaks.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
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
            const { postUrls, nextPageUrl } = await getLinksAndNextPage(indexHtml);

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
