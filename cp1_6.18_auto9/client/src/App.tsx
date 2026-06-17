import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const CourseListPage = lazy(() => import('./pages/CourseListPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>教师课后反馈系统</h1>
      </header>
      <main className="app-main">
        <Suspense fallback={<div className="loading">加载中...</div>}>
          <Routes>
            <Route path="/" element={<CourseListPage />} />
            <Route path="/feedback/:courseId" element={<FeedbackPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
