import os
p = '/Users/guo/Documents/solo/demo-Solo/tasks/auto16/backend/server.ts'
L = []
L.append("import express, { Request, Response } from 'express';")
L.append("import cors from 'cors';")
L.append("import { v4 as uuidv4 } from 'uuid';")
L.append('')
L.append('const app = express();')
L.append('const PORT = 3001;')
L.append('')
L.append('app.use(cors());')
L.append('app.use(express.json());')
L.append('')
L.append("type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';")
L.append("type Priority = 'urgent' | 'high' | 'medium' | 'low';")
L.append("type ReviewStatus = 'pending' | 'approved' | 'changes_requested';")
L.append('')
with open(p, 'w') as f:
    f.write('\n'.join(L) + '\n')
print('part1')
