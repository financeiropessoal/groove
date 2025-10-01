import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';

const SharedProtectedRoute: React.FC = () => {
  const { isAuthenticated: isArtistAuthenticated } = useAuth();
  const { isAuthenticated: isVenueAuthenticated } = useVenueAuth();

  if (!isArtistAuthenticated && !isVenueAuthenticated) {
    // Redirect them to the /login page if not authenticated.
    // This is a sensible default.
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes.
  return <Outlet />;
};

export default SharedProtectedRoute;