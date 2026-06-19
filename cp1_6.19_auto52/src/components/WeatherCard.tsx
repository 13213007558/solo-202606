import React, { useMemo } from 'react';
import type { WeatherData } from '../api/weatherAPI';
import { generateDetailFromType } from '../api/weatherAPI';
import { generateDetailFromType } from '../api/weatherAPI';

interface WeatherCardProps {
  data: WeatherData;
  index: number;
}

function getUvLevel(uvIndex: number): { text: string; color: string } {
  if (uvIndex <= 2) return { text: 'ä½Ž', color: '#5cd85c' };
  if (uvIndex <= 5) return { text: 'ä¸ªç¯€', color: '#f5c400' };
  if (uvIndex <= 7) return { text: '¦®', color: '#ff8c42' };
  if (uvIndex <= 10) return { text: 'å¾ˆé«‰', color: '#e63946' };
  return { text: 'ç¨é«‰', color: '#8b5cf6' };
}

function buildTempChartData(hourlyTemps: WeatherData['hourlyTemps']) {
!¥µÁ½ÉÐI•…Ð°ìÕÍ•5•µ¼ô™É½´€É•…Ðœì)¥µÁ½ÉÐÑåÁ”ì]•…Ñ¡•É…Ñ„ô™É½´€œ¸¸½…Á¤½Ý•…Ñ¡•ÉA$œì&;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;

  const slots = [
    { hour: 6, label: 'å‚' },
    { hour: 12, label: 'ä¸ª' },
    { hour: 18, label: 'æ˜Ž' }
  ];

  const points = slots.map((slot) => {
    const entry = hourlyTemps.find((h) => h.hour === slot.hour);
    return {
      temp: entry ? entry.temp : 0,
      label: slot.label
    };
  });

  const temps = points.map((p) => p.temp);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const range = maxT - minT || 1;

  const coords = points.map((p, i) => ({
    x: padX + (i / (points.length - 1)) * plotW,
    y: padTop + (1 - (p.temp - minT) / range) * plotH,
    temp: p.temp,
    label: p.label
  }));

  let pathD = '';
  if (coords.length >= 2) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const cpx = (coords[i].x + coords[i + 1].x) / 2;
      pathD += ` C ${cpx} ${coords[i].y}, ${cpx} ${coords[i + 1].y}, ${coords[i + 1].x} ${coords[i + 1].y}`;
    }
  }

  return { W, H, pathD, coords };
}
