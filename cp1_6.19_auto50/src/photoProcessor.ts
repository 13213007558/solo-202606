export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface BuildingRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  avgColor: RGBColor;
  hue: number;
  brightness: number;
  depth: number;
  thumbnail: string;
}

export interface ProcessedPhotoData {
  width: number;
  height: number;
  buildings: BuildingRegion[];
  skyColor: RGBColor;
  groundColor: RGBColor;
  originalImage: HTMLImageElement;
}

export class PhotoProcessor {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  private readonly MAX_IMAGE_SIZE = 800;
