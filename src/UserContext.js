import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [department, setDepartment] = useState(() => {
    const savedDepartment = localStorage.getItem('department');
    return savedDepartment ? savedDepartment : null;
  });

  const [group, setGroup] = useState(() => {
    const savedGroup = localStorage.getItem('group');
    return savedGroup ? savedGroup : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (department !== null) {
      localStorage.setItem('department', department);
    } else {
      localStorage.removeItem('department');
    }
  }, [department]);

  useEffect(() => {
    if (group !== null) {
      localStorage.setItem('group', group);
    } else {
      localStorage.removeItem('group');
    }
  }, [group]);

  const userLogout = () => {
    setUser(null);
    setDepartment(null);
    setGroup(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('department');
    localStorage.removeItem('group');
  };

  return (
    <UserContext.Provider value={{ user, setUser, department, setDepartment, group, setGroup, userLogout }}>
      {children}
    </UserContext.Provider>
  );
};
