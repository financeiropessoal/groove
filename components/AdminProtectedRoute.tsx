import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminProtectedRoute: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();

  if (!isAdminAuthenticated) {
    // Redirect them to the /admin/login page if not authenticated.
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the child routes.
  return <Outlet />;
};

export default AdminProtectedRoute;
