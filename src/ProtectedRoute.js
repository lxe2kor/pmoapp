import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly, userOnly }) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');

  if (adminOnly && !adminToken) {
    return <Navigate to="/" replace />;
  }

  if (userOnly && !userToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
