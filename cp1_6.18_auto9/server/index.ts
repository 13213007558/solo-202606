import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import type { Course, Feedback, Stats } from './types';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const courses: Course[] = [
  {
    id: 'course-1',
    name: 'React 高级开发实战',
    date: '2026-06-17',
    studentCount: 32,
    feedbackStatus: 'pending',
  },
  {
    id: 'course-2',
    name: 'TypeScript 深入理解',
    date: '2026-06-15',
    studentCount: 28,
    feedbackStatus: 'submitted',
    submittedAt: '2026-06-15T16:30:00.000Z',
  },
  {
    id: 'course-3',
    name: 'Node.js 后端开发',
    date: '2026-06-14',
    studentCount: 25,
    feedbackStatus: 'pending',
  },
  {
    id: 'course-4',
    name: '前端工程化实践',
    date: '2026-06-12',
    studentCount: 30,
    feedbackStatus: 'submitted',
    submittedAt: '2026-06-12T17:00:00.000Z',
  },
  {
    id: 'course-5',
    name: 'CSS 动画与交互',
    date: '2026-06-10',
    studentCount: 22,
    feedbackStatus: 'pending',
  },
  {
    id: 'course-6',
    name: '算法与数据结构',
    date: '2026-06-08',
    studentCount: 35,
    feedbackStatus: 'submitted',
    submittedAt: '2026-06-08T15:45:00.000Z',
  },
];

const feedbacks: Feedback[] = [
  {
    id: 'feedback-2',
    courseId: 'course-2',
    rating: 4,
    summary: '本节课学生们对 TypeScript 泛型的理解有了明显提升，课堂互动积极，整体效果不错。需要加强的是条件类型的实际应用场景。',
    highlights: [
      { id: 'h1', tag: '积极参与', description: '课堂提问环节学生踊跃发言' },
      { id: 'h2', tag: '技术扎实', description: '多数学生能够独立完成课堂练习' },
    ],
    createdAt: '2026-06-15T16:30:00.000Z',
    updatedAt: '2026-06-15T16:30:00.000Z',
  },
  {
    id: 'feedback-4',
    courseId: 'course-4',
    rating: 5,
    summary: '前端工程化课程进展顺利，学生们对 Webpack 和 Vite 的原理掌握良好，实践环节完成度很高。',
    highlights: [
      { id: 'h3', tag: '积极参与', description: '小组讨论氛围热烈' },
      { id: 'h4', tag: '进步明显', description: '相比上次课程，学生的代码质量有明显提升' },
    ],
    createdAt: '2026-06-12T17:00:00.000Z',
    updatedAt: '2026-06-12T17:00:00.000Z',
  },
  {
    id: 'feedback-6',
    courseId: 'course-6',
    rating: 3,
    summary: '算法课程难度较大，部分学生跟不上节奏。需要在后续课程中增加基础巩固环节。',
    highlights: [
      { id: 'h5', tag: '思维活跃', description: '部分学生能提出多种解题思路' },
    ],
    createdAt: '2026-06-08T15:45:00.000Z',
    updatedAt: '2026-06-08T15:45:00.000Z',
  },
];

app.get('/api/courses', (_req, res) => {
  const sortedCourses = [...courses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json(sortedCourses);
});

app.get('/api/feedback/:courseId', (req, res) => {
  const { courseId } = req.params;
  const feedback = feedbacks.find((f) => f.courseId === courseId);
  if (feedback) {
    res.json(feedback);
  } else {
    res.status(404).json({ error: '反馈不存在' });
  }
});

app.post('/api/feedback', (req, res) => {
  const { courseId, rating, summary, highlights } = req.body;

  if (!courseId || rating == null || !summary || !highlights) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const now = new Date().toISOString();
  const existingIndex = feedbacks.findIndex((f) => f.courseId === courseId);

  let feedback: Feedback;

  if (existingIndex >= 0) {
    feedback = {
      ...feedbacks[existingIndex],
      rating,
      summary,
      highlights,
      updatedAt: now,
    };
    feedbacks[existingIndex] = feedback;
  } else {
    feedback = {
      id: uuidv4(),
      courseId,
      rating,
      summary,
      highlights,
      createdAt: now,
      updatedAt: now,
    };
    feedbacks.push(feedback);
  }

  const courseIndex = courses.findIndex((c) => c.id === courseId);
  if (courseIndex >= 0) {
    courses[courseIndex].feedbackStatus = 'submitted';
    courses[courseIndex].submittedAt = now;
  }

  res.json({ id: feedback.id, feedback });
});

app.get('/api/stats', (_req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthFeedbacks = feedbacks.filter((f) => {
    const feedbackDate = new Date(f.updatedAt);
    return (
      feedbackDate.getMonth() === currentMonth &&
      feedbackDate.getFullYear() === currentYear
    );
  });

  const submittedCount = thisMonthFeedbacks.length;

  const averageRating =
    submittedCount > 0
      ? Math.round(
          (thisMonthFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
            submittedCount) *
            10
        ) / 10
      : 0;

  const lastFeedback = [...feedbacks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  const stats: Stats = {
    submittedCount,
    averageRating,
    lastFeedbackTime: lastFeedback ? lastFeedback.updatedAt : null,
  };

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
