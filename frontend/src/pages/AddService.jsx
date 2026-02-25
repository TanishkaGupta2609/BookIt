/**
 * AddService.jsx
 * Form page for adding or editing a service (owner only).
 * editMode prop enables update functionality.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  saveService,
  updateService,
  getServiceById,
  generateId,
} from '../utils/localStorageHelper';

const DURATION_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: 'Custom', value: 'custom' },
];

export default function AddService({ editMode = false }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: 60,
    customDuration: '',
    price: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  // Populate form for edit mode
  useEffect(() => {
    if (editMode && id) {
      const svc = getServiceById(id);
      if (svc && svc.ownerId === user.id) {
        const isDuration = DURATION_OPTIONS.some(d => d.value === svc.duration && d.value !== 'custom');
        setForm({
          name: svc.name,
          description: svc.description,
          duration: isDuration ? svc.duration : 'custom',
          customDuration: !isDuration ? svc.duration : '',
          price: svc.price,
        });
      } else {
        navigate('/owner');
      }
    }
  }, [editMode, id]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Service name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (form.duration === 'custom') {
      if (!form.customDuration || isNaN(form.customDuration) || Number(form.customDuration) < 1) {
        errs.customDuration = 'Enter a valid duration in minutes';
      }
    }
    if (!form.price) errs.price = 'Price is required';
    else if (isNaN(form.price) || Number(form.price) < 0) errs.price = 'Enter a valid price';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const durationVal = form.duration === 'custom' ? Number(form.customDuration) : form.duration;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: durationVal,
      price: form.price,
    };

    try {
      if (editMode) {
        await fetch(`/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        updateService(id, payload);
        setSuccess('Service updated successfully!');
      } else {
        const res = await fetch('/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        saveService({
          ...payload,
          id: data.id,
          ownerId: user.id,
          ownerName: user.name,
          createdAt: new Date().toISOString(),
        });
        setSuccess('Service created successfully!');
      }

      setTimeout(() => navigate('/owner'), 1200);
    } catch (err) {
      setApiError(err.message || 'Failed to save service.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? e.target.value : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="top-bar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/owner')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="page-header">
          <h2>{editMode ? 'Edit Service' : 'Add New Service'}</h2>
          <p>{editMode ? 'Update your service details below.' : 'Fill in the details to create a new service offering.'}</p>
        </div>

        <div className="page-body">
          <div className="card" style={{ maxWidth: 640 }}>
            {success && <div className="alert alert-success">✅ {success}</div>}
            {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Service Name */}
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g., Haircut & Styling, Deep Tissue Massage"
                  value={form.name}
                  onChange={handleChange('name')}
                />
                {errors.name && <div className="form-error">⚠ {errors.name}</div>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe what this service includes, what clients can expect…"
                  value={form.description}
                  onChange={handleChange('description')}
                  rows={4}
                />
                {errors.description && <div className="form-error">⚠ {errors.description}</div>}
              </div>

              {/* Duration + Price Row */}
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duration *</label>
                  <select
                    className="form-select"
                    value={form.duration}
                    onChange={handleChange('duration')}
                  >
                    {DURATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {form.duration === 'custom' && (
                    <div style={{ marginTop: 8 }}>
                      <input
                        type="number"
                        className={`form-input ${errors.customDuration ? 'error' : ''}`}
                        placeholder="Duration in minutes"
                        value={form.customDuration}
                        onChange={handleChange('customDuration')}
                        min="1"
                      />
                      {errors.customDuration && <div className="form-error">⚠ {errors.customDuration}</div>}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    className={`form-input ${errors.price ? 'error' : ''}`}
                    placeholder="e.g., 500"
                    value={form.price}
                    onChange={handleChange('price')}
                    min="0"
                  />
                  {errors.price && <div className="form-error">⚠ {errors.price}</div>}
                </div>
              </div>

              <div className="divider" />

              {/* Preview */}
              {form.name && (
                <div style={{
                  padding: '16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  marginBottom: 20
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Preview
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{form.name}</div>
                  {form.description && <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{form.description}</div>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {form.duration && <span>⏱ {form.duration === 'custom' ? `${form.customDuration || '?'} min` : `${form.duration} min`}</span>}
                    {form.price && <span>💰 ₹{Number(form.price).toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/owner')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading
                    ? <><div className="spinner" /> {editMode ? 'Updating…' : 'Creating…'}</>
                    : editMode ? '✓ Update Service' : '+ Create Service'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
