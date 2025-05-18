import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Complaint {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  description: string;
  submittedDate: string;
  lastUpdated: string;
  contactEmail: string;
  response?: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  contactEmail: string;
}

export const complaintApi = {
  // Submit a new complaint
  submitComplaint: async (data: ComplaintFormData): Promise<Complaint> => {
    try {
      const response = await axios.post(`${API_URL}/complaints`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  },

  // Get all complaints
  getComplaints: async (): Promise<Complaint[]> => {
    try {
      const response = await axios.get(`${API_URL}/complaints`);
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },

  // Update complaint status
  updateComplaintStatus: async (id: string, status: Complaint['status']): Promise<Complaint> => {
    try {
      const response = await axios.patch(`${API_URL}/complaints/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  },

  // Add response to complaint
  addComplaintResponse: async (id: string, responseText: string): Promise<Complaint> => {
    try {
      const response = await axios.post(`${API_URL}/complaints/${id}/response`, { response: responseText });
      return response.data;
    } catch (error) {
      console.error('Error adding complaint response:', error);
      throw error;
    }
  },

  // Get complaint by ID
  getComplaintById: async (id: string): Promise<Complaint> => {
    try {
      const response = await axios.get(`${API_URL}/complaints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  },

  // Get admin complaints
  getAdminComplaints: async (): Promise<Complaint[]> => {
    try {
      const response = await axios.get(`${API_URL}/admin/complaints`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin complaints:', error);
      throw error;
    }
  },

  // Update complaint (admin)
  updateComplaint: async (id: string, data: Partial<Complaint>): Promise<Complaint> => {
    try {
      const response = await axios.patch(`${API_URL}/admin/complaints/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  }
};
