import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }

    if (role === 'user') {
      return <Navigate to="/user" replace />;
    }
  }

  return children;
}
