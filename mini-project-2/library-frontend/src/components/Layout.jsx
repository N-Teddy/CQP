// src/components/Layout.jsx (Updated)
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  BookOpen, Home, User, Settings, LogOut, Menu, X,
  Bell, ChevronDown, LayoutDashboard, Library,
  BookMarked, Users, BarChart3, HelpCircle,
  Calendar, TrendingUp, Award, Clock, Heart,
  FileText, CreditCard, Shield, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [resourcesDropdown, setResourcesDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Catalog', href: '/books', icon: BookOpen },
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ] : []),
  ];

  const notifications = [
    { id: 1, title: 'Book Due Tomorrow', message: 'Return "The Great Gatsby" by tomorrow', time: '2h ago', unread: true, type: 'warning' },
    { id: 2, title: 'Reservation Ready', message: 'Your reserved book is ready for pickup', time: '5h ago', unread: true, type: 'success' },
    { id: 3, title: 'New Arrivals', message: '5 new books in your favorite genre', time: '1d ago', unread: false, type: 'info' },
    { id: 4, title: 'Fine Payment', message: 'Outstanding fine of 500 FCFA', time: '2d ago', unread: false, type: 'alert' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'alert': return '🔴';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="p-2 shadow-sm bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <span className="hidden text-xl font-bold text-gray-900 sm:block">CityLibrary</span>
              </Link>

              {/* Main Navigation */}
              <nav className="items-center hidden space-x-6 lg:flex">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors ${isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Admin Menu */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Help Button */}
              <button
                onClick={() => navigate('/help')}
                className="hidden p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 md:block"
              >
                <HelpCircle size={20} />
              </button>



              {/* Profile Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full shadow-sm bg-gradient-to-br from-primary-500 to-primary-600">
                      {user.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div className="items-center hidden space-x-1 md:flex">
                      <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {profileDropdown && (
                    <div className="absolute right-0 w-64 mt-2 bg-white border border-gray-100 shadow-xl rounded-xl">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-12 h-12 font-semibold text-white rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                            {user.firstName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-xs text-primary-600 font-medium mt-0.5">
                              {user.role === 'admin' ? 'Administrator' : `Member ID: ${user.membershipId}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdown(false)}
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdown(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/my-books"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdown(false)}
                        >
                          <BookMarked className="w-4 h-4 text-gray-400" />
                          <span>My Books</span>
                        </Link>


                        {user.role === 'admin' && (
                          <>
                            <div className="my-2 border-t border-gray-100"></div>
                            <Link
                              to="/admin"
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setProfileDropdown(false)}
                            >
                              <Settings className="w-4 h-4 text-gray-400" />
                              <span>Admin Panel</span>
                            </Link>

                          </>
                        )}

                        <div className="my-2 border-t border-gray-100"></div>
                        

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg shadow-sm bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
              <div className="flex items-center space-x-2">
                <Library className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">CityLibrary</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 transition-colors rounded-lg hover:bg-white/10"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {user && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {/* Main Navigation */}
              <div className="mb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
              {/* Admin Section */}
              {user?.role === 'admin' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Administration</p>
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-3 py-2 space-x-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Settings size={16} className="text-gray-400" />
                    <span>Admin Panel</span>
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-3 py-2 space-x-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <BarChart3 size={16} className="text-gray-400" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-3 py-2 space-x-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Users size={16} className="text-gray-400" />
                    <span>User Management</span>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Footer Actions */}
            <div className="p-4 border-t border-gray-200">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-200">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">


          <div className="pt-8 mt-8 border-t border-gray-200">
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} CityLibrary. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="text-sm text-gray-500 transition-colors hover:text-gray-700">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-gray-500 transition-colors hover:text-gray-700">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-sm text-gray-500 transition-colors hover:text-gray-700">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;