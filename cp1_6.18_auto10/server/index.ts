import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { validatePalette, PaletteInput, ValidationResult } from './paletteValidator';

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

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const palettes: Palette[] = [];

function generateRandomWeights(colors: string[]): ColorWeight[] {
  return colors.map(hex => ({
    hex,
    weight: Math.floor(Math.random() * 10) + 1
  }));
}

app.post('/api/palettes', (req: Request, res: Response) => {
  const input: PaletteInput = req.body;
  const validation: ValidationResult = validatePalette(input);

  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const newPalette: Palette = {
    id: uuidv4(),
    name: input.name.trim(),
    author: input.author.trim(),
    colors: input.colors,
    colorWeights: generateRandomWeights(input.colors),
    likes: 0,
    createdAt: Date.now()
  };

  palettes.unshift(newPalette);
  return res.status(201).json(newPalette);
});

app.get('/api/palettes', (req: Request, res: Response) => {
  const sort = (req.query.sort as string) || 'newest';
  let sortedPalettes = [...palettes];

  if (sort === 'popular') {
    sortedPalettes.sort((a, b) => b.likes - a.likes);
  } else {
    sortedPalettes.sort((a, b) => b.createdAt - a.createdAt);
  }

  return res.json(sortedPalettes);
});

app.get('/api/palettes/:id', (req: Request, res: Response) => {
  const palette = palettes.find(p => p.id === req.params.id);

  if (!palette) {
    return res.status(404).json({ error: '配色方案不存在' });
  }

  return res.json(palette);
});

app.post('/api/palettes/:id/like', (req: Request, res: Response) => {
  const palette = palettes.find(p => p.id === req.params.id);

  if (!palette) {
    return res.status(404).json({ error: '配色方案不存在' });
  }

  palette.likes += 1;
  return res.json(palette);
});

app.listen(PORT, () => {
  console.log(`配色方案服务已启动: http://localhost:${PORT}`);
});

export default app;
