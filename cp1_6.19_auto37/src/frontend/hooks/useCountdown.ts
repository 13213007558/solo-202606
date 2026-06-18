import { useState, useEffect } from 'react';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean;
  totalSeconds: number;
}

export function useCountdown(deadline: string): CountdownResult {
  const calculate = (): CountdownResult => {
    const now = Date.now();
    const end = new Date(deadline).getTime();
    const diff = Math.max(0, end - now);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: diff <= 0,
      isUrgent: totalSeconds < 86400 && totalSeconds > 0,
      totalSeconds,
    };
  };

  const [countdown, setCountdown] = useState<CountdownResult>(calculate);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculate());
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return countdown;
}
