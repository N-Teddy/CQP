// src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Users, BookOpen, CalendarClock, AlertTriangle } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overdueLoans: 0 });
  const [overdues, setOverdues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, overdueRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOverdueLoans(),
      ]);

      const s = statsRes.data?.stats || statsRes.data?.data || {};
      setStats({
        totalUsers: s.totalUsers || 0,
        totalBooks: s.totalBooks || 0,
        activeLoans: s.activeLoans || 0,
        overdueLoans: s.overdueLoans || 0,
      });
      setOverdues(overdueRes.data?.loans || overdueRes.data?.data || []);
    } catch {
      setOverdues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
          <Users className="text-primary-600" />
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total Books</div>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
          </div>
          <BookOpen className="text-emerald-600" />
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Active Loans</div>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
          </div>
          <CalendarClock className="text-amber-600" />
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Overdue Loans</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdueLoans}</div>
          </div>
          <AlertTriangle className="text-red-600" />
        </div>
      </div>

      {/* Overdue loans */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Overdue Loans</h2>
        {loading ? (
          <div className="h-24 animate-pulse" />
        ) : overdues.length === 0 ? (
          <div className="text-gray-600">No overdue loans.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Book</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Due Date</th>
                  <th className="py-2 pr-4">Days Overdue</th>
                  <th className="py-2 pr-4">Fine (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                {overdues.map((loan) => {
                  const due = new Date(loan.dueDate);
                  const days = Math.max(0, Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24)));
                  const fine = days * 300;
                  return (
                    <tr key={loan.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{loan.book?.title}</td>
                      <td className="py-2 pr-4">{loan.user?.email || loan.user?.firstName}</td>
                      <td className="py-2 pr-4">{due.toLocaleDateString()}</td>
                      <td className="py-2 pr-4">{days}</td>
                      <td className="py-2 pr-4">{fine}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;