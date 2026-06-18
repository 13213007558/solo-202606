import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface RatingHistoryItem {
  bookId: string;
  rating: number;
  tags: string[];
}

interface User {
  id: string;
  username: string;
  password: string;
  ratingHistory: RatingHistoryItem[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  tags: string[];
  ratings: number[];
  rating: number;
}

interface Review {
  id: string;
  bookId: string;
  userId: string;
  username: string;
  rating: number;
  content: string;
  tags: string[];
  timestamp: number;
}

const app = express();
app.use(cors());
app.use(express.json());

const users: User[] = [];
