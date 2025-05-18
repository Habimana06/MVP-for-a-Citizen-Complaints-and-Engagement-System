import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, userType, adminOnly }) {
  // If not logged in, redirect to login
  if (!userType) {
    return <Navigate to="/login" replace />;
  }

  // If trying to access admin route but not an admin
  if (adminOnly && userType !== 'admin') {
    return <Navigate to="/submit" replace />;
  }

  // If admin trying to access citizen routes
  if (!adminOnly && userType === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute; 