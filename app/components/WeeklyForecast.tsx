'use client';

import React from 'react';
import { openMeteoService } from '../services/openMeteoService';

interface WeeklyForecastProps {
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ daily }) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">7-Day Forecast</h3>
      <div className="space-y-2">
        {daily.time.map((date, index) => {
          const dayName = index === 0 ? 'Today' : days[new Date(date).getDay()];
          const weatherInfo = openMeteoService.getWeatherDescription(daily.weathercode[index]);
          const maxTemp = Math.round(daily.temperature_2m_max[index]);
          const minTemp = Math.round(daily.temperature_2m_min[index]);

          return (
            <div key={date} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="w-24 font-medium text-gray-700">{dayName}</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{weatherInfo.icon}</span>
                <span className="text-sm text-gray-600 w-24">{weatherInfo.description}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{maxTemp}°</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-500">{minTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyForecast;