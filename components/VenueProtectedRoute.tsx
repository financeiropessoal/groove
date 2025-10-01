import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';

const VenueProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useVenueAuth();

  if (!isAuthenticated) {
    // Redirect them to the /venue-login page if not authenticated.
    return <Navigate to="/venue-login" replace />;
  }

  // If authenticated, render the child routes.
  return <Outlet />;
};

export default VenueProtectedRoute;
