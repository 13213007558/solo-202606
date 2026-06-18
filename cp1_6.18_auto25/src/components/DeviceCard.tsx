import React from 'react';
import { Device } from '../App';

interface DeviceCardProps {
  device: Device;
  onRecordReading: (deviceId: string) => void;
}

const typeIconMap: Record<string, string> = {
  aircon: '❄️',
  fridge: '🧊',
  lighting: '💡',
  tv: '📺',
  washer: '👕',
  computer: '💻',
  other: '🔌',
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getEnergyColor(energy: number): string {
  const t = Math.max(0, Math.min(1, energy / 10));
  const hue = lerp(120, 0, t);
  return `hsl(${hue}, 70%, 50%)`;
}

function getEnergyGradient(energy: number): string {
  const c1 = getEnergyColor(energy);
  const c2 = getEnergyColor(energy * 0.7);
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}


const DeviceCard: React.FC<DeviceCardProps> = ({ device, onRecordReading }) => {
  const todayEnergy = device.todayEnergy ?? 0;
  const bgColor = getEnergyColor(todayEnergy);

  return (
    <div
      className="device-card"
      style={{
        '--energy-bg': bgColor,
      } as React.CSSProperties}
    >
      <style>{`
        .device-card {
          position: relative;
          z-index: 0;
          border: 1px solid rgba(0, 212, 255, 0.3);
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .device-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -2;
          opacity: 0.35;
          transition: opacity 0.3s ease;
          background: var(--energy-bg);
        }

        .device-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: -1;
        }

        .device-card:hover::before {
          opacity: 0.5;
        }

        .device-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.5);
        }

        .device-card-icon {
          font-size: 28px;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
        }

        .device-card-name {
          font-size: 18px;
          font-weight: 600;
          color: #f7fafc;
        }

        .device-card-energy-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .device-card-energy-label {
          font-size: 12px;
          color: rgba(247, 250, 252, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .device-card-energy-value {
          font-size: 36px;
          font-weight: 700;
          color: #00d4ff;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.8),
                       0 0 20px rgba(0, 212, 255, 0.5);
          line-height: 1.2;
        }

        .device-card-energy-unit {
          font-size: 18px;
          font-weight: 500;
          color: rgba(247, 250, 252, 0.7);
          margin-left: 4px;
          text-shadow: none;
        }

        .device-card-btn {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .device-card-btn:hover {
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span className="device-card-icon">{typeIconMap[device.type] || typeIconMap.other}</span>
        <div style={{ flex: 1 }}>
          <div className="device-card-name">{device.name}</div>
          <div style={{ fontSize: '12px', color: '#a0aec0' }}>{device.type}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '14px', color: '#e2e8f0' }}>
        <div>功率: <strong>{device.power} W</strong></div>
        <div>每日: <strong>{device.dailyHours} h</strong></div>
      </div>

      <div className="device-card-energy-section">
        <div className="device-card-energy-label">今日预估能耗</div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span className="device-card-energy-value">{todayEnergy.toFixed(2)}</span>
          <span className="device-card-energy-unit">kWh</span>
        </div>
      </div>

      <button
        className="device-card-btn"
        onClick={() => onRecordReading(device.id)}
        style={{ marginTop: "16px", width: "100%" }}
      >
        记录读数
      </button>
    </div>
  );
};

export default DeviceCard;
