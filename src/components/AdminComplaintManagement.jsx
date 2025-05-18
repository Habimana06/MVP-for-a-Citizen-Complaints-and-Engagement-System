import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';

function AdminComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, resolved

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await complaintAPI.getAllComplaints();
      console.log('Fetched complaints:', data);
      
      // Ensure each complaint has a valid ID and transform the data
      const validComplaints = data.map(complaint => ({
        ...complaint,
        id: complaint._id || complaint.id,
        _id: complaint._id || complaint.id
      })).filter(complaint => complaint.id);
      
      console.log('Transformed complaints:', validComplaints);
      setComplaints(validComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        window.location.href = '/login';
      } else {
        setError(error.response?.data?.message || 'Failed to fetch complaints. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    if (!complaintId) {
      console.error('Invalid complaint ID:', complaintId);
      setError('Invalid complaint ID');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      console.log('Updating status for complaint:', complaintId, 'to:', newStatus);
      
      const updatedComplaint = await complaintAPI.updateComplaintStatus(complaintId, newStatus);
      console.log('Status update response:', updatedComplaint);
      
      // Update the complaints list
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
      
      // Update selected complaint if it's the one being modified
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint?.id || !response.trim()) {
      setError('Invalid complaint or empty response');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const updatedComplaint = await complaintAPI.addResponse(selectedComplaint.id, response);
      
      // Update the complaints list
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === selectedComplaint.id 
            ? { ...complaint, response: response }
            : complaint
        )
      );
      
      // Update selected complaint
      setSelectedComplaint(prev => ({ ...prev, response: response }));
      setResponse('');
    } catch (error) {
      console.error('Error submitting response:', error);
      setError(error.response?.data?.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
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

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status.toLowerCase() === filter.toLowerCase();
  });

  if (isLoading && complaints.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complaint Management</h2>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Complaints</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchComplaints}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.map((complaint) => (
          <div
            key={`complaint-${complaint.id}`}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-colors ${
              selectedComplaint?.id === complaint.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedComplaint(complaint)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
              <select
                value={complaint.status}
                onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {selectedComplaint && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Details</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Title</h4>
              <p className="mt-1 text-gray-900">{selectedComplaint.title}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-gray-900">{selectedComplaint.category}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Location</h4>
              <p className="mt-1 text-gray-900">{selectedComplaint.location}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-gray-900">{selectedComplaint.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <select
                value={selectedComplaint.status}
                onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Response</h4>
              {selectedComplaint.response ? (
                <p className="mt-1 text-gray-900">{selectedComplaint.response}</p>
              ) : (
                <form onSubmit={handleResponseSubmit} className="mt-2">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your response..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaintManagement; 