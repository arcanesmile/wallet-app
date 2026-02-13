'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { openMeteoService } from './services/openMeteoService';
import OpenMeteoDisplay from './components/OpenMeteoDisplay';
import SearchBar from './components/SearchBar';

export default function Home() {
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (location?.latitude && location?.longitude && !searchMode) {
      fetchWeatherByCoords(location.latitude, location.longitude);
    }
  }, [location, searchMode]);

  // Trigger fade-in animation when weather data loads
  useEffect(() => {
    if (weatherData) {
      setFadeIn(true);
    } else {
      setFadeIn(false);
    }
  }, [weatherData]);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await openMeteoService.getWeatherByCoords(lat, lon);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (city: string) => {
    setLoading(true);
    setError('');
    setSearchMode(true);
    
    try {
      const data = await openMeteoService.getWeatherByCity(city);
      setWeatherData(data);
    } catch (err) {
      setError('City not found. Please try another search.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    setSearchMode(false);
    if (location?.latitude && location?.longitude) {
      fetchWeatherByCoords(location.latitude, location.longitude);
    }
  };

  // Loading screen with animation
  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Animated weather icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-ping absolute h-20 w-20 rounded-full bg-blue-400 opacity-20"></div>
              <div className="animate-bounce absolute h-16 w-16">
                <span className="text-5xl">🌤️</span>
              </div>
            </div>
            {/* Loading text */}
            <div className="mt-24">
              <div className="text-2xl font-light text-white drop-shadow-lg">
                Getting your location
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200">
      {/* Decorative cloud elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 left-10 text-white/30 text-8xl animate-float">☁️</div>
      <div className="absolute top-40 right-20 text-white/30 text-7xl animate-float-delayed">☁️</div>
      
      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
        {/* Header with glass morphism effect */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg animate-slideDown">
            🌤️  Bem's Weather App
          </h1>
          <p className="text-white/80 text-lg animate-slideDown animation-delay-200">
            Real-time weather updates for your location
          </p>
        </div>
        
        {/* Search Section with glass morphism */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl p-6 shadow-xl mb-6 animate-slideUp">
          <SearchBar onSearch={handleSearch} isLoading={loading} />
          
          {searchMode && (
            <div className="mt-4 flex justify-center animate-fadeIn">
              <button
                onClick={handleUseMyLocation}
                className="group flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg 
                  className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Use my current location</span>
              </button>
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="animate-slideDown backdrop-blur-md bg-red-500/20 border border-red-500/30 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/30 rounded-full p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Oops! Something went wrong</p>
                  <p className="text-sm text-white/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Location Error Warning */}
          {locationError && !searchMode && !loading && !weatherData && (
            <div className="animate-slideDown backdrop-blur-md bg-yellow-500/20 border border-yellow-500/30 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/30 rounded-full p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Location access unavailable</p>
                  <p className="text-sm text-white/80">{locationError}</p>
                  <p className="text-sm text-white/60 mt-1">
                    Please search for a city above or enable location access in your browser.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block relative">
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-25"></div>
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-6">
                <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
            <p className="text-white text-lg mt-4 animate-pulse">Fetching weather data...</p>
          </div>
        )}

        {/* Weather Display with Fade In */}
        {weatherData && !loading && (
          <div className={`transition-all duration-700 transform ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <OpenMeteoDisplay weatherData={weatherData} />
          </div>
        )}

        {/* No Data State */}
        {!weatherData && !loading && !error && !locationError && (
          <div className="text-center py-16 backdrop-blur-md bg-white/10 rounded-2xl animate-floatIn">
            <div className="text-8xl mb-6 animate-bounce">🌍</div>
            <h3 className="text-2xl font-light text-white mb-2">No weather data yet</h3>
            <p className="text-white/70">
              Search for a city or allow location access to see weather information
            </p>
            
            {/* Quick tips */}
            <div className="mt-8 flex justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-white/60 text-sm">
                🔍 Type a city name
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-white/60 text-sm">
                📍 Allow location access
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}