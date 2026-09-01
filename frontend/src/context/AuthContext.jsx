import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartward_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const role = userData.vai_tro || userData.role;
    const roleName = userData.roleName || (role === 'admin' ? 'Chủ tịch Phường' : role === 'official' ? 'Cán bộ Phường' : 'Công dân');
    const nextUser = {
      ...userData,
      id: userData.id,
      username: userData.ten_dang_nhap || userData.username,
      name: userData.ho_ten || userData.name,
      role,
      roleName,
      managedArea: userData.managed_area || userData.managedArea,
      residence: userData.cho_thuong_tru || userData.residence,
      hometown: userData.que_quan || userData.hometown,
      birthYear: userData.nam_sinh || userData.birthYear,
    };
    setUser(nextUser);
    localStorage.setItem('smartward_user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartward_user');
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = {
        ...prev,
        ...updates,
        ho_ten: updates.name || prev.ho_ten,
        cho_thuong_tru: updates.residence || prev.cho_thuong_tru,
        que_quan: updates.hometown || prev.que_quan,
        nam_sinh: updates.birthYear || prev.nam_sinh,
      };
      localStorage.setItem('smartward_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
