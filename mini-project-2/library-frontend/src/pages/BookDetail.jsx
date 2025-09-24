// src/pages/BookDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { booksAPI, loansAPI } from '../services/api';
import { BookOpen, Bookmark, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const placeholder = 'https://via.placeholder.com/480x640?text=No+Cover';

const BookDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await booksAPI.getById(id);
      const data = res.data?.book || res.data?.data || null;
      setBook(data);
    } catch (e) {
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBook(); }, [id]);

  const handleBorrow = async () => {
    if (!user) {
      alert('Please login to borrow a book.');
      return;
    }
    try {
      await loansAPI.borrow(book.id);
      alert('Borrowed successfully!');
      fetchBook();
    } catch (e) {
      alert(e?.response?.data?.message || 'Borrow failed');
    }
  };

  if (loading) return <div className="card h-96 animate-pulse" />;
  if (!book) return <div className="card p-6">Book not found.</div>;

  const isAvailable = (book.availableCopies ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="card overflow-hidden">
        <img
          src={book.coverImage || placeholder}
          alt={book.title}
          className="w-full h-full object-cover max-h-[560px]"
        />
      </div>
      <div>
        <button onClick={() => nav(-1)} className="btn-secondary mb-4">
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
        <p className="text-gray-600 mb-4">by {book.author}</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{book.genre}</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">ISBN: {book.isbn}</span>
        </div>
        <p className="text-gray-700 leading-relaxed mb-6">
          {book.description || 'No description available.'}
        </p>
        <div className="flex items-center justify-between card p-4 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary-600" />
            <div className="text-sm">
              <div>Total copies: {book.totalCopies}</div>
              <div>Available: {book.availableCopies}</div>
            </div>
          </div>
          {isAvailable && (
            <button onClick={handleBorrow} className="btn-primary">
              <Bookmark size={16} className="inline mr-1" />
              Borrow
            </button>
          )}
          {!isAvailable && <span className="text-red-600 text-sm">Currently unavailable</span>}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;