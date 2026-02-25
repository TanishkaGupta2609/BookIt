/**
 * ServiceCard.jsx
 * Displays a service with optional owner controls (edit/delete)
 * or user action (book now).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ServiceCard({ service, onEdit, onDelete, showBooking = false }) {
  const { isOwner } = useAuth();
  const navigate = useNavigate();

  const durationLabel = service.duration >= 60
    ? `${Math.floor(service.duration / 60)}h ${service.duration % 60 ? `${service.duration % 60}m` : ''}`
    : `${service.duration}m`;

  return (
    <div className="service-card">
      {/* Card Top */}
      <div className="service-card-top">
        <h3>{service.name}</h3>
        <div className="service-card-badge">
          ₹{Number(service.price).toLocaleString('en-IN')}
        </div>
      </div>

      {/* Card Body */}
      <div className="service-card-body">
        <p>{service.description || 'No description provided.'}</p>

        <div className="service-meta">
          <div className="service-meta-item">
            ⏱ <strong>{durationLabel}</strong>
          </div>
          <div className="service-meta-item">
            💰 <strong>₹{Number(service.price).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="service-card-actions">
          {isOwner && onEdit && onDelete ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(service)}
                style={{ flex: 1 }}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(service.id)}
                style={{ flex: 1 }}
              >
                🗑️ Delete
              </button>
            </>
          ) : showBooking ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/book/${service.id}`)}
              style={{ flex: 1 }}
            >
              Book Now →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
