/**
 * localStorageHelper.js
 * Utility functions for reading and writing app data to localStorage.
 * This replaces a database entirely for this app.
 */

// ─── Keys ─────────────────────────────────────────────────────────────────────
const KEYS = {
  USERS: 'sb_users',
  SERVICES: 'sb_services',
  BOOKINGS: 'sb_bookings',
  AUTH: 'sb_auth',
};

// ─── Generic helpers ──────────────────────────────────────────────────────────
const get = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsers = () => get(KEYS.USERS) || [];

export const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  set(KEYS.USERS, users);
};

export const findUserByEmail = (email) =>
  getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const getAuth = () => get(KEYS.AUTH);

export const saveAuth = (authData) => set(KEYS.AUTH, authData);

export const clearAuth = () => localStorage.removeItem(KEYS.AUTH);

// ─── Services ─────────────────────────────────────────────────────────────────
export const getServices = () => get(KEYS.SERVICES) || [];

export const getServicesByOwner = (ownerId) =>
  getServices().filter((s) => s.ownerId === ownerId);

export const getServiceById = (id) => getServices().find((s) => s.id === id);

export const saveService = (service) => {
  const services = getServices();
  services.push(service);
  set(KEYS.SERVICES, services);
};

export const updateService = (id, updates) => {
  const services = getServices().map((s) =>
    s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
  );
  set(KEYS.SERVICES, services);
};

export const deleteService = (id) => {
  set(KEYS.SERVICES, getServices().filter((s) => s.id !== id));
  // Also remove related bookings
  set(KEYS.BOOKINGS, getBookings().filter((b) => b.serviceId !== id));
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const getBookings = () => get(KEYS.BOOKINGS) || [];

export const getBookingsByUser = (userId) =>
  getBookings().filter((b) => b.userId === userId);

export const getBookingsByOwner = (ownerId) => {
  const ownerServiceIds = getServicesByOwner(ownerId).map((s) => s.id);
  return getBookings().filter((b) => ownerServiceIds.includes(b.serviceId));
};

export const saveBooking = (booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  set(KEYS.BOOKINGS, bookings);
};

export const deleteBooking = (id) => {
  set(KEYS.BOOKINGS, getBookings().filter((b) => b.id !== id));
};

export const generateId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
