import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { complaintApi } from '../services/api';

function TrackComplaint() {
  const { ticketId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!ticketId) {
        setError('No complaint ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await complaintApi.getComplaintById(ticketId);
        setComplaint(response);
      } catch (err) {
        setError('Failed to fetch complaint details');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [ticketId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Track Your Complaint</h2>
            <p className="mt-2 text-sm text-gray-600">
              View the status and details of your submitted complaint
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading complaint details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1">Please try again later</p>
              </div>
            </div>
          ) : complaint ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="mt-1 text-gray-900">{complaint.category}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Submitted Date</h4>
                  <p className="mt-1 text-gray-900">{new Date(complaint.submittedDate).toLocaleDateString()}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-gray-900">{complaint.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
                  <p className="mt-1 text-gray-900">{complaint.contactEmail}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="mt-1 text-gray-900">{new Date(complaint.lastUpdated).toLocaleDateString()}</p>
                </div>

                {complaint.response && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Response</h4>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{complaint.response}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="font-medium">Complaint Not Found</p>
                <p className="text-sm mt-1">Please check your complaint ID and try again</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackComplaint; 