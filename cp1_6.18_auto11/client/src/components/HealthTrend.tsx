import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendPoint {
  date: string;
  weight: number;
  exerciseMinutes: number;
  foodAmount: number;
}

interface HealthTrendProps {
  trends: TrendPoint[];
  days: 7 | 30;
  onDaysChange: (days: 7 | 30) => void;
}

export default function HealthTrend({ trends, days, onDaysChange }: HealthTrendProps) {
  const formattedTrends = trends.map((t) => ({
    ...t,
    dateLabel: new Date(t.date).toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    }),
  }));

  return (
    <div className="health-trend">
      <div className="trend-controls">
        <div className="date-range-selector">
          <button
            className={`range-btn ${days === 7 ? 'active' : ''}`}
            onClick={() => onDaysChange(7)}
          >
            最近7天
          </button>
          <button
            className={`range-btn ${days === 30 ? 'active' : ''}`}
            onClick={() => onDaysChange(30)}
          >
            最近30天
          </button>
        </div>
      </div>

      <div className="chart-section">
        <h4>⚖️ 体重 & 🏃 运动时长</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={formattedTrends} animationDuration={1000}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              stroke="#9E9E9E"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#2E7D32"
              label={{ value: '体重(kg)', angle: -90, position: 'insideLeft', style: { fill: '#2E7D32', fontSize: 12 } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#FF6F00"
              label={{ value: '运动(分钟)', angle: 90, position: 'insideRight', style: { fill: '#FF6F00', fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              stroke="#2E7D32"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2E7D32' }}
              name="体重(kg)"
              animationDuration={1000}
            />
            <Bar
              yAxisId="right"
              dataKey="exerciseMinutes"
              fill="#FF6F00"
              opacity={0.7}
              radius={[4, 4, 0, 0]}
              name="运动(分钟)"
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h4>🍖 每日饮食次数</h4>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={formattedTrends} animationDuration={1000}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              stroke="#9E9E9E"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#4CAF50"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Bar
              dataKey="foodAmount"
              fill="#4CAF50"
              opacity={0.7}
              radius={[4, 4, 0, 0]}
              name="饮食次数"
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
