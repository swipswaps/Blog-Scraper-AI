/**
 * URL validation and sanitization utilities
 */

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }

  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL by removing trailing slashes and ensuring protocol
 */
export function normalizeUrl(urlString: string): string {
  let url = urlString.trim();
  
  // Add https:// if no protocol specified
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  return url;
}

/**
 * Validates and normalizes a URL, returning error message if invalid
 */
export function validateAndNormalizeUrl(urlString: string): { valid: boolean; url: string; error?: string } {
  if (!urlString || !urlString.trim()) {
    return { valid: false, url: '', error: 'Please enter a URL' };
  }

  const normalized = normalizeUrl(urlString);
  
  if (!isValidUrl(normalized)) {
    return { valid: false, url: normalized, error: 'Please enter a valid HTTP or HTTPS URL' };
  }

  return { valid: true, url: normalized };
}

/**
 * Validates post limit input
 */
export function validatePostLimit(limitString: string): { valid: boolean; limit?: number; error?: string } {
  if (!limitString || limitString.trim() === '') {
    return { valid: true }; // Empty is valid (means no limit)
  }

  const limit = parseInt(limitString, 10);
  
  if (isNaN(limit)) {
    return { valid: false, error: 'Please enter a valid number' };
  }

  if (limit < 1) {
    return { valid: false, error: 'Limit must be at least 1' };
  }

  if (limit > 1000) {
    return { valid: false, error: 'Limit cannot exceed 1000 posts' };
  }

  return { valid: true, limit };
}

