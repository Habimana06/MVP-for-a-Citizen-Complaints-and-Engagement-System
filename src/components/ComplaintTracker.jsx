import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';

function ComplaintTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasNewResponse, setHasNewResponse] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchComplaint = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError('');
        const data = await complaintAPI.getComplaintById(id);
        if (isMounted) {
          setComplaint(data);
          // Check if there's a new unread response
          if (data.hasNewResponse && !data.responseRead) {
            setHasNewResponse(true);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to fetch complaint details');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchComplaint();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchComplaint, 30000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [id]);

  useEffect(() => {
    fetchUserComplaints();
  }, []);

  const fetchUserComplaints = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace 'userId' with actual user ID from authentication
      const userId = 'current-user-id';
      const data = await complaintAPI.getUserComplaints(userId);
      setComplaints(data);
    } catch (error) {
      setError('Failed to fetch your complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim()}`);
    }
  };

  const handleResponseRead = async () => {
    if (hasNewResponse && complaint) {
      try {
        await complaintAPI.markResponseAsRead(complaint.id);
        setHasNewResponse(false);
        setComplaint(prev => ({ ...prev, responseRead: true }));
      } catch (error) {
        console.error('Failed to mark response as read:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show search form if no ID is provided
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Track Your Complaint</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your complaint ID to view its status and updates
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700">
                  Complaint ID
                </label>
                <input
                  type="text"
                  id="complaintId"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your complaint ID"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Track Complaint
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/track')}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Not Found</h2>
              <p className="text-gray-600 mb-6">Please check the complaint ID and try again.</p>
              <button
                onClick={() => navigate('/track')}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complaint Details</h2>
            <p className="mt-2 text-sm text-gray-600">
              Track the status and updates of your complaint
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Submitted Date</h3>
                <p className="mt-1 text-gray-900">
                  {complaint.submittedDate ? new Date(complaint.submittedDate).toLocaleString() : 'Not available'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="mt-1 text-gray-900">{complaint.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 text-gray-900">{complaint.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-gray-900">{complaint.location}</p>
            </div>

            {complaint.response ? (
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Response from Admin</h3>
                  {hasNewResponse && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New Response
                    </span>
                  )}
                </div>
                <div 
                  className={`mt-1 text-sm text-gray-900 p-4 rounded-lg ${
                    hasNewResponse ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                  }`}
                  onClick={handleResponseRead}
                >
                  <p>{complaint.response}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Last updated: {new Date(complaint.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>Your complaint is being reviewed. You will be notified when there's a response.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintTracker; 