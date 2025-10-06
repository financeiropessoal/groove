import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProProtectedRoute: React.FC = () => {
  const { isAuthenticated, artist } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!artist?.is_pro) {
    // Redirect non-pro artists to the subscription page
    return <Navigate to="/subscribe" replace />;
  }

  // If authenticated and is a pro user, render the child routes.
  return <Outlet />;
};

export default ProProtectedRoute;