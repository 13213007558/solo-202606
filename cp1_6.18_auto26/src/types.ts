export interface IdeaCard {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  images: string[];
  audioData: string;
  waveform: number[];
  duration: number;
  isFavorite: boolean;
  createdAt: number;
}

export type FilterType = 'all' | 'favorites' | 'images';
