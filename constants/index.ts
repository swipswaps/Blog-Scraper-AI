/**
 * Application constants
 */

export const POSTS_PER_PAGE = 5;
export const MAX_POST_LIMIT = 1000;
export const SEARCH_DEBOUNCE_MS = 300;
export const DEFAULT_BLOG_URL = 'https://johnssolarblog.com/';
export const DEFAULT_POST_LIMIT = '10';

export const SORT_OPTIONS = {
  DEFAULT: 'default',
  TITLE_ASC: 'title-asc',
  TITLE_DESC: 'title-desc',
  LENGTH_ASC: 'length-asc',
  LENGTH_DESC: 'length-desc',
} as const;

export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid HTTP or HTTPS URL',
  EMPTY_URL: 'Please enter a URL',
  INVALID_LIMIT: 'Please enter a valid number',
  LIMIT_TOO_LOW: 'Limit must be at least 1',
  LIMIT_TOO_HIGH: `Limit cannot exceed ${MAX_POST_LIMIT} posts`,
  FETCH_FAILED: 'Failed to fetch posts. Please check the URL and try again.',
  NO_POSTS_FOUND: 'No blog posts found on this page.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
} as const;

