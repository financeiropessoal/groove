import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMusicianAuth } from '../contexts/MusicianAuthContext';

const MusicianProtectedRoute: React.FC = () => {
  const { isMusicianAuthenticated } = useMusicianAuth();

  if (!isMusicianAuthenticated) {
    return <Navigate to="/musician-login" replace />;
  }

  return <Outlet />;
};

export default MusicianProtectedRoute;
