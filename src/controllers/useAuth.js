import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginApi } from '../services/api';

/**
 * Controller hook xử lý logic đăng nhập
 * Tách business logic ra khỏi Login.jsx (View)
 */
const useAuth = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    const userData = await loginApi({ username, password });

    const mappedUser = {
      id: userData.id,
      username: userData.ten_dang_nhap,
      name: userData.ho_ten,
      role: userData.vai_tro,
      roleName:
        userData.vai_tro === 'superadmin'
          ? 'Quản trị hệ thống (IT)'
          : userData.vai_tro === 'admin'
          ? 'Chủ tịch Phường'
          : userData.vai_tro === 'official'
          ? 'Cán bộ Phường'
          : 'Công dân',
      residence: userData.cho_thuong_tru,
      hometown: userData.que_quan,
      birthYear: userData.nam_sinh?.toString(),
      managedArea: userData.managed_area,
    };

    login(mappedUser);

    if (mappedUser.role === 'superadmin') navigate('/system-admin');
    else if (mappedUser.role === 'admin') navigate('/admin');
    else if (mappedUser.role === 'official') navigate('/official');
    else navigate('/citizen');
  };

  return { handleLogin };
};

export default useAuth;
