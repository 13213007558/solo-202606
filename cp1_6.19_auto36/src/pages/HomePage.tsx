import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { projectApi, logApi } from '../api';
import { Project, LogEntry } from '../types';
import { formatRelativeTime, isThisMonth } from '../utils';

function useCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (target === 0) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

function StatCard({ label, value, variant }: { label: string; value: number; variant: 'gray' | 'blue' | 'green' }) {
  const displayValue = useCounter(value);
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{displayValue}</div>
    </div>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [projectsData, logsData] = await Promise.all([
          projectApi.getAll(),
          logApi.getRecent(5),
        ]);
        if (cancelled) return;
        setProjects(projectsData);
        setLogs(logsData);
        const map: Record<string, Project> = {};
        projectsData.forEach((p) => (map[p.id] = p));
        setProjectMap(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === 'development').length;
  const thisMonthLogs = logs.filter((l) => l.createdAt && isThisMonth(l.createdAt)).length;

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-title">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">项目看板</h1>
          <p className="page-subtitle">概览你的开发进展</p>
        </div>
      </div>

      <div className="stats-row">
        <StatCard label="总项目数" value={totalProjects} variant="gray" />
        <StatCard label="进行中项目" value={inProgressProjects} variant="blue" />
        <StatCard label="本月新增日志" value={thisMonthLogs} variant="green" />
      </div>

      <div className="recent-logs-card">
        <div className="recent-logs-header">最近日志</div>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">暂无日志记录</div>
            <div className="empty-state-desc">进入项目详情页开始记录开发日志吧</div>
          </div>
        ) : (
          <div>
            {logs.map((log) => {
              const project = projectMap[log.projectId];
              return (
                <div key={log.id} className="recent-log-item">
                  <div className="recent-log-info">
                    {project && (
                      <Link to={`/projects/${log.projectId}`} className="recent-log-project">
                        {project.name}
                      </Link>
                    )}
                    <div className="recent-log-title">{log.title}</div>
                  </div>
                  <div className="recent-log-time">
                    {log.createdAt ? formatRelativeTime(log.createdAt) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
