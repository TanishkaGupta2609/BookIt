/**
 * UserDashboard.jsx
 * Dashboard for clients — browse services and manage bookings.
 */
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../context/AuthContext';
import {
  getServices,
  getBookingsByUser,
  deleteBooking,
} from '../utils/localStorageHelper';

export default function UserDashboard() {
  const { user, token } = useAuth();

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('services');
  const [search, setSearch] = useState('');
  const [cancelMsg, setCancelMsg] = useState('');

  const loadData = () => {
    setServices(getServices());
    setBookings(getBookingsByUser(user.id));
  };

  useEffect(() => { loadData(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;

    try {
      await fetch(`/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}

    deleteBooking(bookingId);
    loadData();
    setCancelMsg('Booking cancelled successfully.');
    setTimeout(() => setCancelMsg(''), 3000);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Welcome back,</span>
            <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 6 }}>{user?.name} 👋</span>
          </div>
        </div>

        <div className="page-header">
          <h2>Client Dashboard</h2>
          <p>Discover services and manage your appointments.</p>
        </div>

        <div className="page-body">
          {cancelMsg && <div className="alert alert-success">✅ {cancelMsg}</div>}

          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-label">Available Services</div>
              <div className="stat-value">{services.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🗓️</div>
              <div className="stat-label">My Bookings</div>
              <div className="stat-value">{bookings.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Confirmed</div>
              <div className="stat-value">{confirmedBookings}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-label">Cancelled</div>
              <div className="stat-value">{cancelledBookings}</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="section-header">
            <div className="flex gap-2">
              <button
                className={`btn ${view === 'services' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setView('services')}
              >
                🏪 Browse Services
              </button>
              <button
                className={`btn ${view === 'bookings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setView('bookings')}
              >
                🗓️ My Bookings ({bookings.length})
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
                <span className="empty-icon">🏪</span>
                <h3>{search ? 'No matching services' : 'No services available'}</h3>
                <p>{search ? 'Try a different search term.' : 'Service owners will add their offerings soon. Check back later!'}</p>
              </div>
            ) : (
              <div className="card-grid">
                {filteredServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showBooking={true}
                  />
                ))}
              </div>
            )
          )}

          {/* My Bookings View */}
          {view === 'bookings' && (
            bookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗓️</span>
                <h3>No bookings yet</h3>
                <p>Browse available services and book your first appointment.</p>
                <button className="btn btn-primary" onClick={() => setView('services')}>
                  Browse Services
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.map(booking => {
                  const svc = services.find(s => s.id === booking.serviceId);
                  return (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      service={svc}
                      onCancel={handleCancel}
                    />
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
