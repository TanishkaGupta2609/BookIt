# 📅 BookIt — Service Booking Platform

A full-stack service booking web app built with **React** (frontend) and **Node.js + Express** (backend). All data is stored in **browser localStorage** — no database required.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, React Hooks |
| Backend | Node.js, Express |
| Auth | JWT (via backend) + localStorage |
| Storage | Browser localStorage only |
| Styling | Custom CSS with CSS variables |
| Fonts | Syne (display) + DM Sans (body) |

---

## 📁 Project Structure

```
service-booking/
├── backend/
│   ├── server.js          # Express server with JWT auth routes
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Sidebar navigation (role-based)
    │   │   ├── ServiceCard.jsx    # Reusable service display card
    │   │   ├── BookingCard.jsx    # Reusable booking display card
    │   │   └── ProtectedRoute.jsx # Route guard (auth + role)
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Signup.jsx         # Registration page
    │   │   ├── OwnerDashboard.jsx # Owner main dashboard
    │   │   ├── UserDashboard.jsx  # User/client main dashboard
    │   │   ├── AddService.jsx     # Create/edit service form
    │   │   └── BookService.jsx    # Appointment booking flow
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── utils/
    │   │   └── localStorageHelper.js  # All localStorage CRUD
    │   ├── App.jsx               # Router setup
    │   ├── index.js              # Entry point
    │   └── index.css             # Global styles
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ installed
- npm or yarn

### Step 1 — Start the Backend

```bash
cd service-booking/backend
npm install
npm start
# Server runs on http://localhost:5000
```

For development with auto-reload:
```bash
npm run dev
```

### Step 2 — Start the Frontend

```bash
cd service-booking/frontend
npm install
npm start
# App opens at http://localhost:3000
```

> The frontend is configured with `"proxy": "http://localhost:5000"` in package.json,
> so API calls are automatically forwarded to the backend.

---

## 👥 User Roles

### Owner
- Sign up with role: **Owner**
- Add, edit, delete services
- View all bookings for their services
- Dashboard with revenue stats

### User (Client)
- Sign up with role: **User**
- Browse all available services
- Book appointments (date + time)
- Cancel bookings
- View booking history

---

## 🔑 How Authentication Works

1. **Signup**: User data (including hashed-ish password) is stored in `localStorage`
2. **Backend**: Express issues a signed JWT token
3. **Login**: Password is verified client-side against localStorage, then a new JWT is issued
4. **Session**: Token + user info persisted in `localStorage.sb_auth`
5. **Protected routes**: `ProtectedRoute` component checks auth state

---

## 📦 localStorage Keys

| Key | Contents |
|-----|----------|
| `sb_auth` | Current session (user + token) |
| `sb_users` | All registered users |
| `sb_services` | All services |
| `sb_bookings` | All bookings |

---

## ✨ Features

- ✅ Role-based authentication (Owner / User)
- ✅ Persistent login via localStorage
- ✅ Protected routes with role enforcement
- ✅ Owner: CRUD operations on services
- ✅ User: Browse, search, and book services
- ✅ Time slot conflict prevention (booked slots are greyed out)
- ✅ Booking cancellation
- ✅ Stats dashboard (bookings count, revenue estimate)
- ✅ Search/filter services
- ✅ Form validation with inline errors
- ✅ Loading states, empty states, success/error alerts
- ✅ Responsive design
- ✅ Clean SaaS-style UI with sidebar navigation

---

## 🎨 Design System

- **Primary accent**: `#E85D26` (warm orange)
- **Background**: `#F8F6F2` (warm off-white)
- **Sidebar**: `#1A1A2E` (deep navy)
- **Display font**: Syne (bold, geometric)
- **Body font**: DM Sans (clean, readable)
