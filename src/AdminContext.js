import React, { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  useEffect(() => {
    localStorage.setItem('admin', JSON.stringify(admin));
  }, [admin]);

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("adminToken");
  };

  return (
    <AdminContext.Provider value={{ admin, setAdmin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
};
