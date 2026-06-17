export interface ColorWeight {
  hex: string;
  weight: number;
}

export interface Palette {
  id: string;
  name: string;
  author: string;
  colors: string[];
  colorWeights: ColorWeight[];
  likes: number;
  createdAt: number;
}
