import '../styles/dashboard.css';

interface DashboardProps {
  stats: {
    totalWorks: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
    weeklyLikes: number[];
  };
}

const Dashboard = ({ stats }: DashboardProps) => {
  const statCards = [
    { label: '总作品数', value: stats.totalWorks, icon: '🎵', color: 'var(--color-primary)' },
    { label: '总点赞数', value: stats.totalLikes, icon: '❤️', color: '#ff6b9d' },
    { label: '总评论数', value: stats.totalComments, icon: '💬', color: '#22c55e' },
    { label: '粉丝数', value: stats.followers, icon: '👥', color: '#f59e0b' },
  ];

  const maxLikes = Math.max(...stats.weeklyLikes, 1);
  
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const today = new Date().getDay();
  const orderedDays = [...days.slice(today === 0 ? 6 : today - 1), ...days.slice(0, today === 0 ? 6 : today - 1)].reverse();

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">数据看板</h2>
      
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={stat.label} 
            className="stat-card card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="stat-icon" style={{ background: `${stat.color}20` }}>
              <span>{stat.icon}</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card card">
        <h3 className="chart-title">近7天点赞趋势</h3>
        <div className="bar-chart">
          {stats.weeklyLikes.map((likes, index) => (
            <div key={index} className="bar-column">
              <div 
                className="bar-wrapper"
                style={{ height: '120px' }}
              >
                <div 
                  className="bar"
                  style={{ 
                    height: `${(likes / maxLikes) * 100}%`,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <span className="bar-value">{likes}</span>
                </div>
              </div>
              <span className="bar-label">{days[(today + index) % 7]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
