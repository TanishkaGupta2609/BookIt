/**
 * ProtectedRoute.jsx
 * Wraps routes that require auth. Redirects to /login if not authenticated.
 * Optionally enforces a specific role.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
        <p>Loading your workspace…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Redirect to correct dashboard if role doesn't match
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/dashboard'} replace />;
  }

  return children;
}
