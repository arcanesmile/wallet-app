'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (city: string) => {
    const updated = [city, ...recentSearches.filter(s => s !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle click outside to close recent searches
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recentRef.current && !recentRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !isLoading) {
      onSearch(searchTerm.trim());
      saveRecentSearch(searchTerm.trim());
      setSearchTerm('');
      setShowRecent(false);
    }
  };

  const handleRecentClick = (city: string) => {
    setSearchTerm(city);
    onSearch(city);
    setShowRecent(false);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg 
              className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowRecent(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for a city..."
            className={`
              w-full pl-12 pr-24 py-4 
              bg-white/90 backdrop-blur-sm
              border-2 rounded-2xl
              text-gray-800 placeholder-gray-400
              outline-none transition-all duration-300
              ${isFocused 
                ? 'border-blue-400 shadow-lg shadow-blue-100 scale-105' 
                : 'border-gray-200 hover:border-gray-300 shadow-md'
              }
              ${isLoading ? 'opacity-75' : ''}
            `}
            disabled={isLoading}
          />

          {/* Search Button */}
          <button
            type="submit"
            disabled={!searchTerm.trim() || isLoading}
            className={`
              absolute right-2 top-1/2 transform -translate-y-1/2
              px-5 py-2 rounded-xl
              font-medium text-sm
              transition-all duration-300
              ${searchTerm.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
              flex items-center gap-2
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Searching</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div 
          ref={recentRef}
          className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown"
        >
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Searches
              </span>
              <button
                onClick={handleClearRecent}
                className="text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                Clear All
              </button>
            </div>
            {recentSearches.map((city, index) => (
              <button
                key={index}
                onClick={() => handleRecentClick(city)}
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                      {city}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-blue-400">
                    Search →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text with Examples */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Try popular cities:</span>
        </div>
        <div className="flex gap-2">
          {['Nasarawa', 'Benin', 'Ilorin', 'kano'].map((city) => (
            <button
              key={city}
              onClick={() => {
                setSearchTerm(city);
                onSearch(city);
                saveRecentSearch(city);
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="absolute right-0 -top-6 text-xs text-gray-400">
        <kbd className="px-2 py-1 bg-gray-100 rounded">⏎</kbd> to search
      </div>
    </div>
  );
};

export default SearchBar;