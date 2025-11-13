
export interface BlogPost {
  title: string;
  content: string;
}

// Fix: Add ProgressUpdate type definition.
export type ProgressUpdate =
  | { type: 'status'; message: string }
  | { type: 'post'; data: BlogPost };
