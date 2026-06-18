import { useState, useEffect } from 'react';
import axios from 'axios';
import PerformanceTimeline from '../components/PerformanceTimeline';
import { useAuth } from '../context/AuthContext';
import '../styles/performancesPage.css';

interface Performance {
  id: string;
  date: string;
  venue: string;
  ticketUrl: string;
  workId: string;
  workTitle: string;
}

const PerformancesPage = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadAllPerformances();
  }, []);

  const loadAllPerformances = async () => {
    try {
      const worksResponse = await axios.get('/api/works', {
        params: {
          status: 'published',
          limit: 100,
        },
      });

      const allPerfs: Performance[] = [];
      worksResponse.data.works.forEach((work: any) => {
        if (work.performances && work.performances.length > 0) {
          work.performances.forEach((perf: any) => {
            allPerfs.push({
              ...perf,
              workId: work.id,
              workTitle: work.title,
            });
          });
        }
      });

      allPerfs.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setPerformances(allPerfs);
    } catch (error) {
      console.error('Failed to load performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingPerformances = performances.filter(
    p => new Date(p.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );
  const pastPerformances = performances.filter(
    p => new Date(p.date) < new Date(new Date().setHours(0, 0, 0, 0))
  );

  return (
    <div className="performances-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1 className="page-title">演出时间线</h1>
          <p className="page-subtitle">浏览所有即将到来和已结束的演出</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : performances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎤</div>
            <h3>暂无演出</h3>
            <p>还没有任何演出安排</p>
            {user && (
              <p className="empty-hint">
                去发布作品时添加演出信息吧
              </p>
            )}
          </div>
        ) : (
          <div className="performances-content">
            {upcomingPerformances.length > 0 && (
              <section className="perf-section">
                <h2 className="section-title">
                  <span className="section-icon">🎵</span>
                  即将到来
                  <span className="section-count">{upcomingPerformances.length} 场</span>
                </h2>
                <PerformanceTimeline performances={upcomingPerformances} />
              </section>
            )}

            {pastPerformances.length > 0 && (
              <section className="perf-section">
                <h2 className="section-title">
                  <span className="section-icon">📅</span>
                  已结束
                  <span className="section-count">{pastPerformances.length} 场</span>
                </h2>
                <PerformanceTimeline performances={pastPerformances} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformancesPage;
