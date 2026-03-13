import { Coordinates, WeatherData } from '../types';

/** WMO weather interpretation codes → human-readable description + emoji */
const WMO_CODES: Record<number, { description: string; emoji: string }> = {
  0:   { description: 'Clear sky',            emoji: '☀️' },
  1:   { description: 'Mostly clear',          emoji: '🌤️' },
  2:   { description: 'Partly cloudy',         emoji: '⛅' },
  3:   { description: 'Overcast',              emoji: '☁️' },
  45:  { description: 'Foggy',                 emoji: '🌫️' },
  48:  { description: 'Depositing rime fog',   emoji: '🌫️' },
  51:  { description: 'Light drizzle',         emoji: '🌦️' },
  53:  { description: 'Moderate drizzle',      emoji: '🌦️' },
  55:  { description: 'Dense drizzle',         emoji: '🌧️' },
  61:  { description: 'Slight rain',           emoji: '🌧️' },
  63:  { description: 'Moderate rain',         emoji: '🌧️' },
  65:  { description: 'Heavy rain',            emoji: '🌧️' },
  71:  { description: 'Slight snow fall',      emoji: '🌨️' },
  73:  { description: 'Moderate snow fall',    emoji: '❄️' },
  75:  { description: 'Heavy snow fall',       emoji: '❄️' },
  77:  { description: 'Snow grains',           emoji: '🌨️' },
  80:  { description: 'Slight rain showers',   emoji: '🌦️' },
  81:  { description: 'Moderate rain showers', emoji: '🌧️' },
  82:  { description: 'Violent rain showers',  emoji: '⛈️' },
  85:  { description: 'Slight snow showers',   emoji: '🌨️' },
  86:  { description: 'Heavy snow showers',    emoji: '❄️' },
  95:  { description: 'Thunderstorm',          emoji: '⛈️' },
  96:  { description: 'Thunderstorm w/ hail',  emoji: '⛈️' },
  99:  { description: 'Thunderstorm w/ hail',  emoji: '⛈️' },
};

/**
 * Fetch current weather from Open-Meteo (no API key required).
 * Returns null on any failure so the app degrades gracefully.
 */
export async function fetchWeather(coords: Coordinates): Promise<WeatherData | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${coords.latitude.toFixed(4)}` +
      `&longitude=${coords.longitude.toFixed(4)}` +
      `&current_weather=true`;

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;

    const json = await response.json();
    const cw = json?.current_weather;
    if (!cw) return null;

    const code: number = cw.weathercode ?? 0;
    const wmo = WMO_CODES[code] ?? { description: 'Unknown', emoji: '🌍' };

    return {
      temperature: Math.round(cw.temperature as number),
      description: wmo.description,
      emoji: wmo.emoji,
    };
  } catch {
    return null;
  }
}
