/**
 * Signup.jsx — Registration page
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findUserByEmail, saveUser, generateId } from '../utils/localStorageHelper';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      // Check if email already exists
      if (findUserByEmail(form.email)) {
        setApiError('This email is already registered. Please log in.');
        setLoading(false);
        return;
      }

      // Get token from backend
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      // Save full user (including password) to localStorage
      const userToStore = {
        id: data.user.id,
        name: form.name.trim(),
        email: form.email.toLowerCase(),
        password: form.password, // stored locally only
        role: form.role,
        createdAt: new Date().toISOString(),
      };
      saveUser(userToStore);

      // Login
      const publicUser = { id: userToStore.id, name: userToStore.name, email: userToStore.email, role: userToStore.role };
      login(publicUser, data.token);
      navigate(form.role === 'owner' ? '/owner' : '/dashboard');
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
          Join thousands of service professionals and clients managing their appointments effortlessly.
        </p>

        <div className="auth-features">
          {[
            { icon: '🏪', text: 'As an Owner: List and manage your services' },
            { icon: '👤', text: 'As a User: Browse and book appointments' },
            { icon: '🔒', text: 'Secure, role-based access control' },
            { icon: '⚡', text: 'Instant booking confirmation' },
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
          <h2>Create account</h2>
          <p className="subtitle">Get started — it's completely free</p>

          {apiError && (
            <div className="alert alert-error">⚠️ {apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Role Selector */}
            <div className="form-group">
              <label className="form-label">I am a…</label>
              <div className="role-selector">
                {[
                  { value: 'user', icon: '👤', name: 'Client', desc: 'Book services' },
                  { value: 'owner', icon: '🏪', name: 'Owner', desc: 'Offer services' },
                ].map(({ value, icon, name, desc }) => (
                  <div
                    key={value}
                    className={`role-option ${form.role === value ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                  >
                    <div className="role-icon">{icon}</div>
                    <div className="role-name">{name}</div>
                    <div className="role-desc">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange('name')}
                autoComplete="name"
              />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> Creating account…</> : 'Create Account →'}
            </button>
          </form>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
