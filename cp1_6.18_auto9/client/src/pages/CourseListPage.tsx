import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import StatsOverview from '../components/StatsOverview';
import { courseApi, statsApi } from '../api';
import type { Course, Stats } from '../types';

const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    submittedCount: 0,
    averageRating: 0,
    lastFeedbackTime: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [coursesData, statsData] = await Promise.all([
        courseApi.getAll(),
        statsApi.get(),
      ]);
      const sortedCourses = [...coursesData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setCourses(sortedCourses);
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <h2 className="page-title">我的课程</h2>
      <StatsOverview stats={stats} />
      {courses.length > 0 ? (
        <div className="course-list">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="empty-state">暂无课程</div>
      )}
    </div>
  );
};

export default CourseListPage;
