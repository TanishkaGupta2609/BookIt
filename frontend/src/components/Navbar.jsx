/**
 * Navbar.jsx
 * Sidebar navigation with role-based menu items and user info.
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OWNER_LINKS = [
  { to: '/owner', icon: '⬛', label: 'Dashboard', end: true },
  { to: '/owner/add-service', icon: '✚', label: 'Add Service' },
];

const USER_LINKS = [
  { to: '/dashboard', icon: '⬛', label: 'Dashboard', end: true },
];

export default function Navbar() {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = isOwner ? OWNER_LINKS : USER_LINKS;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h1>Book<span>It</span></h1>
        <p>{isOwner ? 'Owner Portal' : 'Client Portal'}</p>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 14px', marginBottom: 8 }}>
          Navigation
        </div>

        {links.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 14px', margin: '20px 0 8px' }}>
          Quick Actions
        </div>

        {isOwner ? (
          <NavLink to="/owner/add-service" style={{ background: 'rgba(232,93,38,0.15)', color: '#FF8A60' }}>
            <span className="nav-icon">📋</span>
            New Service
          </NavLink>
        ) : (
          <NavLink to="/dashboard">
            <span className="nav-icon">🗓️</span>
            Browse Services
          </NavLink>
        )}
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            ↩
          </button>
        </div>
      </div>
    </nav>
  );
}
