/**
 * App.jsx — Root component with routing and context providers
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OwnerDashboard from './pages/OwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import AddService from './pages/AddService';
import BookService from './pages/BookService';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Owner protected routes */}
          <Route path="/owner" element={
            <ProtectedRoute role="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner/add-service" element={
            <ProtectedRoute role="owner">
              <AddService />
            </ProtectedRoute>
          } />
          <Route path="/owner/edit-service/:id" element={
            <ProtectedRoute role="owner">
              <AddService editMode />
            </ProtectedRoute>
          } />

          {/* User protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/book/:serviceId" element={
            <ProtectedRoute role="user">
              <BookService />
            </ProtectedRoute>
          } />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
