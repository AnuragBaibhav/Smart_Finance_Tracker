import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';
import API from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = form.username.trim();
    const validationErrors = {};
    if (!username) validationErrors.username = 'Username is required.';
    else if (username.length < 3) validationErrors.username = 'Username must be at least 3 characters.';
    if (!form.password) validationErrors.password = 'Password is required.';
    setErrors(validationErrors);
    setError('');
    if (Object.keys(validationErrors).length) return;
    setLoading(true);

    try {
      // First get CSRF token
      await API.get('/api-auth/login/');
      
      // Submit login form
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', form.password);

      await API.post('/api-auth/login/', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      await fetchUser();
      navigate('/');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">
          <div className="logo-icon"><Wallet size={22} /></div>
          <div>
            <h1 style={{ fontSize: 18, marginBottom: 0 }}>FinanceTracker</h1>
          </div>
        </div>

        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your account to continue</p>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => { setForm({ ...form, username: e.target.value }); setErrors({}); }}
              required
            />
            {errors.username && <div className="error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({}); }}
              required
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--gray-500)' }}>
          Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
