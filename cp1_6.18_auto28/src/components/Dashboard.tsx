interface DashboardProps {
  stats: {
    totalWorks: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
    dailyLikes: { date: string; count: number }[];
  };
}

export default function Dashboard({ stats }: DashboardProps) {
  const maxLikes = Math.max(...stats.dailyLikes.map((d) => d.count), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-value">{stats.totalWorks}</div>
          <div className="stat-label">作品数</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.totalLikes}</div>
          <div className="stat-label">总点赞</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.totalComments}</div>
          <div className="stat-label">评论数</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.followers}</div>
          <div className="stat-label">粉丝数</div>
        </div>
      </div>

      <div className="card dashboard-chart">
        <h3 className="chart-title">近 7 天点赞趋势</h3>
        <div className="mini-chart">
          {stats.dailyLikes.map((day, index) => (
            <div
              key={index}
              className="chart-bar"
              style={{
                height: `${(day.count / maxLikes) * 100}%`,
              }}
              title={`${day.count} 赞`}
            >
              <span className="chart-bar-label">{formatDate(day.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
