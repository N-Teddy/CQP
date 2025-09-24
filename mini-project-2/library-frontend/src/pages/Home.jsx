// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import BookCard from './BookCard';
import { booksAPI } from '../services/api';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [params, setParams] = useState({ page: 1, search: '', genre: '', available: false });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await booksAPI.getAll(params);
      const payload = res.data?.books || res.data?.data || [];
      setBooks(payload);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      console.error(e);
      setBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [params]);

  const onSearchChange = ({ search, genre, available }) => {
    setParams((p) => ({ ...p, page: 1, search, genre, available }));
  };

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setParams((prev) => ({ ...prev, page: p }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-white border mb-8">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-60" />
        <div className="relative p-8 md:p-12">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-600 text-white rounded-xl shadow-lg">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Discover Your Next Great Read
              </h1>
              <p className="text-gray-600">
                Browse thousands of books. Borrow instantly. Manage your loans and reservations with ease.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <SearchBar onChange={onSearchChange} />
          </div>
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-600">No books found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((b) => (
              <BookCard key={b.id} book={b} onBorrowed={fetchBooks} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => goPage(params.page - 1)}
              disabled={params.page <= 1}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronLeft className="inline-block mr-1" size={16} /> Prev
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              Page {params.page} of {totalPages}
            </span>
            <button
              onClick={() => goPage(params.page + 1)}
              disabled={params.page >= totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next <ChevronRight className="inline-block ml-1" size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;