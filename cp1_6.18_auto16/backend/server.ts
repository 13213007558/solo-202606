import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

type Priority = 'urgent' | 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type ReviewStatus = 'pending' | 'approved' | 'rejected';
type CommentStatus = 'open' | 'resolved';