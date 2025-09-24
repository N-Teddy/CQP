// src/components/BookCard.jsx
import { useState } from 'react';
import { BookOpen, Eye, Bookmark, Star, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loansAPI, reservationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const placeholder = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop';

const BookCard = ({ book, onBorrowed }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isAvailable = (book?.availableCopies ?? 0) > 0;

  const handleBorrow = async () => {
    if (!user) {
      alert('Please login to borrow books');
      return;
    }

    setIsLoading(true);
    try {
      if (isAvailable) {
        await loansAPI.borrow(book.id);
        alert('Book borrowed successfully!');
      } else {
        await reservationsAPI.create(book.id);
        alert('Book reserved successfully!');
      }
      onBorrowed && onBorrowed();
    } catch (e) {
      alert(e?.response?.data?.message || 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] mb-3 shadow-md group-hover:shadow-xl transition-all">
        <img
          src={book?.coverImage || placeholder}
          alt={book?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link
              to={`/book/${book.id}`}
              className="w-full mb-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              View Details
            </Link>
            {user && (
              <button
                onClick={handleBorrow}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${isAvailable
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isAvailable ? (
                  <>
                    <Bookmark size={16} />
                    Borrow Now
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    Reserve
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!isAvailable && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg shadow-sm">
              Unavailable
            </span>
          )}
          {book?.isNew && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Rating Badge */}
        {book?.rating && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium text-gray-900">{book.rating}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {book?.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-1">{book?.author}</p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {isAvailable ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-700">
                  {book.availableCopies} available
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-700">
                  On loan
                </span>
              </div>
            )}
          </div>

          {book?.genre && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {book.genre}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;