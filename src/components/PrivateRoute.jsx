import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is trying to access admin route
  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  // Check if admin is trying to access user route
  if (!adminOnly && user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default PrivateRoute; 