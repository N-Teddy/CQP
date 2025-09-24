// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import { booksAPI } from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Library
} from 'lucide-react';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [params, setParams] = useState({ page: 1, search: '', genre: '', available: false });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [featuredCategories] = useState([
    { name: 'New Arrivals', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { name: 'Trending Now', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { name: 'Quick Reads', icon: Clock, color: 'from-amber-500 to-orange-500' },
    { name: 'Award Winners', icon: Award, color: 'from-emerald-500 to-teal-500' }
  ]);

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 mb-8">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />

        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Library className="h-8 w-8 text-white" />
              </div>
              <span className="text-white/90 font-medium">Welcome to CityLibrary</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Discover Your Next<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                Great Adventure
              </span>
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-2xl">
              Explore thousands of books across all genres. Borrow instantly, manage your reading list,
              and join our vibrant community of book lovers.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <BookOpen className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">50,000+ Books</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">New Daily</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">24/7 Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <SearchBar onChange={onSearchChange} />

      {/* Featured Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {featuredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              className="group relative overflow-hidden rounded-xl p-4 bg-white border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {params.search ? `Search Results for "${params.search}"` : 'All Books'}
          </h2>
          <span className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${books.length} books found`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-[3/4] mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onBorrowed={fetchBooks} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goPage(params.page - 1)}
                    disabled={params.page <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${params.page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-400">...</span>
                        <button
                          onClick={() => goPage(totalPages)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${params.page === totalPages
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => goPage(params.page + 1)}
                    disabled={params.page >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;