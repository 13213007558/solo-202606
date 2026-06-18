import React from 'react';
import { Device } from '../App';

interface DeviceCardProps {
  device: Device;
  onRecordReading: (deviceId: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onRecordReading }) => {
  return (
    <div className="device-card">
      <h3>{device.name}</h3>
      <p>类型: {device.type}</p>
      <p>功率: {device.power}W</p>
      <p>今日使用: {device.dailyHours}小时</p>
      {device.todayEnergy !== undefined && (
        <p>今日能耗: {device.todayEnergy.toFixed(2)} kWh</p>
      )}
      <button onClick={() => onRecordReading(device.id)}>记录读数</button>
    </div>
  );
};

export default DeviceCard;
