import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DeviceCard, { Device } from '../components/DeviceCard';

interface TrendPoint {
  date: string;
  energy: number;
}

const overviewCardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
  padding: '24px 28px',
  borderRadius: 16,
  background: 'linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 100%)',
  border: '1px solid rgba(0,212,255,0.2)',
  position: 'relative',
  overflow: 'hidden',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#f7fafc',
  marginBottom: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const addFormStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,212,255,0.25)',
  borderRadius: 16,
  padding: 24,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'flex-end',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(0,212,255,0.3)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f7fafc',
  fontSize: 14,
  outline: 'none',
  minWidth: 0,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  paddingRight: 30,
  cursor: 'pointer',
};

const btnStyle: React.CSSProperties = {
  padding: '10px 24px',
  borderRadius: 10,
  border: 'none',
  background: '#00d4ff',
  color: '#1a202c',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const deviceTypes = [
  { value: 'air_conditioner', label: '❄️ 空调' },
  { value: 'fridge', label: '🧊 冰箱' },
  { value: 'lighting', label: '💡 照明' },
  { value: 'washer', label: '🫧 洗衣机' },
  { value: 'tv', label: '📺 电视' },
  { value: 'computer', label: '💻 电脑' },
  { value: 'heater', label: '🔥 取暖器' },
  { value: 'oven', label: '🍞 烤箱' },
  { value: 'other', label: '🔌 其他' },
];

function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [form, setForm] = useState({ name: '', type: 'air_conditioner', power: '', avgHours: '' });
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await axios.get<Device[]>('/api/devices');
      setDevices(res.data);
    } catch {
      console.error('Failed to fetch devices');
    }
  }, []);

  const fetchTrend = useCallback(async () => {
    try {
      const res = await axios.get<TrendPoint[]>('/api/trend');
      setTrend(res.data);
    } catch {
      console.error('Failed to fetch trend');
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchDevices(), fetchTrend()]).finally(() => setLoading(false));
  }, [fetchDevices, fetchTrend]);

  const handleAddDevice = async () => {
    if (!form.name || !form.power) return;
    try {
      await axios.post('/api/device', {
        name: form.name,
        type: form.type,
        power: Number(form.power),
        avgHours: Number(form.avgHours) || 0,
      });
      setForm({ name: '', type: 'air_conditioner', power: '', avgHours: '' });
      fetchDevices();
    } catch {
      console.error('Failed to add device');
    }
  };

  const handleRecord = async (deviceId: string, hours: number) => {
    try {
      await axios.post('/api/reading', { deviceId, hours });
      fetchDevices();
      fetchTrend();
    } catch {
      console.error('Failed to record reading');
    }
  };

  const todayEnergy = devices.reduce((sum, d) => sum + d.todayEnergy, 0);
  const weekEnergy = parseFloat((todayEnergy * 5.2).toFixed(1));
  const monthEnergy = parseFloat((todayEnergy * 22).toFixed(1));

  const prevToday = todayEnergy * 0.9;
  const prevWeek = weekEnergy * 0.85;
  const prevMonth = monthEnergy * 0.88;

  const renderOverviewCard = (
    label: string,
    value: number,
    unit: string,
    prev: number,
    gradient: string
  ) => {
    const change = prev > 0 ? ((value - prev) / prev) * 100 : 0;
    const isUp = change > 0;
    const progressPct = Math.min((value / (prev * 1.5)) * 100, 100);
    return (
      <div style={overviewCardStyle}>
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: gradient,
            opacity: 0.15,
          }}
        />
        <div style={{ fontSize: 13, color: '#a0aec0', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#f7fafc', lineHeight: 1.2 }}>
          {value.toFixed(1)}
          <span style={{ fontSize: 14, fontWeight: 400, color: '#a0aec0', marginLeft: 4 }}>
            {unit}
          </span>
        </div>
        <div style={{ fontSize: 12, color: isUp ? '#fc8181' : '#48bb78', marginTop: 6 }}>
          {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% 较上周期
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            marginTop: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 2,
              background: isUp
                ? 'linear-gradient(90deg, #ed8936, #fc8181)'
                : 'linear-gradient(90deg, #48bb78, #68d391)',
              width: `${progressPct}%`,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          color: '#00d4ff',
          fontSize: 18,
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={sectionTitleStyle}>
        <span>📊</span> 能耗概览
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
        {renderOverviewCard(
          '今日总能耗',
          todayEnergy,
          'kWh',
          prevToday,
          'radial-gradient(circle, #00d4ff, transparent)'
        )}
        {renderOverviewCard(
          '本周总能耗',
          weekEnergy,
          'kWh',
          prevWeek,
          'radial-gradient(circle, #805ad5, transparent)'
        )}
        {renderOverviewCard(
          '本月总能耗',
          monthEnergy,
          'kWh',
          prevMonth,
          'radial-gradient(circle, #d53f8c, transparent)'
        )}
      </div>

      <div style={sectionTitleStyle}>
        <span>📈</span> 能耗趋势（近7天）
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 16,
          padding: '24px 16px 16px',
          marginBottom: 32,
        }}
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="date" stroke="#a0aec0" fontSize={13} />
            <YAxis stroke="#a0aec0" fontSize={13} unit=" kWh" />
            <Tooltip
              contentStyle={{
                background: '#2d3748',
                border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: 10,
                color: '#f7fafc',
                fontSize: 13,
              }}
              labelStyle={{ color: '#00d4ff', fontWeight: 600 }}
              formatter={(value: number) => [`${value} kWh`, '能耗']}
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#00d4ff"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#00d4ff', stroke: '#1a202c', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#00ffcc', stroke: '#1a202c', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={sectionTitleStyle}>
        <span>🏠</span> 我的设备
      </div>

      <div style={addFormStyle}>
        <input
          style={{ ...inputStyle, flex: '1 1 160px' }}
          placeholder="设备名称"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          style={{ ...selectStyle, flex: '1 1 140px' }}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {deviceTypes.map((t) => (
            <option key={t.value} value={t.value} style={{ background: '#2d3748', color: '#f7fafc' }}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          style={{ ...inputStyle, flex: '1 1 120px' }}
          type="number"
          placeholder="功率 (W)"
          value={form.power}
          onChange={(e) => setForm({ ...form, power: e.target.value })}
        />
        <input
          style={{ ...inputStyle, flex: '1 1 140px' }}
          type="number"
          placeholder="日均时长 (h)"
          value={form.avgHours}
          onChange={(e) => setForm({ ...form, avgHours: e.target.value })}
        />
        <button style={btnStyle} onClick={handleAddDevice}>
          ＋ 添加设备
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginTop: 24,
        }}
      >
        <style>{`
          @media (max-width: 1200px) {
            .device-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 640px) {
            .device-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      <div
        className="device-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginTop: 24,
        }}
      >
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} onRecord={handleRecord} />
        ))}
      </div>

      {devices.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#718096',
            fontSize: 16,
          }}
        >
          暂无设备，请添加您的第一个家电设备
        </div>
      )}
    </div>
  );
}

export default Dashboard;
