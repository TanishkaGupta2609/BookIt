/**
 * Login.jsx — Authentication page for existing users
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findUserByEmail } from '../utils/localStorageHelper';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      // Verify credentials against localStorage users
      const storedUser = findUserByEmail(form.email);
      if (!storedUser || storedUser.password !== form.password) {
        setApiError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Get token from backend
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user, data.token);
      navigate(data.user.role === 'owner' ? '/owner' : '/dashboard');
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">Book<span>It</span></div>
        <p className="auth-tagline">
          The simplest way to manage appointments and grow your service business.
        </p>

        <div className="auth-features">
          {[
            { icon: '📅', text: 'Smart appointment scheduling' },
            { icon: '🔔', text: 'Real-time booking management' },
            { icon: '📊', text: 'Track your services & revenue' },
            { icon: '🛡️', text: 'Secure role-based access' },
          ].map(({ icon, text }) => (
            <div className="auth-feature" key={text}>
              <div className="auth-feature-icon">{icon}</div>
              <span className="auth-feature-text">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your account to continue</p>

          {apiError && (
            <div className="alert alert-error">⚠️ {apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
              />
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-link">
            Don't have an account? <Link to="/signup">Create one</Link>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 24, padding: '14px 16px',
            background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8
          }}>
            <strong style={{ color: 'var(--accent)' }}>💡 Quick Start</strong><br />
            Sign up first to create an account, then log in.
            Choose <strong>Owner</strong> to manage services or <strong>User</strong> to book them.
          </div>
        </div>
      </div>
    </div>
  );
}
