// src/components/BookCard.jsx
import { BookOpen, Eye, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const placeholder = 'https://via.placeholder.com/300x420?text=No+Cover';

const BookCard = ({ book, onBorrowed }) => {
  const { user } = useAuth();
  const isAvailable = (book?.availableCopies ?? 0) > 0;

  const handleBorrow = async () => {
    try {
      await loansAPI.borrow(book.id);
      onBorrowed && onBorrowed();
      alert('Book borrowed successfully!');
    } catch (e) {
      alert(e?.response?.data?.message || 'Borrow failed');
    }
  };

  return (
    <div className="card overflow-hidden group">
      <div className="relative aspect-[3/4] bg-gray-100">
        <img
          src={book?.coverImage || placeholder}
          alt={book?.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
        {!isAvailable && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Unavailable
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1">{book?.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-1">{book?.author}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs ${
            isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {isAvailable ? `${book.availableCopies} available` : 'On loan'}
          </span>
          <div className="flex items-center space-x-2">
            <Link
              to={`/book/${book.id}`}
              className="btn-secondary flex items-center space-x-1 text-sm"
            >
              <Eye size={16} />
              <span>View</span>
            </Link>
            {user && isAvailable && (
              <button onClick={handleBorrow} className="btn-primary flex items-center space-x-1 text-sm">
                <Bookmark size={16} />
                <span>Borrow</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;