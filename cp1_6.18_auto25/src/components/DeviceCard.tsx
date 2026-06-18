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

function getEnergyGradient(energy: number): string {
  if (energy < 2) {
    return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
  } else if (energy < 5) {
    return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
  } else {
    return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
  }
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onRecordReading }) => {
  const todayEnergy = device.todayEnergy ?? 0;
  const gradient = getEnergyGradient(todayEnergy);

  return (
    <div
      className="device-card"
      style={{
        '--energy-gradient': gradient,
      } as React.CSSProperties}
    >
      <style>{`
        .device-card {
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
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
          height: 4px;
          background: var(--energy-gradient);
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

        .device-card-energy {
          font-size: 32px;
          font-weight: 700;
          color: #00d4ff;
          text-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
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

      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '14px', color: #e2e8f0' }}>
        <div>功率: <strong>{device.power} W</strong></div>
        <div>每日: <strong>{device.dailyHours} h</strong></div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'a0aec0', marginBottom: '4px' }}>今日能耗</div>
        <div className="device-card-energy">{todayEnergy.toFixed(2)} kWh</div>
      </div>

      <button
        className="device-card-btn"
        onClick={() => onRecordReading(device.id)}
      >
        记录读数
      </button>
    </div>
  );
};

export default DeviceCard;
