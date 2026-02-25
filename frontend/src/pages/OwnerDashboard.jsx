/**
 * OwnerDashboard.jsx
 * Main dashboard for service owners — shows stats, services, and bookings.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../context/AuthContext';
import {
  getServicesByOwner,
  getBookingsByOwner,
  deleteService,
  getServices,
} from '../utils/localStorageHelper';

export default function OwnerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('services'); // 'services' | 'bookings'
  const [search, setSearch] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  // Load data from localStorage
  const loadData = () => {
    setServices(getServicesByOwner(user.id));
    setBookings(getBookingsByOwner(user.id));
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (service) => {
    navigate(`/owner/edit-service/${service.id}`);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Delete this service? All associated bookings will also be removed.')) return;

    try {
      await fetch(`/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}

    deleteService(serviceId);
    loadData();
    setDeleteMsg('Service deleted successfully.');
    setTimeout(() => setDeleteMsg(''), 3000);
  };

  const allServices = getServices(); // for enriching bookings

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => {
      const svc = allServices.find(s => s.id === b.serviceId);
      return sum + (svc ? Number(svc.price) : 0);
    }, 0);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Top bar */}
        <div className="top-bar">
          <div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Good day,</span>
            <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 6 }}>{user?.name} 👋</span>
          </div>
          <div className="top-bar-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/owner/add-service')}
            >
              + Add Service
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <h2>Owner Dashboard</h2>
          <p>Manage your services and track bookings in one place.</p>
        </div>

        <div className="page-body">
          {deleteMsg && <div className="alert alert-success">✅ {deleteMsg}</div>}

          {/* Stats Row */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-label">Total Services</div>
              <div className="stat-value">{services.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🗓️</div>
              <div className="stat-label">Total Bookings</div>
              <div className="stat-value">{bookings.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Confirmed</div>
              <div className="stat-value">{bookings.filter(b => b.status === 'confirmed').length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Est. Revenue</div>
              <div className="stat-value" style={{ fontSize: 22 }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="section-header">
            <div className="flex gap-2">
              <button
                className={`btn ${view === 'services' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setView('services')}
              >
                📋 Services ({services.length})
              </button>
              <button
                className={`btn ${view === 'bookings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setView('bookings')}
              >
                🗓️ Bookings ({bookings.length})
              </button>
            </div>

            {view === 'services' && (
              <div className="search-bar">
                <span>🔍</span>
                <input
                  placeholder="Search services…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Services View */}
          {view === 'services' && (
            filteredServices.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>{search ? 'No matching services' : 'No services yet'}</h3>
                <p>{search ? 'Try a different search term.' : 'Add your first service to start receiving bookings from clients.'}</p>
                {!search && (
                  <button className="btn btn-primary" onClick={() => navigate('/owner/add-service')}>
                    + Add First Service
                  </button>
                )}
              </div>
            ) : (
              <div className="card-grid">
                {filteredServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )
          )}

          {/* Bookings View */}
          {view === 'bookings' && (
            bookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗓️</span>
                <h3>No bookings yet</h3>
                <p>When clients book your services, their appointments will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.map(booking => {
                  const svc = allServices.find(s => s.id === booking.serviceId);
                  return (
                    <BookingCard key={booking.id} booking={booking} service={svc} />
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
