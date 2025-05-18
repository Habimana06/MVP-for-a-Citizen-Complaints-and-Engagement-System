import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ComplaintForm from './components/ComplaintForm';
import AdminDashboard from './components/AdminDashboard';
import UserComplaints from './components/UserComplaints';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import AdminComplaintManagement from './components/AdminComplaintManagement';
import AdminUserManagement from './components/AdminUserManagement';
import Dashboard from './components/Dashboard';

export default createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <SignUp />
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/reset-password',
        element: <ResetPassword />
      },
      {
        path: '/dashboard',
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        )
      },
      {
        path: '/submit-complaint',
        element: (
          <PrivateRoute>
            <ComplaintForm />
          </PrivateRoute>
        )
      },
      {
        path: '/my-complaints',
        element: (
          <PrivateRoute>
            <UserComplaints />
          </PrivateRoute>
        )
      },
      {
        path: '/notifications',
        element: (
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        )
      },
      {
        path: '/admin',
        element: (
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        )
      },
      {
        path: '/admin/complaints',
        element: (
          <PrivateRoute adminOnly>
            <AdminComplaintManagement />
          </PrivateRoute>
        )
      },
      {
        path: '/admin/users',
        element: (
          <PrivateRoute adminOnly>
            <AdminUserManagement />
          </PrivateRoute>
        )
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}); 