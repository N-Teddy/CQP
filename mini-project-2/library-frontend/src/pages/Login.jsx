// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const from = loc.state?.from?.pathname || '/dashboard';

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(form);
    setSubmitting(false);
    if (res.success) nav(from, { replace: true });
    else alert(res.error);
  };

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input pl-10"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input pl-10"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link>
      </p>
    </div>
  );
};

export default Login;