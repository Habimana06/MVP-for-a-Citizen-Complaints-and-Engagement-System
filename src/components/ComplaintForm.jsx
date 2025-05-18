import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';

function ComplaintForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Category descriptions
  const categoryDescriptions = {
    infrastructure: 'Issues related to public buildings, facilities, and basic services',
    roads: 'Problems with roads, streets, bridges, and transportation infrastructure',
    water: 'Water supply, quality, and distribution issues',
    electricity: 'Power supply, outages, and electrical infrastructure problems',
    waste: 'Garbage collection, recycling, and waste management issues',
    safety: 'Public safety concerns, security issues, and emergency services',
    health: 'Healthcare facilities, sanitation, and public health concerns',
    education: 'Schools, educational facilities, and learning environment issues',
    parks: 'Public parks, recreational areas, and green spaces',
    noise: 'Noise pollution, disturbances, and sound-related issues',
    air: 'Air quality, pollution, and environmental concerns',
    traffic: 'Traffic management, congestion, and road safety issues',
    housing: 'Housing conditions, property maintenance, and accommodation issues',
    business: 'Business-related concerns, commercial areas, and market issues',
    other: 'Any other concerns not covered by the above categories'
  };

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if no token is found
      navigate('/login', { 
        state: { 
          from: '/submit-complaint',
          message: 'Please log in to submit a complaint'
        } 
      });
      return;
    }

    try {
      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        throw new Error('User ID not found');
      }

      setUserInfo({
        id: user.id,
        email: user.email,
        username: user.username
      });
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    } catch (error) {
      console.error('Error loading user information:', error);
      setError('Error loading user information. Please try logging in again.');
      navigate('/login', { 
        state: { 
          from: '/submit-complaint',
          message: 'Your session has expired. Please log in again.'
        } 
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));
    
    // Simulate location suggestions (replace with actual API call in production)
    if (value.length > 2) {
      const suggestions = [
        `${value} Street`,
        `${value} Avenue`,
        `${value} Road`,
        `${value} District`,
        `${value} Area`
      ];
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }

      // Add user ID to the complaint data
      const complaintData = {
        ...formData,
        userId: userInfo?.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Submitting complaint with data:', complaintData);
      const response = await complaintAPI.createComplaint(complaintData);
      
      if (!response.id && !response._id) {
        throw new Error('No complaint ID received from server');
      }

      // Store the complaint ID in a consistent format
      const complaintId = response.id || response._id;
      console.log('Complaint created with ID:', complaintId);

      setSuccess(true);
      // Redirect to the complaint tracking page
      navigate(`/my-complaints`, { 
        state: { 
          message: 'Complaint submitted successfully',
          complaintId: complaintId
        }
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">
            Your complaint has been submitted and is now being processed.
          </p>
          <button
            onClick={() => navigate('/my-complaints')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View My Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Submit a Complaint</h2>
            <p className="mt-2 text-sm text-gray-600">
              Help us improve our community by reporting issues
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="">Select a category</option>
                {Object.keys(categoryDescriptions).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                  </option>
                ))}
              </select>
              {formData.category && (
                <p className="mt-1 text-sm text-gray-500">
                  {categoryDescriptions[formData.category]}
                </p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleLocationChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Where is the issue located?"
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                maxLength="1000"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Please provide detailed information about the issue"
              />
              <div className="mt-1 flex justify-end">
                <span className={`text-sm ${formData.description.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.description.length}/1000 characters
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Your email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm; 