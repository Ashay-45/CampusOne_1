import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Guard
 * - Verifies user authentication status.
 * - Prevents content flashing by rendering an accessible loading spinner while hydrating.
 * - Enforces role-based authorization: redirects mismatched roles to their authorized area.
 * - Redirects unauthenticated visitors to /login preserving target destination.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p style={{ fontWeight: 600 }}>Verifying credentials and permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the user's rightful dashboard
    if (role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
