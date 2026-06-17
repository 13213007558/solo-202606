import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackForm from '../components/FeedbackForm';
import Toast from '../components/Toast';
import { feedbackApi, courseApi } from '../api';
import type { Feedback, Course, StudentHighlight } from '../types';

const FeedbackPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    if (!courseId) return;
    try {
      const [courses, feedback] = await Promise.allSettled([
        courseApi.getAll(),
        feedbackApi.getByCourseId(courseId),
      ]);

      if (courses.status === 'fulfilled') {
        const found = courses.value.find((c) => c.id === courseId);
        if (found) setCourse(found);
      }

      if (feedback.status === 'fulfilled') {
        setExistingFeedback(feedback.value);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleSubmit = async (data: {
    rating: number;
    summary: string;
    highlights: StudentHighlight[];
  }) => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        courseId,
        rating: data.rating,
        summary: data.summary,
        highlights: data.highlights.filter((h) => h.description.trim() !== ''),
      });
      setToastMessage('反馈提交成功！');
      setShowToast(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (error) {
      console.error('提交失败:', error);
      setToastMessage('提交失败，请重试');
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!course) {
    return <div className="empty-state">课程不存在</div>;
  }

  return (
    <div className="feedback-page">
      <div className="feedback-page__back" onClick={handleBack}>
        ← 返回课程列表
      </div>
      <div className="feedback-page__header">
        <h2 className="feedback-page__title">{course.name}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {new Date(course.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          · {course.studentCount} 名学生
        </p>
      </div>
      <FeedbackForm
        initialRating={existingFeedback?.rating || 0}
        initialSummary={existingFeedback?.summary || ''}
        initialHighlights={existingFeedback?.highlights || []}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default FeedbackPage;
