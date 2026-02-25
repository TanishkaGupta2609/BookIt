/**
 * BookService.jsx
 * Booking page — lets users select a date and time slot for a service.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getServiceById,
  saveBooking,
  getBookings,
  generateId,
} from '../utils/localStorageHelper';

// Available time slots
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM',
];

export default function BookService() {
  const { serviceId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const svc = getServiceById(serviceId);
    if (!svc) { navigate('/dashboard'); return; }
    setService(svc);
  }, [serviceId]);

  // Recalculate booked slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    const bookings = getBookings().filter(
      b => b.serviceId === serviceId && b.date === selectedDate && b.status === 'confirmed'
    );
    setBookedSlots(bookings.map(b => b.time));
    setSelectedTime('');
  }, [selectedDate]);

  // Min date: today
  const minDate = new Date().toISOString().split('T')[0];
  // Max date: 60 days out
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleBook = async () => {
    if (!selectedDate) { setError('Please select a date.'); return; }
    if (!selectedTime) { setError('Please select a time slot.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceId, date: selectedDate, time: selectedTime }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Save to localStorage
      saveBooking({
        id: data.id,
        serviceId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });

      setSuccess('🎉 Booking confirmed! Redirecting…');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  if (!service) return (
    <div className="loading-screen">
      <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      <p>Loading service…</p>
    </div>
  );

  const durationLabel = service.duration >= 60
    ? `${Math.floor(service.duration / 60)}h ${service.duration % 60 ? `${service.duration % 60}m` : ''}`
    : `${service.duration}m`;

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="top-bar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            ← Back to Services
          </button>
        </div>

        <div className="page-header">
          <h2>Book Appointment</h2>
          <p>Select your preferred date and time to book this service.</p>
        </div>

        <div className="page-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            {/* Booking Form */}
            <div className="card">
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-error">⚠️ {error}</div>}

              {/* Step 1 — Date */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                  Step 1 · Select Date
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Appointment Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={minDate}
                    max={maxDate}
                    style={{ maxWidth: 240 }}
                  />
                </div>
              </div>

              <div className="divider" />

              {/* Step 2 — Time */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                  Step 2 · Select Time
                </div>

                {!selectedDate ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '12px 0' }}>
                    👆 Please select a date first to see available time slots.
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                      {bookedSlots.length > 0
                        ? `${bookedSlots.length} slot(s) already booked on this day.`
                        : 'All slots available for this date.'}
                    </div>
                    <div className="time-grid">
                      {TIME_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot ${selectedTime === slot ? 'selected' : ''} ${isBooked ? 'disabled' : ''}`}
                            onClick={() => !isBooked && setSelectedTime(slot)}
                            disabled={isBooked}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="divider" />

              {/* Summary + Book */}
              {selectedDate && selectedTime && (
                <div style={{
                  background: 'var(--accent-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 16,
                  marginBottom: 20,
                  border: '1px solid rgba(232,93,38,0.2)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                    📋 Booking Summary
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 2, color: 'var(--text-primary)' }}>
                    <div><strong>Service:</strong> {service.name}</div>
                    <div><strong>Date:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div><strong>Time:</strong> {selectedTime}</div>
                    <div><strong>Duration:</strong> {durationLabel}</div>
                    <div><strong>Price:</strong> ₹{Number(service.price).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleBook}
                disabled={loading || !selectedDate || !selectedTime || !!success}
              >
                {loading
                  ? <><div className="spinner" /> Confirming…</>
                  : '🗓️ Confirm Booking'
                }
              </button>
            </div>

            {/* Service Info Panel */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, #16213E 100%)',
                  margin: '-24px -24px 20px',
                  padding: '28px 24px',
                  borderRadius: '18px 18px 0 0',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', width: 100, height: 100, borderRadius: '50%',
                    background: 'rgba(232,93,38,0.15)', right: -20, top: -20
                  }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1 }}>
                    {service.name}
                  </h3>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, position: 'relative', zIndex: 1 }}>
                    by {service.ownerName}
                  </div>
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                  {service.description}
                </p>

                {[
                  { icon: '⏱', label: 'Duration', value: durationLabel },
                  { icon: '💰', label: 'Price', value: `₹${Number(service.price).toLocaleString('en-IN')}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid var(--border)',
                    fontSize: 14
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{icon} {label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px 16px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#166534' }}>
                ✅ <strong>Free cancellation</strong> — cancel anytime before the appointment.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
