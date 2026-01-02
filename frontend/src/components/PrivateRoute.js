import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // belum login
  if (!token) {
    sessionStorage.setItem(
      'auth_message',
      'Silakan login terlebih dahulu'
    );
    return <Navigate to="/login" replace />;
  }

  // role tidak sesuai
 if (role && userRole !== role) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
