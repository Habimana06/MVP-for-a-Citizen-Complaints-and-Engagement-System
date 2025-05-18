import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';

const UserComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    category: '',
    location: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [retryCount]);

  const fetchComplaints = async () => {
    try {
      console.log('Fetching user complaints...');
      setLoading(true);
      setError(null);

      const data = await complaintAPI.getUserComplaints();
      console.log('Fetched complaints:', data);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data received from server');
      }

      // Sort complaints by date, newest first
      const sortedComplaints = data.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      setComplaints(sortedComplaints);
      setError(null);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle specific error cases
      if (err.message.includes('server is not responding') || 
          err.message.includes('No response from server')) {
        setError('Unable to connect to the server. Please check if the backend server is running.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Complaints endpoint not found. Please contact support.');
      } else if (err.response?.status === 500) {
        setError(
          <div className="text-center">
            <p className="mb-4">Server error occurred. Please try again.</p>
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        );
      } else {
        setError(err.message || 'Failed to fetch complaints. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure we have a valid complaint ID
        const id = complaintId || complaintId._id;
        if (!id) {
          throw new Error('Invalid complaint ID');
        }
        
        console.log('Attempting to delete complaint:', id);
        const success = await complaintAPI.deleteComplaint(id);
        
        if (success) {
          console.log('Complaint deleted successfully, updating UI...');
          // Update the complaints list by removing the deleted complaint
          setComplaints(prevComplaints => 
            prevComplaints.filter(complaint => 
              (complaint.id !== id && complaint._id !== id)
            )
          );
        } else {
          throw new Error('Failed to delete complaint');
        }
      } catch (err) {
        console.error('Error deleting complaint:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Handle specific error cases
        if (err.message.includes('server is not responding') || 
            err.message.includes('No response from server')) {
          setError('Unable to connect to the server. Please check if the backend server is running.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Complaint not found. It may have been already deleted.');
          // Refresh the complaints list to ensure UI is in sync
          fetchComplaints();
        } else if (err.response?.status === 403) {
          setError('You do not have permission to delete this complaint.');
        } else {
          setError(
            <div className="text-center">
              <p className="mb-4">Failed to delete complaint. Please try again.</p>
              <button
                onClick={() => handleDelete(complaintId)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Retry Delete
              </button>
            </div>
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint.id);
    setUpdateForm({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await complaintAPI.updateComplaint(editingComplaint, updateForm);
      setComplaints(complaints.map(c => 
        c.id === editingComplaint ? response : c
      ));
      setEditingComplaint(null);
      setError(null);
    } catch (err) {
      console.error('Error updating complaint:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle specific error cases
      if (err.message.includes('server is not responding') || 
          err.message.includes('No response from server')) {
        setError('Unable to connect to the server. Please check if the backend server is running.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Complaint not found. It may have been deleted.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update this complaint.');
      } else {
        setError(
          <div className="text-center">
            <p className="mb-4">Failed to update complaint. Please try again.</p>
            <button
              onClick={() => handleUpdate(e)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Retry Update
            </button>
          </div>
        );
      }
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <button
            onClick={() => navigate('/submit-complaint')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit New Complaint
          </button>
        </div>

        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Status: <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700">{complaint.description}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Category:</span> {complaint.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Location:</span> {complaint.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Submitted:</span> {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Last Updated:</span> {new Date(complaint.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {complaint.response && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900">Admin Response:</h4>
                  <p className="mt-1 text-sm text-gray-500">{complaint.response}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    Last updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {complaints.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by submitting a new complaint.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/submit-complaint')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Submit New Complaint
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserComplaints; 