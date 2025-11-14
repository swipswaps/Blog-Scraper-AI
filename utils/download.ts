/**
 * File download utilities with proper cleanup
 */

import { BlogPost } from '../types';

/**
 * Escapes a CSV field value
 */
function escapeCsvField(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return '';
  }
  let value = String(field);
  if (value.search(/("|,|\n)/g) >= 0) {
    value = value.replace(/"/g, '""');
    value = `"${value}"`;
  }
  return value;
}

/**
 * Converts an array of BlogPost objects into a CSV-formatted string
 */
export function convertToCsv(posts: BlogPost[]): string {
  const header = ['title', 'date', 'content'];
  const headerString = header.join(',');

  const rows = posts.map(post => {
    const title = escapeCsvField(post.title);
    const date = escapeCsvField(post.date || '');
    const content = escapeCsvField(post.content);
    return [title, date, content].join(',');
  });

  return [headerString, ...rows].join('\n');
}

/**
 * Downloads data as a file with proper cleanup
 */
export function downloadFile(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  
  // Revoke the blob URL after a short delay to ensure download starts
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 100);
}

/**
 * Downloads posts as CSV
 */
export function downloadPostsAsCsv(posts: BlogPost[], filename?: string): void {
  const csvData = convertToCsv(posts);
  const defaultFilename = filename || `blog-posts-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csvData, defaultFilename, 'text/csv;charset=utf-8;');
}

/**
 * Downloads posts as JSON
 */
export function downloadPostsAsJson(posts: BlogPost[], filename?: string): void {
  const jsonData = JSON.stringify(posts, null, 2);
  const defaultFilename = filename || `blog-posts-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(jsonData, defaultFilename, 'application/json');
}

