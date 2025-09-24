// src/components/SearchBar.jsx
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onChange }) => {
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      onChange?.({ search: q, genre, available });
    }, 300);
    return () => clearTimeout(t);
  }, [q, genre, available]);

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-10"
            placeholder="Search by title, author, ISBN..."
          />
        </div>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input md:w-56"
        >
          <option value="">All Genres</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Romance">Romance</option>
          <option value="Mystery">Mystery</option>
          <option value="Science Fiction">Science Fiction</option>
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          <span>Available Only</span>
        </label>
      </div>
    </div>
  );
};

export default SearchBar;