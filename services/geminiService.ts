
import { GoogleGenAI, Type } from "@google/genai";
import { BlogPost, ProgressUpdate } from '../types';
import { fetchWithProxy } from './proxyService';

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
 * Uses Gemini AI to analyze an HTML string and extract blog post links and the next page link.
 */
async function getLinksAndNextPage(htmlContent: string, baseUrl: string): Promise<{ postUrls: string[]; nextPageUrl: string | null; }> {
    const prompt = `
You are an expert web scraper. Your task is to analyze the provided HTML from a website page and extract specific links.

Base URL for resolving relative URLs: ${baseUrl}

Instructions:
1.  **Find Blog Post Links:** Scrutinize the HTML to identify all hyperlinks (\`<a>\` tags) that lead to individual blog post articles. These are typically within main content areas like \`<article>\`, \`<div>\` with classes like "post", "entry", etc. Exclude links from navigation, sidebars, footers, ad sections, and social media links.
2.  **Find "Next Page" Link:** Locate the single hyperlink that paginates to the next set of posts. This link often contains text like "Next", "Older Posts", "»", or is a page number greater than the current one.
3.  **Format Output:** Return the data as a single, valid JSON object. Do not include any other text, explanations, or code formatting like \`\`\`json.

JSON Output Structure:
{
  "postUrls": ["<absolute_url_1>", "<absolute_url_2>", ...],
  "nextPageUrl": "<absolute_url_to_next_page>"
}

Important Rules:
- All URLs in the output SHOULD be absolute. Use the Base URL to resolve any relative paths (e.g., "/my-post").
- If no blog post links are found, return an empty \`postUrls\` array.
- If no "next page" link is found, the value for \`nextPageUrl\` must be \`null\`.
- Focus only on unique URLs for \`postUrls\`.

Here is the HTML content to analyze:
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `${prompt}\n\n${htmlContent}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        postUrls: {
                            type: Type.ARRAY,
                            description: "An array of absolute URLs for individual blog posts.",
                            items: { type: Type.STRING }
                        },
                        nextPageUrl: {
                            type: Type.STRING,
                            description: "The absolute URL for the next page of posts. Should be null if not found.",
                        }
                    },
                    required: ["postUrls"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Gemini returned an empty response for link extraction.");
        }
        const result = JSON.parse(jsonText);

        const postUrls = (result.postUrls || [])
            .map((url: string) => { try { return new URL(url, baseUrl).href; } catch { return null; }})
            .filter((url: string | null): url is string => url !== null);
        
        let nextPageUrl: string | null = null;
        if (result.nextPageUrl && typeof result.nextPageUrl === 'string' && result.nextPageUrl.toLowerCase() !== 'null') {
            try { nextPageUrl = new URL(result.nextPageUrl, baseUrl).href; } catch { nextPageUrl = null; }
        }
        
        return { postUrls: Array.from(new Set(postUrls)), nextPageUrl };

    } catch (e: any) {
        console.error("Error during AI link extraction:", e);
        throw new Error(`AI model failed to analyze the blog structure. Details: ${e.message}`);
    }
}

/**
 * Extracts the title and content from a single blog post's HTML.
 */
async function extractContentFromHtml(htmlContent: string): Promise<BlogPost> {
    const prompt = `
You are an expert content extractor. Your task is to analyze the HTML of a single blog post and extract its title and clean body content.

Instructions:
1.  **Extract Title:** Find the main title of the article. It's usually in an \`<h1>\` tag.
2.  **Extract Content:** Extract all the text from the main article body.
3.  **Clean Content:** Remove all HTML tags. Also, meticulously remove any surrounding content that is NOT part of the article itself, such as headers, navigation menus, sidebars, author bios, related post links, footers, and comment sections.
4.  **Preserve Formatting:** Maintain paragraph breaks (newlines) in the final content.
5.  **Format Output:** Return the data as a single, valid JSON object. Do not include any other text or explanations.

JSON Output Structure:
{
  "title": "<The_Extracted_Title>",
  "content": "<The_Cleaned_Article_Content>"
}

Here is the HTML of the blog post to analyze:
`;

    const response = await ai.models.generateContent({
        model,
        contents: `${prompt}\n\n${htmlContent}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The main title of the blog post." },
                    content: { type: Type.STRING, description: "The full, cleaned text content of the post." }
                },
                required: ["title", "content"]
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        if (!jsonText) throw new Error("Gemini returned an empty response for content extraction.");
        const potentialPost = JSON.parse(jsonText);

        if (typeof potentialPost.title !== 'string' || !potentialPost.title.trim()) {
            throw new Error(`Gemini response is missing a valid 'title'.`);
        }
        if (typeof potentialPost.content !== 'string') {
            throw new Error(`Gemini response is missing 'content'.`);
        }
        return potentialPost as BlogPost;
    } catch (e: any) {
        throw new Error(`Failed to parse valid blog post from Gemini response. Error: ${e.message}`);
    }
}

/**
 * Uses Gemini to extract feed URLs (RSS, Atom, JSON) from an HTML <head> string.
 */
async function findFeedUrls(htmlContent: string, baseUrl: string): Promise<string[]> {
    const prompt = `
From the provided HTML <head> content, extract all syndication feed URLs (RSS, Atom, or JSON Feed).
Look for <link> tags with rel="alternate" and a type like "application/rss+xml", "application/atom+xml", or "application/json".
Base URL for resolving relative URLs is: ${baseUrl}

Return a single, valid JSON array of absolute URLs. If no feeds are found, return an empty array [].
Do not include any other text or explanations.

Example Output:
["https://example.com/feed.xml", "https://example.com/blog/f.json"]

HTML <head> content to analyze:
${htmlContent.substring(0, htmlContent.indexOf('</head>') + 7)}
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const jsonText = response.text.trim();
        if (!jsonText) return [];
        
        const urls = JSON.parse(jsonText);
        if (Array.isArray(urls)) {
            return urls
                .map((url: string) => { try { return new URL(url, baseUrl).href; } catch { return null; }})
                .filter((url: string | null): url is string => url !== null);
        }
    } catch (e) {
        console.warn("Could not parse feed URLs from AI response.", e);
    }
    return [];
}


/**
 * Uses Gemini to parse feed content (RSS, Atom, JSON) and extract all blog posts.
 */
async function extractPostsFromFeed(feedContent: string): Promise<BlogPost[]> {
    const prompt = `
You are an expert feed parser. Your task is to analyze the provided feed content (which could be RSS, Atom, or JSON Feed format) and extract all blog posts from it.

Instructions:
1.  Identify the format of the feed (it could be XML for RSS/Atom or JSON).
2.  For each item or entry in the feed, extract its title and its primary content/summary.
3.  Clean the content: Remove all HTML tags but ensure you preserve paragraph breaks (newlines) to maintain readability.
4.  Return the data as a single, valid JSON array of objects. Do not include any other text, explanations, or code formatting like \`\`\`json.

JSON Output Structure:
[
  {
    "title": "<Post Title>",
    "content": "<Cleaned Post Content>"
  },
  ...
]

Important Rules:
- If the feed is empty or contains no valid posts, you MUST return an empty array \`[]\`.
- Ensure the title and content are properly extracted and cleaned.

Here is the feed content to analyze:
`;

    const response = await ai.models.generateContent({
        model,
        contents: `${prompt}\n\n${feedContent}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "The title of the post." },
                        content: { type: Type.STRING, description: "The cleaned content of the post." }
                    },
                    required: ["title", "content"]
                }
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        if (!jsonText) return [];
        return JSON.parse(jsonText) as BlogPost[];
    } catch (e) {
        console.error("Failed to parse blog posts from feed content.", e);
        return [];
    }
}

/**
 * Scrapes by paginating through a blog and extracting post URLs from each page,
 * then scrapes each post individually. This is the fallback method.
 */
async function scrapeHtmlDirectly(initialHtml: string, url: string, options: ScrapeOptions): Promise<void> {
    const { limit, onProgress } = options;
    
    let currentPageUrl: string | null = url;
    let currentHtml = initialHtml;
    const allPostUrls = new Set<string>();
    let isFirstPage = true;

    onProgress({ type: 'status', message: `Analyzing blog structure...` });
    let pageCount = 1;
    while (currentPageUrl && (!limit || allPostUrls.size < limit)) {
        if (!isFirstPage) {
            onProgress({ type: 'status', message: `Fetching page ${pageCount}...` });
            currentHtml = await fetchWithProxy(currentPageUrl);
        }
        isFirstPage = false;

        onProgress({ type: 'status', message: `Analyzing page ${pageCount} for post links...` });
        const { postUrls, nextPageUrl } = await getLinksAndNextPage(currentHtml, currentPageUrl);

        if (postUrls.length === 0 && pageCount === 1 && !nextPageUrl) {
             break; // No posts found on single-page blog
        }

        for (const postUrl of postUrls) {
             if (!limit || allPostUrls.size < limit) {
                allPostUrls.add(postUrl);
             } else {
                break;
             }
        }
        
        currentPageUrl = nextPageUrl;
        pageCount++;
    }

    if (allPostUrls.size === 0) {
        onProgress({ type: 'status', message: 'No blog post links found. The URL might not be a blog index page or the structure is not recognized.' });
        return;
    }

    onProgress({ type: 'status', message: `Found ${allPostUrls.size} total posts. Starting content extraction...` });

    const urlsToProcess = Array.from(allPostUrls);
    for (let i = 0; i < urlsToProcess.length; i++) {
        const postUrl = urlsToProcess[i];
         if (limit && i >= limit) {
            onProgress({ type: 'status', message: `Reached scrape limit of ${limit} posts.` });
            break;
        }
        onProgress({ type: 'status', message: `Fetching post ${i + 1} of ${urlsToProcess.length}...`});
        const postHtml = await fetchWithProxy(postUrl);

        onProgress({ type: 'status', message: `Extracting content for post ${i + 1}...`});
        try {
            const post = await extractContentFromHtml(postHtml);
            onProgress({ type: 'post', data: post });
        } catch(e: any) {
            console.warn(`Skipping post due to extraction error: ${postUrl}`, e.message);
            onProgress({ type: 'status', message: `Warning: Could not extract content from a post, skipping.` });
        }
    }
}


/**
 * Main orchestrator for scraping blog posts.
 * It first attempts to find and parse a syndication feed (RSS, Atom, JSON).
 * If that fails or yields no content, it falls back to direct HTML scraping.
 */
export async function scrapeBlogPosts(url: string, options: ScrapeOptions): Promise<void> {
    const { onProgress, onComplete, onError } = options;

    try {
        // --- STRATEGY 1: FIND AND PARSE FEEDS (MORE RELIABLE FOR DYNAMIC SITES) ---
        onProgress({ type: 'status', message: 'Fetching main page to check for feeds...' });
        const initialHtml = await fetchWithProxy(url);
        const feedUrls = await findFeedUrls(initialHtml, url);

        if (feedUrls.length > 0) {
            onProgress({ type: 'status', message: `Found ${feedUrls.length} feed(s). Attempting to parse...` });
            for (const feedUrl of feedUrls) {
                try {
                    const feedContent = await fetchWithProxy(feedUrl);
                    const postsFromFeed = await extractPostsFromFeed(feedContent);
                    
                    if (postsFromFeed.length > 0) {
                        onProgress({ type: 'status', message: `Successfully extracted ${postsFromFeed.length} posts from feed.` });
                        let postsAdded = 0;
                        for (const post of postsFromFeed) {
                            if (options.limit && postsAdded >= options.limit) {
                                onProgress({ type: 'status', message: `Reached scrape limit of ${options.limit} posts.` });
                                break;
                            }
                            options.onProgress({ type: 'post', data: post });
                            postsAdded++;
                        }
                        onComplete();
                        return; // Success! We are done.
                    }
                } catch (e) {
                    console.warn(`Failed to process feed ${feedUrl}:`, e);
                }
            }
            onProgress({ type: 'status', message: 'Found feeds, but they were empty or failed. Falling back to direct HTML scraping.' });
        } else {
             onProgress({ type: 'status', message: 'No feeds found. Attempting direct HTML scraping.' });
        }
        
        // --- STRATEGY 2: FALLBACK TO DIRECT HTML SCRAPING ---
        await scrapeHtmlDirectly(initialHtml, url, options);
        onComplete();
    } catch (error) {
        console.error("Error scraping blog posts:", error);
        if (error instanceof Error) {
            onError(new Error(`Scraping failed: ${error.message}. Please check the URL and your network connection.`));
        } else {
            onError(new Error("An unknown error occurred while scraping the blog."));
        }
    }
}
