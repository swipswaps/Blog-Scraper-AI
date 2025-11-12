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
 * Fetches the raw HTML content of a URL using a fallback list of CORS proxies.
 * It intelligently handles different proxy responses and errors.
 *
 * @param url The original URL to fetch.
 * @param attempt The current attempt number (used for recursion).
 * @returns A promise that resolves with the HTML content as a string.
 * @throws An error if all proxies fail.
 */
export async function fetchWithProxy(url: string, attempt = 0): Promise<string> {
    if (attempt >= CORS_PROXIES.length) {
        throw new Error(`Failed to fetch HTML for ${url} after trying all available CORS proxies. The target site might be down or blocking all proxies.`);
    }

    const proxyUrl = CORS_PROXIES[attempt](url);
    
    try {
        const response = await fetch(proxyUrl, {
            headers: { 'Accept': 'text/html' }
        });

        if (!response.ok) {
            console.warn(`Proxy attempt ${attempt + 1} failed with status: ${response.status}. Trying next proxy...`);
            return await fetchWithProxy(url, attempt + 1);
        }

        const contentType = response.headers.get('content-type');
        // Some proxies might return a JSON error object instead of failing the request.
        if (contentType && contentType.includes('application/json')) {
             console.warn(`Proxy attempt ${attempt + 1} returned JSON instead of HTML. Trying next proxy...`);
             return await fetchWithProxy(url, attempt + 1);
        }

        return await response.text();

    } catch (e: any) {
        console.warn(`Proxy attempt ${attempt + 1} failed with a network error: ${e.message}. Trying next proxy...`);
        return await fetchWithProxy(url, attempt + 1);
    }
}