/**
 * A dedicated service for fetching content through a list of CORS proxies.
 * This service is designed to be resilient, trying multiple proxies and handling
 * common failure patterns gracefully.
 */

// List of public CORS proxies. They are functions to allow for different URL structures.
// More proxies are added for better resilience. They are ordered by perceived reliability.
const CORS_PROXIES = [
    // URL is just appended
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
    // URL is just appended
    (url: string) => `https://cors.eu.org/${url}`,
    // URL is a query param, so it needs encoding
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // URL is a query param, so it needs encoding
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

const FETCH_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES_PER_PROXY = 2;

/**
 * Fetches with timeout support
 */
async function fetchWithTimeout(url: string, timeoutMs: number, headers?: HeadersInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetches the raw content of a URL using a fallback list of CORS proxies.
 * It intelligently handles different proxy responses and errors.
 *
 * @param url The original URL to fetch.
 * @param attempt The current attempt number (used for recursion).
 * @param retryCount Number of retries for current proxy.
 * @returns A promise that resolves with the content as a string.
 * @throws An error if all proxies fail.
 */
export async function fetchWithProxy(
    url: string,
    attempt = 0,
    retryCount = 0
): Promise<string> {
    if (attempt >= CORS_PROXIES.length) {
        throw new Error(
            `Failed to fetch content from ${url} after trying all available CORS proxies. ` +
            `The target site might be down, blocking requests, or the URL might be incorrect.`
        );
    }

    const proxyUrl = CORS_PROXIES[attempt](url);

    try {
        const response = await fetchWithTimeout(proxyUrl, FETCH_TIMEOUT_MS, {
            'Accept': 'application/json, application/rss+xml, application/xml, text/xml, text/html, */*',
            'User-Agent': 'Mozilla/5.0 (compatible; BlogScraper/1.0)',
        });

        if (!response.ok) {
            const statusText = `${response.status} ${response.statusText}`;
            console.warn(`Proxy ${attempt + 1}/${CORS_PROXIES.length} failed with status: ${statusText}`);

            // Retry on server errors (5xx) but not client errors (4xx)
            if (response.status >= 500 && retryCount < MAX_RETRIES_PER_PROXY) {
                console.warn(`Retrying proxy ${attempt + 1} (attempt ${retryCount + 1}/${MAX_RETRIES_PER_PROXY})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return await fetchWithProxy(url, attempt, retryCount + 1);
            }

            return await fetchWithProxy(url, attempt + 1, 0);
        }

        const text = await response.text();

        // If the response body is empty, it's likely an issue with the proxy or target. Try the next one.
        if (!text || text.trim().length === 0) {
             console.warn(`Proxy ${attempt + 1}/${CORS_PROXIES.length} returned empty response`);
             return await fetchWithProxy(url, attempt + 1, 0);
        }

        return text;

    } catch (e: any) {
        const errorMsg = e.name === 'AbortError' ? 'Request timeout' : e.message;
        console.warn(`Proxy ${attempt + 1}/${CORS_PROXIES.length} failed: ${errorMsg}`);

        // Retry on network errors
        if (retryCount < MAX_RETRIES_PER_PROXY && e.name !== 'AbortError') {
            console.warn(`Retrying proxy ${attempt + 1} (attempt ${retryCount + 1}/${MAX_RETRIES_PER_PROXY})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return await fetchWithProxy(url, attempt, retryCount + 1);
        }

        return await fetchWithProxy(url, attempt + 1, 0);
    }
}