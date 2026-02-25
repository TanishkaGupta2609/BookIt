/**
 * Service Booking App - Express Backend
 * Note: All data is stored in frontend localStorage.
 * This backend provides JWT token generation/verification only.
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'service_booking_secret_key_2024';

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ─── Middleware ───────────────────────────────────────────────────────────────

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// POST /signup — validates user data, returns a signed JWT
app.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['owner', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Role must be owner or user' });
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userData = { id: userId, name, email, role };
  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: userData, message: 'Signup successful' });
});

// POST /login — verifies credentials passed from frontend localStorage
app.post('/login', (req, res) => {
  const { email, role, name, id } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Frontend already verified password against localStorage
  // We just issue a new token here
  const userData = { id, name, email, role };
  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: userData, message: 'Login successful' });
});

// ─── Service Routes ───────────────────────────────────────────────────────────

// All service data lives in localStorage; these endpoints return success confirmations
app.get('/services', authenticate, (req, res) => {
  res.json({ message: 'Fetch services from localStorage', userId: req.user.id });
});

app.post('/services', authenticate, (req, res) => {
  const { name, description, duration, price } = req.body;
  if (!name || !description || !duration || !price) {
    return res.status(400).json({ error: 'All service fields are required' });
  }
  const serviceId = `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.json({ id: serviceId, message: 'Service created', ownerId: req.user.id });
});

app.put('/services/:id', authenticate, (req, res) => {
  res.json({ message: 'Service updated', id: req.params.id });
});

app.delete('/services/:id', authenticate, (req, res) => {
  res.json({ message: 'Service deleted', id: req.params.id });
});

// ─── Booking Routes ───────────────────────────────────────────────────────────

app.post('/bookings', authenticate, (req, res) => {
  const { serviceId, date, time } = req.body;
  if (!serviceId || !date || !time) {
    return res.status(400).json({ error: 'Service, date and time are required' });
  }
  const bookingId = `bkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.json({ id: bookingId, message: 'Booking created', userId: req.user.id });
});

app.get('/bookings', authenticate, (req, res) => {
  res.json({ message: 'Fetch bookings from localStorage', userId: req.user.id });
});

app.delete('/bookings/:id', authenticate, (req, res) => {
  res.json({ message: 'Booking cancelled', id: req.params.id });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
