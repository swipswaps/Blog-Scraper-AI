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

/**
 * Fetches the raw content of a URL using a fallback list of CORS proxies.
 * It intelligently handles different proxy responses and errors.
 *
 * @param url The original URL to fetch.
 * @param attempt The current attempt number (used for recursion).
 * @returns A promise that resolves with the content as a string.
 * @throws An error if all proxies fail.
 */
export async function fetchWithProxy(url: string, attempt = 0): Promise<string> {
    if (attempt >= CORS_PROXIES.length) {
        throw new Error(`Failed to fetch content for ${url} after trying all available CORS proxies. The target site might be down or blocking all proxies.`);
    }

    const proxyUrl = CORS_PROXIES[attempt](url);
    
    try {
        const response = await fetch(proxyUrl, {
            headers: { 
                // Use a generic Accept header to handle HTML, JSON, and XML feeds correctly.
                'Accept': 'application/json, application/rss+xml, application/xml, text/xml, text/html, */*' 
            }
        });

        if (!response.ok) {
            console.warn(`Proxy attempt ${attempt + 1} failed with status: ${response.status}. Trying next proxy...`);
            return await fetchWithProxy(url, attempt + 1);
        }
        
        const text = await response.text();

        // If the response body is empty, it's likely an issue with the proxy or target. Try the next one.
        if (!text) {
             console.warn(`Proxy attempt ${attempt + 1} for ${url} returned an empty response. Trying next proxy...`);
             return await fetchWithProxy(url, attempt + 1);
        }

        return text;

    } catch (e: any) {
        console.warn(`Proxy attempt ${attempt + 1} failed with a network error: ${e.message}. Trying next proxy...`);
        return await fetchWithProxy(url, attempt + 1);
    }
}