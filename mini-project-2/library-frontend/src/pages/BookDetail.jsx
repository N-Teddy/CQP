// src/pages/BookDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { booksAPI, loansAPI, reservationsAPI } from '../services/api';
import {
  BookOpen,
  Bookmark,
  ArrowLeft,
  Star,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  Share2,
  Download,
  Tag,
  Award,
  Globe,
  FileText,
  BarChart3,
  TrendingUp,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const placeholder = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop';

const BookDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

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
      nav('/login');
      return;
    }
    setIsProcessing(true);
    try {
      await loansAPI.borrow(book.id);
      alert('Book borrowed successfully!');
      fetchBook();
    } catch (e) {
      alert(e?.response?.data?.message || 'Borrow failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      alert('Please login to reserve a book.');
      nav('/login');
      return;
    }
    setIsProcessing(true);
    try {
      await reservationsAPI.create(book.id);
      alert('Book reserved successfully!');
      fetchBook();
    } catch (e) {
      alert(e?.response?.data?.message || 'Reservation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-200 rounded-2xl aspect-[3/4]"></div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-500 mb-6">The book you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => nav('/')} className="btn-primary">
            <ArrowLeft className="inline mr-2" size={16} />
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = (book.availableCopies ?? 0) > 0;
  const rating = book.rating || 4.5;
  const reviewCount = book.reviewCount || 128;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button onClick={() => nav('/')} className="hover:text-primary-600 transition-colors">
          Home
        </button>
        <span>/</span>
        <button onClick={() => nav('/books')} className="hover:text-primary-600 transition-colors">
          Books
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{book.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Cover & Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="relative group">
              <div className="overflow-hidden rounded-2xl shadow-xl bg-gray-100">
                <img
                  src={book.coverImage || placeholder}
                  alt={book.title}
                  className="w-full h-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Quick Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={toggleFavorite}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Availability Badge */}
              <div className="absolute bottom-4 left-4">
                {isAvailable ? (
                  <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Unavailable</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {isAvailable ? (
                <button
                  onClick={handleBorrow}
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5" />
                      Borrow This Book
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleReserve}
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5" />
                      Reserve for Later
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Book Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Copies</span>
                <span className="font-semibold text-gray-900">{book.totalCopies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-semibold text-emerald-600">{book.availableCopies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Times Borrowed</span>
                <span className="font-semibold text-gray-900">{book.borrowCount || 245}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2">
          {/* Title & Author */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{book.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="text-lg">by <span className="text-gray-900 font-medium">{book.author}</span></span>
              {book.publicationYear && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{book.publicationYear}</span>
                </>
              )}
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{rating}</span>
              <span className="text-gray-500">({reviewCount} reviews)</span>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Write a Review
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
              {book.genre}
            </span>
            {book.isbn && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                ISBN: {book.isbn}
              </span>
            )}
            {book.language && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {book.language}
              </span>
            )}
            {book.pages && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {book.pages} pages
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium capitalize transition-colors relative ${activeTab === tab
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {book.description || 'No description available for this book.'}
                </p>

                {book.summary && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{book.summary}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Publisher</h4>
                    <p className="text-gray-900">{book.publisher || 'Unknown Publisher'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Publication Date</h4>
                    <p className="text-gray-900">{book.publicationDate || 'Unknown'}</p>
// src/pages/BookDetail.jsx (continued)
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Language</h4>
                    <p className="text-gray-900">{book.language || 'English'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">ISBN</h4>
                    <p className="text-gray-900">{book.isbn || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Pages</h4>
                    <p className="text-gray-900">{book.pages || 'Unknown'} pages</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                    <p className="text-gray-900">{book.category || book.genre}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Edition</h4>
                    <p className="text-gray-900">{book.edition || 'First Edition'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <p className="text-gray-900">{book.location || 'Section A, Shelf 3'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{rating}</div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{reviewCount} reviews</div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-3">{stars}</span>
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : 5}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-10">
                            {stars === 5 ? '60%' : stars === 4 ? '25%' : stars === 3 ? '10%' : '5%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[
                    {
                      name: 'Sarah Johnson',
                      date: '2 weeks ago',
                      rating: 5,
                      comment: 'An absolutely captivating read! The author\'s writing style is engaging and the plot keeps you hooked from start to finish.'
                    },
                    {
                      name: 'Michael Chen',
                      date: '1 month ago',
                      rating: 4,
                      comment: 'Great book with interesting characters. The middle section dragged a bit, but overall a worthwhile read.'
                    },
                    {
                      name: 'Emily Davis',
                      date: '2 months ago',
                      rating: 5,
                      comment: 'Couldn\'t put it down! Finished it in one sitting. Highly recommend to anyone who enjoys this genre.'
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{review.name}</div>
                              <div className="text-sm text-gray-500">{review.date}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Action Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-semibold text-gray-900">{book.title}</div>
            <div className="text-sm text-gray-500">
              {isAvailable ? `${book.availableCopies} available` : 'Currently unavailable'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleFavorite} className="p-2">
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            <button className="p-2">
              <Share2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        {isAvailable ? (
          <button
            onClick={handleBorrow}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Borrow This Book'}
          </button>
        ) : (
          <button
            onClick={handleReserve}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Reserve for Later'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
