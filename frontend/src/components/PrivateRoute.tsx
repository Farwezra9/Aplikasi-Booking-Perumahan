import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
  role?: 'admin' | 'user'; // Menentukan role yang diizinkan (opsional)
}

export default function PrivateRoute({ children, role }: PrivateRouteProps) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    sessionStorage.setItem(
      'auth_message',
      'Silakan login terlebih dahulu'
    );
    return <Navigate to="/signin" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}