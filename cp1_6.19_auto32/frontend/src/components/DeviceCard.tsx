import { useState } from 'react';

export interface Device {
  id: string;
  name: string;
  type: string;
  power: number;
  avgHours: number;
  todayEnergy: number;
}

interface DeviceCardProps {
  device: Device;
  onRecord: (deviceId: string, hours: number) => void;
}

const typeEmojiMap: Record<string, string> = {
  air_conditioner: '❄️',
  fridge: '🧊',
  lighting: '💡',
  washer: '🫧',
  tv: '📺',
  computer: '💻',
  heater: '🔥',
  oven: '🍞',
  other: '🔌',
};

const typeLabelMap: Record<string, string> = {
  air_conditioner: '空调',
  fridge: '冰箱',
  lighting: '照明',
  washer: '洗衣机',
  tv: '电视',
  computer: '电脑',
  heater: '取暖器',
  oven: '烤箱',
  other: '其他',
};

function getEnergyColor(energy: number): string {
  if (energy <= 1) return '#48bb78';
  if (energy <= 3) return '#ecc94b';
  if (energy <= 6) return '#ed8936';
  return '#fc8181';
}

function getEnergyBg(energy: number): string {
  if (energy <= 1) return 'rgba(72,187,120,0.08)';
  if (energy <= 3) return 'rgba(236,201,75,0.08)';
  if (energy <= 6) return 'rgba(237,137,54,0.08)';
  return 'rgba(252,129,129,0.10)';
}

const cardStyle = (energy: number): React.CSSProperties => ({
  background: getEnergyBg(energy),
  border: `1px solid rgba(0,212,255,0.25)`,
  borderRadius: 16,
  padding: 24,
  backdropFilter: 'blur(16px)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
});

const cardHoverStyle: React.CSSProperties = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 32px rgba(0,212,255,0.2), 0 0 0 1px rgba(0,212,255,0.4)',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease',
};

const modalStyle: React.CSSProperties = {
  background: '#2d3748',
  borderRadius: 16,
  padding: 32,
  minWidth: 360,
  border: '1px solid rgba(0,212,255,0.3)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)',
};

function DeviceCard({ device, onRecord }: DeviceCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [hours, setHours] = useState('');
  const [hovered, setHovered] = useState(false);

  const emoji = typeEmojiMap[device.type] || '🔌';
  const label = typeLabelMap[device.type] || device.type;
  const energyColor = getEnergyColor(device.todayEnergy);

  const handleSubmit = () => {
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return;
    onRecord(device.id, h);
    setHours('');
    setShowModal(false);
  };

  const mergedCardStyle: React.CSSProperties = {
    ...cardStyle(device.todayEnergy),
    ...(hovered ? cardHoverStyle : {}),
  };

  return (
    <>
      <div
        style={mergedCardStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 36, filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }}>
            {emoji}
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#f7fafc' }}>{device.name}</div>
            <div style={{ fontSize: 13, color: '#00d4ff', fontWeight: 500 }}>{label}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 2 }}>额定功率</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{device.power}W</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 2 }}>今日能耗</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: energyColor }}>
              {device.todayEnergy.toFixed(2)} kWh
            </div>
          </div>
        </div>

        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 2,
              background: energyColor,
              width: `${Math.min((device.todayEnergy / 15) * 100, 100)}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 10,
            border: '1px solid rgba(0,212,255,0.4)',
            background: 'rgba(0,212,255,0.08)',
            color: '#00d4ff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.18)';
            e.currentTarget.style.borderColor = '#00d4ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
          }}
        >
          📊 记录读数
        </button>
      </div>

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f7fafc' }}>
              记录读数 — {device.name}
            </h3>
            <p style={{ fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>
              输入今日使用时长（小时），系统将自动计算能耗
            </p>
            <label style={{ fontSize: 13, color: '#cbd5e0', display: 'block', marginBottom: 6 }}>
              使用时长（小时）
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="例如: 3.5"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0,212,255,0.3)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f7fafc',
                fontSize: 15,
                outline: 'none',
                marginBottom: 8,
              }}
              autoFocus
            />
            {hours && !isNaN(parseFloat(hours)) && parseFloat(hours) > 0 && (
              <div style={{ fontSize: 13, color: '#00d4ff', marginBottom: 16 }}>
                预估能耗：{((device.power * parseFloat(hours)) / 1000).toFixed(2)} kWh
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#a0aec0',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: '#00d4ff',
                  color: '#1a202c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: hours && !isNaN(parseFloat(hours)) && parseFloat(hours) > 0 ? 1 : 0.4,
                }}
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default DeviceCard;
