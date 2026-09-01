import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRoleName = (r) => {
    switch(r) {
      case 'admin': return 'Chủ tịch Xã';
      case 'official': return 'Cán bộ Thôn';
      case 'office': return 'Văn phòng Xã';
      case 'superadmin': return 'Quản trị Hệ thống';
      default: return 'Công dân';
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('smartward_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const validRoles = ['superadmin', 'admin', 'office', 'official', 'citizen'];
        if (validRoles.includes(parsed.role)) {
          parsed.roleName = getRoleName(parsed.role);
          localStorage.setItem('smartward_user', JSON.stringify(parsed));
          setUser(parsed);
        } else {
          localStorage.removeItem('smartward_user'); // Xóa dữ liệu cũ/sai
        }
      } catch (e) {
        localStorage.removeItem('smartward_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const role = userData.vai_tro || userData.role;
    const roleName = getRoleName(role);
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
