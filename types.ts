
export interface BlogPost {
  title: string;
  content: string;
  date?: string; // ISO 8601 date string from feed (e.g., "2024-01-15T10:30:00Z")
}

// Fix: Add ProgressUpdate type definition.
export type ProgressUpdate =
  | { type: 'status'; message: string }
  | { type: 'post'; data: BlogPost };
