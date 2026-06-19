export type WeatherType = 'sunny' | 'cloudy' | 'overcast' | 'rainy';

export interface HourlyTemp {
  hour: number;
  temp: number;
}

export interface WeatherData {
  date: string;
  dateObj: Date;
  weatherType: WeatherType;
  weatherIcon: string;
  weatherDesc: string;
  highTemp: number;
  lowTemp: number;
  hourlyTemps: HourlyTemp[];
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
}

export interface CityWeather {
  city: string;
  forecast: WeatherData[];
}

const CITIES = ['北京', '上海', '广州', '成都'];

const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  overcast: '☁️',
  rainy: '🌦️'
};

const WEATHER_DESCS: Record<WeatherType, string[]> = {
  sunny: ['天气晴朗，阳光明媚', '万里无云，适合户外活动', '艳阳高照，注意防晒'],
  cloudy: ['多云天气，偶有阳光', '云层较厚，气温适宜', '多云转晴，下午可见阳光'],
  overcast: ['阴天，光线较暗', '全天阴天，适合室内活动', '阴云密布，可能有小雨'],
  rainy: ['下午可能有阵雨', '小雨连绵，记得带伞', '局部有雷阵雨，注意安全']
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

function generateHourlyTemps(baseTemp: number, random: () => number): HourlyTemp[] {
  const temps: HourlyTemp[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const tempVariation = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 8;
    const noise = (random() - 0.5) * 3;
    temps.push({
      hour,
      temp: Math.round((baseTemp + tempVariation + noise) * 10) / 10
    });
  }
  return temps;
}

function generateWeatherData(date: Date, city: string, random: () => number): WeatherData {
  const cityBaseTemps: Record<string, number> = {
    '北京': 22,
    '上海': 24,
    '广州': 28,
    '成都': 23
  };

  const baseTemp = cityBaseTemps[city] || 22;
  const weatherRoll = random();
  
  let weatherType: WeatherType;
  if (weatherRoll < 0.35) weatherType = 'sunny';
  else if (weatherRoll < 0.6) weatherType = 'cloudy';
  else if (weatherRoll < 0.8) weatherType = 'overcast';
  else weatherType = 'rainy';

  const hourlyTemps = generateHourlyTemps(baseTemp, random);
  const temps = hourlyTemps.map(h => h.temp);
  const highTemp = Math.round(Math.max(...temps));
  const lowTemp = Math.round(Math.min(...temps));

  const descs = WEATHER_DESCS[weatherType];
  const weatherDesc = descs[Math.floor(random() * descs.length)];

  return {
    date: formatDate(date),
    dateObj: new Date(date),
    weatherType,
    weatherIcon: WEATHER_ICONS[weatherType],
    weatherDesc,
    highTemp,
    lowTemp,
    hourlyTemps,
    humidity: Math.round(40 + random() * 50),
    windSpeed: Math.round(5 + random() * 25),
    precipitation: weatherType === 'rainy' ? Math.round(60 + random() * 40) : Math.round(random() * 30),
    uvIndex: weatherType === 'sunny' ? Math.round(7 + random() * 4) : Math.round(1 + random() * 6)
  };
}

export async function fetchWeather(
  city: string,
  startDate: string,
  days: number
): Promise<CityWeather> {
  await new Promise(resolve => setTimeout(resolve, 200));

  if (!CITIES.includes(city)) {
    throw new Error(`不支持的城市: ${city}`);
  }

  if (days < 1 || days > 7) {
    throw new Error('日期范围必须在1-7天之间');
  }

  const seed = city.charCodeAt(0) * 1000 + parseInt(startDate.replace(/-/g, ''));
  const random = seededRandom(seed);

  const forecast: WeatherData[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    forecast.push(generateWeatherData(date, city, random));
  }

  return { city, forecast };
}

export const availableCities = [...CITIES];
