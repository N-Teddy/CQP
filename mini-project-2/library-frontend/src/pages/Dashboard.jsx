// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { loansAPI, reservationsAPI, userService } from '../services/api';
import {
  BookOpen,
  Clock,
  AlertCircle,
  RefreshCw,
  Undo2,
  X,
  Calendar,
  User,
  BookMarked,
  TrendingUp,
  Library,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState({ totalFine: 0, fineDetails: [] });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [loansRes, resvRes, finesRes] = await Promise.all([
        loansAPI.getUserLoans(),
        reservationsAPI.getUserReservations(),
        userService.getFines?.() || Promise.resolve({ data: { totalFine: 0, fineDetails: [] } })
      ]);
      setLoans(loansRes.data?.loans || loansRes.data?.data || []);
      setReservations(resvRes.data?.reservations || resvRes.data?.data || []);
      setFines(finesRes.data || { totalFine: 0, fineDetails: [] });
    } catch (e) {
      setLoans([]); setReservations([]); setFines({ totalFine: 0, fineDetails: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const returnBook = async (loanId) => {
    try {
      await loansAPI.returnBook(loanId);
      fetchAll();
    } catch (e) { alert('Return failed'); }
  };

  const renewLoan = async (loanId) => {
    try {
      await loansAPI.renew(loanId);
      fetchAll();
    } catch (e) { alert('Renew failed'); }
  };

  const cancelReservation = async (id) => {
    try {
      await reservationsAPI.cancel(id);
      fetchAll();
    } catch (e) { alert('Cancel failed'); }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return { color: 'text-red-600 bg-red-50 border-red-200', text: `${Math.abs(days)} days overdue`, icon: XCircle };
    if (days === 0) return { color: 'text-amber-600 bg-amber-50 border-amber-200', text: 'Due today', icon: AlertCircle };
    if (days <= 3) return { color: 'text-amber-600 bg-amber-50 border-amber-200', text: `${days} days left`, icon: Clock };
    return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', text: `${days} days left`, icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back to your Library</h1>
            <p className="text-primary-100">Manage your books and track your reading journey</p>
          </div>
          <Library className="h-12 w-12 text-primary-200" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            {loans.length > 0 && <TrendingUp className="h-4 w-4 text-gray-400" />}
          </div>
          <div className="text-2xl font-bold text-gray-900">{loans.length}</div>
          <div className="text-sm text-gray-500 mt-1">Active Loans</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookMarked className="h-5 w-5 text-purple-600" />
            </div>
            {reservations.length > 0 && <Clock className="h-4 w-4 text-gray-400" />}
          </div>
          <div className="text-2xl font-bold text-gray-900">{reservations.length}</div>
          <div className="text-sm text-gray-500 mt-1">Reservations</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            {fines.totalFine > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">Action Required</span>}
          </div>
          <div className="text-2xl font-bold text-amber-600">{fines.totalFine} FCFA</div>
          <div className="text-sm text-gray-500 mt-1">Outstanding Fines</div>
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Active Loans</h2>
          </div>
          <span className="text-sm text-gray-500">{loans.length} book{loans.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active loans</p>
            <p className="text-sm text-gray-400 mt-1">Visit the catalog to borrow books</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => {
              const status = getDueDateStatus(loan.dueDate);
              const StatusIcon = status.icon;

              return (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{loan.book?.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">by {loan.book?.author || 'Unknown Author'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.text}
                        </span>
                        <span className="text-xs text-gray-400">
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => renewLoan(loan.id)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <RefreshCw size={14} />
                        Renew
                      </button>
                      <button
                        onClick={() => returnBook(loan.id)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Undo2 size={14} />
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservations Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
          </div>
          <span className="text-sm text-gray-500">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-8">
            <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active reservations</p>
            <p className="text-sm text-gray-400 mt-1">Reserve books that are currently unavailable</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{reservation.book?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">by {reservation.book?.author || 'Unknown Author'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${reservation.status === 'ready'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {reservation.status === 'ready' ? 'Ready for pickup' : reservation.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Reserved: {new Date(reservation.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelReservation(reservation.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 ml-4"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;