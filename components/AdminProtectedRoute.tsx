import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();

  if (!isAdminAuthenticated) {
    // Redirect them to the /admin/login page if not authenticated.
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the child components.
  return <>{children}</>;
};

export default AdminProtectedRoute;