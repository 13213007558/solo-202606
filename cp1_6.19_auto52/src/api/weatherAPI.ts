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
  detail?: string;
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

const WEATHER_DETAILS: Record<WeatherType, string[]> = {
  sunny: ['阳光充足，注意做好防晒措施，建议涂抹防晒霜并佩戴太阳镜', '晴空万里，紫外线较强，户外活动请做好防护', '天气晴好，气温较高，注意补充水分避免中暑'],
  cloudy: ['多云间晴，温度适宜，是出行的好天气', '云层遮挡部分阳光，体感舒适，适合户外散步', '天空多云，偶有阳光穿透云层，气温适中'],
  overcast: ['阴天持续，光线偏暗，建议选择室内活动', '全天阴沉，湿度较高，外出注意防潮', '云层较厚无降水，适合逛商场或博物馆等室内场所'],
  rainy: ['有小雨，出门请携带雨具，路面湿滑注意安全', '降雨持续，建议选择室内活动，如需外出请穿防水鞋', '局部地区有阵雨，雨量不大但持续时间较长']
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

  const details = WEATHER_DETAILS[weatherType];
  const detail = details[Math.floor(random() * details.length)];

  return {
    date: formatDate(date),
    dateObj: new Date(date),
    weatherType,
    weatherIcon: WEATHER_ICONS[weatherType],
    weatherDesc,
    detail,
    highTemp,
    lowTemp,
    hourlyTemps,
    humidity: Math.round(40 + random() * 50),
    windSpeed: Math.round(5 + random() * 25),
    precipitation: weatherType === 'rainy' ? Math.round(60 + random() * 40) : Math.round(random() * 30),
    uvIndex: weatherType === 'sunny' ? Math.round(7 + random() * 4) : Math.round(1 + random() * 6)
  };
}

export function generateDetailFromType(weatherType: WeatherType): string {
  return WEATHER_DETAILS[weatherType][0];
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
