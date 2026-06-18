import { useEffect, useState } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  maxValue?: number;
  animate?: boolean;
}

export const ProgressRing = ({
  progress,
  size = 160,
  strokeWidth = 10,
  color = '#2D6B3B',
  label = '小时',
  maxValue = 100,
  animate = true,
}: ProgressRingProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [offset, setOffset] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressPercent = (progress / maxValue) * 100;
  const dashOffset = circumference - (progressPercent / 100) * circumference;
  
  useEffect(() => {
    if (!animate) {
      setDisplayValue(progress);
      setOffset(dashOffset);
      return;
    }
    
    let startTime: number;
    const duration = 1500;
    
    const animateFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      
      setDisplayValue(Math.round(progress * easeOut * 10) / 10);
      setOffset(circumference - (progressPercent / 100) * circumference * easeOut);
      
      if (progressRatio < 1) {
        requestAnimationFrame(animateFrame);
      }
    };
    
    requestAnimationFrame(animateFrame);
  }, [progress, maxValue, animate, circumference, progressPercent, dashOffset]);
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-forest-600 font-serif">
          {displayValue}
        </span>
        <span className="text-sm text-gray-500 mt-1">{label}</span>
      </div>
    </div>
  );
};

export default ProgressRing;
