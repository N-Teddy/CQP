// src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { adminAPI, booksAPI, loansAPI } from '../services/api';
import {
  Users,
  BookOpen,
  CalendarClock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Package,
  UserCheck,
  XCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Clock,
  DollarSign,
  BookMarked,
  Settings,
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalReservations: 0,
    totalFines: 0
  });
  const [overdues, setOverdues] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, overdueRes, booksRes, loansRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOverdueLoans(),
        booksAPI.getAll({ page: 1, limit: 100 }),
        adminAPI.getAllLoans?.() || Promise.resolve({ data: [] })
      ]);

      const s = statsRes.data?.stats || statsRes.data?.data || {};
      setStats({
        totalUsers: s.totalUsers || 0,
        totalBooks: s.totalBooks || 0,
        activeLoans: s.activeLoans || 0,
        overdueLoans: s.overdueLoans || 0,
        totalReservations: s.totalReservations || 0,
        totalFines: s.totalFines || 0
      });
      setOverdues(overdueRes.data?.loans || overdueRes.data?.data || []);
      setBooks(booksRes.data?.books || booksRes.data?.data || []);
      setLoans(loansRes.data?.loans || loansRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.delete(bookId);
        fetchData();
      } catch (e) {
        alert('Failed to delete book');
      }
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await loansAPI.returnBook(loanId);
      fetchData();
      alert('Book returned successfully');
    } catch (e) {
      alert('Failed to return book');
    }
  };

  const handleExtendLoan = async (loanId) => {
    try {
      await loansAPI.renew(loanId);
      fetchData();
      alert('Loan extended successfully');
    } catch (e) {
      alert('Failed to extend loan');
    }
  };

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.includes(searchTerm)
  );

  const filteredLoans = loans.filter(loan => {
    if (filterStatus === 'overdue') return new Date(loan.dueDate) < new Date();
    if (filterStatus === 'active') return loan.status === 'active';
    if (filterStatus === 'returned') return loan.status === 'returned';
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download size={18} />
              Export Report
            </button>
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
        <p className="text-gray-600">Manage your library's catalog, loans, and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <Package className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalBooks}</div>
          <div className="text-sm text-gray-500">Total Books</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <CalendarClock className="h-8 w-8 text-amber-600" />
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeLoans}</div>
          <div className="text-sm text-gray-500">Active Loans</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overdueLoans}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <BookMarked className="h-8 w-8 text-purple-600" />
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalReservations}</div>
          <div className="text-sm text-gray-500">Reservations</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalFines} FCFA</div>
          <div className="text-sm text-gray-500">Total Fines</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'catalog', label: 'Catalog Management', icon: BookOpen },
              { id: 'loans', label: 'Loans & Borrowing', icon: CalendarClock },
              { id: 'overdue', label: 'Overdue Items', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={18} />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">New book borrowed</p>
                            <p className="text-xs text-gray-500">John Doe borrowed "The Great Gatsby"</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">2m ago</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={18} />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowAddBookModal(true)}
                      className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
                    >
                      <Plus className="h-5 w-5 text-primary-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Add Book</p>
                      <p className="text-xs text-gray-500">Add new book to catalog</p>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
                      <UserCheck className="h-5 w-5 text-green-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Add User</p>
                      <p className="text-xs text-gray-500">Register new member</p>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
                      <FileText className="h-5 w-5 text-blue-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Generate Report</p>
                      <p className="text-xs text-gray-500">Monthly statistics</p>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
                      <Upload className="h-5 w-5 text-purple-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Import Data</p>
                      <p className="text-xs text-gray-500">Bulk import books</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catalog Management Tab */}
          {activeTab === 'catalog' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAddBookModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add New Book
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 border-b">
                        <th className="pb-3 pr-4">Book Details</th>
                        <th className="pb-3 pr-4">Author</th>
                        <th className="pb-3 pr-4">ISBN</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Available</th>
                        <th className="pb-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((book) => (
                        <tr key={book.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={book.coverImage || 'https://via.placeholder.com/40x60/f3f4f6/9ca3af?text=Book'}
                                alt={book.title}
                                className="w-10 h-14 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{book.title}</p>
                                <p className="text-sm text-gray-500">{book.genre}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-gray-700">{book.author}</td>
                          <td className="py-4 pr-4 text-gray-700">{book.isbn}</td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${book.availableCopies > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {book.availableCopies > 0 ? 'Available' : 'All Loaned'}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="text-sm text-gray-700">
                              {book.availableCopies} / {book.totalCopies}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingBook(book)}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Loans & Borrowing Tab */}
          {activeTab === 'loans' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Loans</option>
                    <option value="active">Active</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                  </select>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter size={16} />
                    Showing {filteredLoans.length} loans
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Download size={18} />
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-500 border-b">
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 pr-4">Book</th>
                      <th className="pb-3 pr-4">Borrow Date</th>
                      <th className="pb-3 pr-4">Due Date</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Fine</th>
                      <th className="pb-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.map((loan) => {
                      const isOverdue = new Date(loan.dueDate) < new Date();
                      const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                      const fine = daysOverdue * 300;

                      return (
                        <tr key={loan.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 pr-4">
                            <div>
                              <p className="font-medium text-gray-900">{loan.user?.firstName} {loan.user?.lastName}</p>
                              <p className="text-sm text-gray-500">{loan.user?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <div>
                              <p className="font-medium text-gray-900">{loan.book?.title}</p>
                              <p className="text-sm text-gray-500">ISBN: {loan.book?.isbn}</p>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-gray-700">
                            {new Date(loan.borrowDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                              {new Date(loan.dueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${loan.status === 'returned'
                                ? 'bg-gray-100 text-gray-700'
                                : isOverdue
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                              {loan.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            {fine > 0 && (
                              <span className="text-red-600 font-medium">{fine} FCFA</span>
                            )}
                          </td>
                          <td className="py-4">
                            {loan.status !== 'returned' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleReturnBook(loan.id)}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle size={14} />
                                  Return
                                </button>
                                <button
                                  onClick={() => handleExtendLoan(loan.id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                  <RefreshCw size={14} />
                                  Extend
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overdue Items Tab */}
          {activeTab === 'overdue' && (
            <div>
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      {overdues.length} overdue items requiring attention
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Total fines accumulated: {overdues.reduce((sum, loan) => {
                        const days = Math.max(0, Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                        return sum + (days * 300);
                      }, 0)} FCFA
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ) : overdues.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No overdue loans at the moment!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 border-b">
                        <th className="pb-3 pr-4">Book</th>
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 pr-4">Contact</th>
                        <th className="pb-3 pr-4">Due Date</th>
                        <th className="pb-3 pr-4">Days Overdue</th>
                        <th className="pb-3 pr-4">Fine (FCFA)</th>
                        <th className="pb-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdues.map((loan) => {
                        const due = new Date(loan.dueDate);
                        const days = Math.max(0, Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24)));
                        const fine = days * 300;

                        return (
                          <tr key={loan.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 pr-4">
                              <div>
                                <p className="font-medium text-gray-900">{loan.book?.title}</p>
                                <p className="text-sm text-gray-500">{loan.book?.author}</p>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <p className="font-medium text-gray-900">
                                {loan.user?.firstName} {loan.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">ID: {loan.user?.membershipId}</p>
                            </td>
                            <td className="py-4 pr-4">
                              <p className="text-sm text-gray-700">{loan.user?.email}</p>
                              <p className="text-sm text-gray-500">{loan.user?.phone || 'No phone'}</p>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="text-red-600 font-medium">
                                {due.toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                {days} days
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="text-red-600 font-bold">{fine}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
                                  Send Reminder
                                </button>
                                <button
                                  onClick={() => handleReturnBook(loan.id)}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Mark Returned
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      {(showAddBookModal || editingBook) && (
        <BookFormModal
          book={editingBook}
          onClose={() => {
            setShowAddBookModal(false);
            setEditingBook(null);
          }}
          onSave={() => {
            fetchData();
            setShowAddBookModal(false);
            setEditingBook(null);
          }}
        />
      )}
    </div>
  );
};

// Book Form Modal Component
const BookFormModal = ({ book, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    genre: book?.genre || '',
    totalCopies: book?.totalCopies || 1,
    availableCopies: book?.availableCopies || 1,
    description: book?.description || '',
    coverImage: book?.coverImage || ''
  });

  // src/pages/Admin.jsx (continued - BookFormModal)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (book) {
        await booksAPI.update(book.id, formData);
        alert('Book updated successfully');
      } else {
        await booksAPI.create(formData);
        alert('Book added successfully');
      }
      onSave();
    } catch (e) {
      alert('Failed to save book');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {book ? 'Edit Book' : 'Add New Book'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN *
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre *
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select Genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Children">Children</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Copies *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Copies *
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalCopies}
                value={formData.availableCopies}
                onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/book-cover.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter book description..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {book ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
