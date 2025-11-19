
export enum ProcessingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ArticleData {
  id: string;
  url: string;
  originalTitle: string;
  translatedTitle: string;
  summary: string;
  content: string; // The main translated body
  language: string;
  originalLanguage: string;
  readingTime: number; // in minutes
  timestamp: number;
}

export interface AudioState {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
}

export interface AppSettings {
  fontSize: number; // 1 = small, 2 = normal, 3 = large, 4 = x-large
  lineHeight: number; // 1.5, 1.75, 2
  highContrast: boolean;
  targetLanguage: string;
  tone: 'neutral' | 'professional' | 'simple' | 'witty';
  mode: 'full' | 'summary';
}

export interface HistoryItem {
  id: string;
  title: string;
  summary: string;
  timestamp: number;
}