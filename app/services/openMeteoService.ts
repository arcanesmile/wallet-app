import axios from 'axios';

export interface OpenMeteoCurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather: OpenMeteoCurrentWeather;
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relativehumidity_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weathercode: number[];
    windspeed_10m: number[];
  };
  daily?: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

class OpenMeteoService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  /**
   * Get current weather by coordinates
   */
  async getWeatherByCoords(lat: number, lon: number): Promise<OpenMeteoResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
          hourly: [
            'temperature_2m',
            'relativehumidity_2m',
            'apparent_temperature',
            'precipitation_probability',
            'weathercode',
            'windspeed_10m'
          ].join(','),
          daily: [
            'weathercode',
            'temperature_2m_max',
            'temperature_2m_min',
            'sunrise',
            'sunset'
          ].join(','),
          timezone: 'auto',
          forecast_days: 7
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Open-Meteo data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Search for a location by name
   */
  async searchLocation(query: string) {
    try {
      const response = await axios.get(this.geocodingUrl, {
        params: {
          name: query,
          count: 5,
          language: 'en',
          format: 'json'
        }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching location:', error);
      throw new Error('Failed to search location');
    }
  }

  /**
   * Get weather by city name
   */
  async getWeatherByCity(city: string) {
    try {
      // First, get coordinates from city name
      const locations = await this.searchLocation(city);
      
      if (!locations || locations.length === 0) {
        throw new Error('Location not found');
      }

      const { latitude, longitude, name, country } = locations[0];
      
      // Then get weather for these coordinates
      const weatherData = await this.getWeatherByCoords(latitude, longitude);
      
      return {
        ...weatherData,
        location: {
          name,
          country,
          latitude,
          longitude
        }
      };
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      throw error;
    }
  }

  /**
   * Helper function to interpret weather codes
   */
  getWeatherDescription(weatherCode: number): { description: string; icon: string } {
    const weatherMap: Record<number, { description: string; icon: string }> = {
      0: { description: 'Clear sky', icon: '☀️' },
      1: { description: 'Mainly clear', icon: '🌤️' },
      2: { description: 'Partly cloudy', icon: '⛅' },
      3: { description: 'Overcast', icon: '☁️' },
      45: { description: 'Fog', icon: '🌫️' },
      48: { description: 'Depositing rime fog', icon: '🌫️' },
      51: { description: 'Light drizzle', icon: '🌧️' },
      53: { description: 'Moderate drizzle', icon: '🌧️' },
      55: { description: 'Dense drizzle', icon: '🌧️' },
      56: { description: 'Light freezing drizzle', icon: '🌧️' },
      57: { description: 'Dense freezing drizzle', icon: '🌧️' },
      61: { description: 'Slight rain', icon: '🌦️' },
      63: { description: 'Moderate rain', icon: '🌦️' },
      65: { description: 'Heavy rain', icon: '🌧️' },
      66: { description: 'Light freezing rain', icon: '🌧️' },
      67: { description: 'Heavy freezing rain', icon: '🌧️' },
      71: { description: 'Slight snow fall', icon: '🌨️' },
      73: { description: 'Moderate snow fall', icon: '🌨️' },
      75: { description: 'Heavy snow fall', icon: '❄️' },
      77: { description: 'Snow grains', icon: '❄️' },
      80: { description: 'Slight rain showers', icon: '🌦️' },
      81: { description: 'Moderate rain showers', icon: '🌦️' },
      82: { description: 'Violent rain showers', icon: '🌧️' },
      85: { description: 'Slight snow showers', icon: '🌨️' },
      86: { description: 'Heavy snow showers', icon: '❄️' },
      95: { description: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
    };
    
    return weatherMap[weatherCode] || { description: 'Unknown', icon: '❓' };
  }
}

// Export a singleton instance
export const openMeteoService = new OpenMeteoService();