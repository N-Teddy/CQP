// src/components/SearchBar.jsx
import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';

const SearchBar = ({ onChange }) => {
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [available, setAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const genres = [
    'Fiction', 'Non-Fiction', 'Fantasy', 'Romance', 'Mystery',
    'Science Fiction', 'Biography', 'History', 'Self-Help',
    'Business', 'Children', 'Young Adult', 'Poetry', 'Art'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: Sparkles },
    { value: 'title', label: 'Title A-Z', icon: BookOpen },
    { value: 'newest', label: 'Newest First', icon: Calendar },
    { value: 'popular', label: 'Most Popular', icon: Sparkles }
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      onChange?.({ search: q, genre, available, sortBy });
    }, 300);
    return () => clearTimeout(t);
  }, [q, genre, available, sortBy]);

  const clearFilters = () => {
    setQ('');
    setGenre('');
    setAvailable(false);
    setSortBy('relevance');
  };

  const activeFiltersCount = [genre, available, sortBy !== 'relevance'].filter(Boolean).length;

  return (
    <div className="mb-8">
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="Search by title, author, ISBN..."
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${showFilters
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <div className="relative">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">All Genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="flex items-center gap-3 mt-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Available only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Filters</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setGenre('Fiction')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === 'Fiction'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Fiction
              </button>
              <button
                onClick={() => setGenre('Non-Fiction')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === 'Non-Fiction'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Non-Fiction
              </button>
              <button
                onClick={() => setGenre('Fantasy')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === 'Fantasy'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Fantasy
              </button>
              <button
                onClick={() => setGenre('Mystery')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === 'Mystery'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Mystery
              </button>
              <button
                onClick={() => setAvailable(!available)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${available
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                ✓ Available Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(q || genre || available) && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {q && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              Search: {q}
              <button onClick={() => setQ('')} className="hover:text-primary-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {genre && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {genre}
              <button onClick={() => setGenre('')} className="hover:text-purple-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {available && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
              Available only
              <button onClick={() => setAvailable(false)} className="hover:text-emerald-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
