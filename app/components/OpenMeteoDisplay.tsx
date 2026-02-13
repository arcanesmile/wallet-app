'use client';

import React from 'react';
import { OpenMeteoResponse } from '../services/openMeteoService';
import { openMeteoService } from '../services/openMeteoService';

interface WeatherDisplayProps {
  weatherData: OpenMeteoResponse & { location?: { name: string; country: string } };
}

const OpenMeteoDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const { current_weather, hourly, daily, location } = weatherData;
  const weatherInfo = openMeteoService.getWeatherDescription(current_weather.weathercode);

  // Get today's forecast
  const today = daily && daily.time[0];
  const todayMax = daily?.temperature_2m_max[0];
  const todayMin = daily?.temperature_2m_min[0];
  const sunrise = daily?.sunrise[0]?.split('T')[1] || 'N/A';
  const sunset = daily?.sunset[0]?.split('T')[1] || 'N/A';

  // Get current humidity (approximate from hourly data)
  const currentHour = new Date().getHours();
  const currentHumidity = hourly?.relativehumidity_2m[currentHour] || 'N/A';
  const feelsLike = hourly?.apparent_temperature[currentHour] || current_weather.temperature;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Location */}
      {location && (
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800">{location.name}</h2>
          <p className="text-gray-600">{location.country}</p>
        </div>
      )}

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-6xl font-bold text-gray-800">
            {Math.round(current_weather.temperature)}°C
          </div>
          <p className="text-xl text-gray-600 mt-2">{weatherInfo.description}</p>
        </div>
        <div className="text-7xl">{weatherInfo.icon}</div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Feels Like</p>
          <p className="text-xl font-semibold text-gray-800">{Math.round(feelsLike)}°C</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Humidity</p>
          <p className="text-xl font-semibold text-gray-800">{currentHumidity}%</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Wind Speed</p>
          <p className="text-xl font-semibold text-gray-800">
            {Math.round(current_weather.windspeed)} km/h
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Wind Direction</p>
          <p className="text-xl font-semibold text-gray-800">
            {current_weather.winddirection}°
          </p>
        </div>
      </div>

      {/* Today's High/Low */}
      {daily && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Today's Forecast</p>
              <p className="text-2xl font-bold">
                {Math.round(todayMax || 0)}° / {Math.round(todayMin || 0)}°C
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">Sunrise: {sunrise}</p>
              <p className="text-sm">Sunset: {sunset}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3-Hour Forecast */}
      {hourly && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Today's Forecast</h3>
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {hourly.time.slice(0, 8).map((time, index) => {
              const hour = new Date(time).getHours();
              const temp = hourly.temperature_2m[index];
              const precip = hourly.precipitation_probability[index];
              const weatherDesc = openMeteoService.getWeatherDescription(
                hourly.weathercode[index]
              );

              return (
                <div key={time} className="flex-shrink-0 text-center bg-gray-50 p-3 rounded-lg min-w-[80px]">
                  <p className="text-sm font-medium text-gray-600">
                    {hour}:00
                  </p>
                  <p className="text-2xl mt-1">{weatherDesc.icon}</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {Math.round(temp)}°
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {precip}% 🌧️
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        Updated: {new Date(current_weather.time).toLocaleTimeString()}
      </p>
    </div>
  );
};

export default OpenMeteoDisplay;