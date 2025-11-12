
export interface BlogPost {
  title: string;
  content: string;
}

export type ProgressUpdate =
  | { type: 'status'; message: string }
  | { type: 'post'; data: BlogPost };
