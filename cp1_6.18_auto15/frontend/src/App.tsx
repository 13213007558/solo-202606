import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import '@/styles/global.css';

const EventDetail: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h1>活动详情页</h1>
      <p>活动详情内容占位</p>
    </div>
  );
};

const CreateEvent: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h1>创建活动</h1>
      <p>创建活动表单占位</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/create" element={<CreateEvent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
