import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (role === 'admin') {
      return <Navigate to="/dashboardadmin" replace />;
    }
    if (role === 'user') {
      return <Navigate to="/dashboarduser" replace />;
    }
  }

  return <>{children}</>;
}