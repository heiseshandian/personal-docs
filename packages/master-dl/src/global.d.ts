export interface DownloadItem {
  pos: number;
  streamingURL: string;
  title: string;
  transcriptURL: string;
}

export interface Course {
  title: string;
  pos: number;
  streamingURL: string;
  transcriptURL: string;
  instructors: any;
  hasCC: boolean;
  durationSeconds: number;
}

export interface QualityChoice {
  name: string;
  value: number;
}

export interface CourseChoice {
  name: string;
  value: Course;
}

export interface Progress {
  percent: number;
}

export interface TokenRecord {
  timestamp: number;
  hash: string;
  token: string;
}

export interface RequestOptions {
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  body?: any;
}

export interface DownloadOptions {
  url: string;
  id: number;
  title: string;
  ext: 'srt' | 'mp4';
  programId?: string;
}
