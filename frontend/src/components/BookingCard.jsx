/**
 * BookingCard.jsx
 * Shows booking info with optional cancel action.
 */
import React from 'react';

export default function BookingCard({ booking, service, onCancel }) {
  const statusClass = booking.status === 'confirmed' ? 'status-confirmed'
    : booking.status === 'cancelled' ? 'status-cancelled'
    : 'status-pending';

  const statusIcon = booking.status === 'confirmed' ? '✅'
    : booking.status === 'cancelled' ? '❌'
    : '⏳';

  const date = new Date(booking.date);
  const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="booking-card">
      <div className="booking-icon">🗓️</div>

      <div className="booking-info">
        <h4>{service?.name || 'Service Unavailable'}</h4>
        <div className="booking-meta">
          <span className="booking-meta-item">📅 {formattedDate}</span>
          <span className="booking-meta-item">⏰ {booking.time}</span>
          {service && <span className="booking-meta-item">💰 ₹{Number(service.price).toLocaleString('en-IN')}</span>}
        </div>

        {/* Status badge */}
        <div>
          <span className={`booking-status ${statusClass}`}>
            {statusIcon} {booking.status}
          </span>
        </div>

        {/* Booked by (owner view) */}
        {booking.userName && (
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            👤 {booking.userName} · {booking.userEmail}
          </div>
        )}
      </div>

      {/* Cancel action (only for confirmed user bookings) */}
      {onCancel && booking.status === 'confirmed' && (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onCancel(booking.id)}
          style={{ alignSelf: 'flex-start', flexShrink: 0 }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
