import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSubmittedTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = () => {
    navigate(`/feedback/${course.id}`);
  };

  return (
    <div className="course-card" onClick={handleClick}>
      <h3 className="course-card__name">{course.name}</h3>
      <div className="course-card__meta">
        <span>{formatDate(course.date)}</span>
        <span
          className={`course-card__status course-card__status--${course.feedbackStatus}`}
        >
          {course.feedbackStatus === 'pending' ? '未填写' : '已填写'}
        </span>
      </div>
      <div className="course-card__footer">
        <span>学生人数：{course.studentCount} 人</span>
        {course.submittedAt && (
          <span>提交时间：{formatSubmittedTime(course.submittedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
