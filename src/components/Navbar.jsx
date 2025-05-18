import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check authentication status on mount and when location changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && user) {
        setIsLoggedIn(true);
        setUserRole(user.role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = (e) => {
    e.preventDefault();
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setIsLoggedIn(false);
    setUserRole(null);
    
    // Navigate to home page
    navigate('/', { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    return `border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
      isActive(path) ? 'border-indigo-500 text-indigo-600' : ''
    }`;
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                CitizenEngage
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={getLinkClass('/')}>
                Home
              </Link>
              
              {isLoggedIn && (
                <>
                  {userRole === 'admin' ? (
                    <>
                      <Link to="/admin" className={getLinkClass('/admin')}>
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/complaints" className={getLinkClass('/admin/complaints')}>
                        Manage Complaints
                      </Link>
                      <Link to="/admin/users" className={getLinkClass('/admin/users')}>
                        Manage Users
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                        Dashboard
                      </Link>
                      <Link to="/submit-complaint" className={getLinkClass('/submit-complaint')}>
                        Submit Complaint
                      </Link>
                      <Link to="/my-complaints" className={getLinkClass('/my-complaints')}>
                        Track Complaints
                      </Link>
                      <Link to="/notifications" className={getLinkClass('/notifications')}>
                        Notifications
                      </Link>
                      <Link to="/profile" className={getLinkClass('/profile')}>
                        My Profile
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {userRole === 'admin' ? 'Admin' : 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 