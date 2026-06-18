import React from 'react';
import DeviceCard from '../components/DeviceCard';
import { Device } from '../App';

const mockDevices: Device[] = [
  { id: '1', name: '客厅空调', type: 'aircon', power: 1500, dailyHours: 4, todayEnergy: 1.2 },
  { id: '2', name: '冰箱', type: 'fridge', power: 150, dailyHours: 24, todayEnergy: 3.6 },
  { id: '3', name: '客厅照明', type: 'lighting', power: 60, dailyHours: 5, todayEnergy: 0.3 },
  { id: '4', name: '智能电视', type: 'tv', power: 120, dailyHours: 3, todayEnergy: 0.36 },
  { id: '5', name: '洗衣机', type: 'washer', power: 500, dailyHours: 1.5, todayEnergy: 0.75 },
  { id: '6', name: '办公电脑', type: 'computer', power: 300, dailyHours: 8, todayEnergy: 2.4 },
  { id: '7', name: '电热水器', type: 'other', power: 2000, dailyHours: 3, todayEnergy: 6.0 },
  { id: '8', name: '大功率设备', type: 'other', power: 3000, dailyHours: 4, todayEnergy: 12.0 },
];

const Dashboard: React.FC = () => {
  const handleRecordReading = (deviceId: string) => {
    console.log('记录读数:', deviceId);
  };

  return (
    <div>
      <h1 style={{ color: '#f7fafc', marginBottom: '24px' }}>设备列表</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {mockDevices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onRecordReading={handleRecordReading}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
