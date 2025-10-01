import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect them to the /login page if not authenticated.
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes.
  return <Outlet />;
};

export default ProtectedRoute;