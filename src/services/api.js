import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to detect connection issues
  timeout: 30000
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url, 'with headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server not responding');
      throw new Error('Server is not responding. Please check if the backend server is running.');
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });

      // Handle specific error codes
      if (error.response.data.code === 'TOKEN_EXPIRED') {
        throw new Error('Your password reset link has expired. Please request a new one.');
      }
      if (error.response.data.code === 'INVALID_TOKEN') {
        throw new Error('Invalid reset token. Please request a new password reset link.');
      }

      // Handle validation errors
      if (error.response.data.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        throw new Error(validationErrors);
      }

      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', {
        request: error.request,
        url: error.config.url
      });
      throw new Error('No response from server. Please check if the server is running at ' + API_URL);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      throw new Error('Failed to make request: ' + error.message);
    }
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    console.log('Sending registration data:', userData);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (formData) => {
    console.log('Sending login data:', formData);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        console.log('Token received, storing in localStorage');
        localStorage.setItem('token', response.data.token);
        
        // Store user data and userId
        if (response.data.user) {
          console.log('User data received:', response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          const userId = response.data.user.id || response.data.user._id;
          console.log('Storing userId:', userId);
          localStorage.setItem('userId', userId);
          
          // Verify storage
          const storedUserId = localStorage.getItem('userId');
          console.log('Verified stored userId:', storedUserId);
        } else {
          console.error('No user data in login response');
        }
      } else {
        console.error('No token in login response');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Provide more specific error messages
      if (error.response) {
        console.error('Login error response:', {
          status: error.response.status,
          data: error.response.data
        });
        if (error.response.status === 401) {
          throw new Error('Invalid username, email, or password');
        } else if (error.response.status === 404) {
          throw new Error('User not found');
        } else {
          throw new Error(error.response.data.message || 'Login failed. Please try again.');
        }
      }
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    try {
      console.log('Sending reset password request:', {
        token: token ? 'Token exists' : 'No token',
        newPassword: newPassword ? 'Password provided' : 'No password'
      });

      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      console.log('Reset password response:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error) {
      console.error('Reset password error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // The error handling is now done in the interceptor
      throw error;
    }
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

// Complaint API
export const complaintAPI = {
  async getAllComplaints() {
    try {
      console.log('Making API call to get all complaints...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await api.get('/complaints/admin');
      console.log('API response:', response.data);
      
      // Transform the data to ensure consistent ID field
      return response.data.map(complaint => ({
        ...complaint,
        id: complaint._id || complaint.id,
        _id: complaint._id || complaint.id
      }));
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },

  async getAdminComplaints() {
    try {
      console.log('Making API call to get admin complaints...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await api.get('/complaints/admin');
      console.log('API response:', response.data);
      
      // Transform the data to ensure consistent ID field
      return response.data.map(complaint => ({
        ...complaint,
        id: complaint._id || complaint.id,
        _id: complaint._id || complaint.id
      }));
    } catch (error) {
      console.error('Error fetching admin complaints:', error);
      throw error;
    }
  },

  async createComplaint(complaintData) {
    try {
      console.log('Making API call to create complaint...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      // Updated endpoint to match backend route
      const response = await api.post('/complaints', complaintData);
      console.log('API response:', response.data);
      
      // Ensure consistent ID field in response
      return {
        ...response.data,
        id: response.data._id || response.data.id,
        _id: response.data._id || response.data.id
      };
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  },

  async updateComplaintStatus(complaintId, status) {
    if (!complaintId) {
      throw new Error('Invalid complaint ID');
    }
    try {
      const response = await api.patch(`/complaints/${complaintId}/status`, { status });
      return {
        ...response.data,
        id: response.data._id || response.data.id,
        _id: response.data._id || response.data.id
      };
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  },

  async addResponse(complaintId, response) {
    if (!complaintId) {
      throw new Error('Invalid complaint ID');
    }
    
    try {
      console.log('Making API call to add response...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      // Updated to use PATCH instead of POST to match backend route
      const apiResponse = await api.patch(`/complaints/${complaintId}/response`, { response });
      console.log('API response:', apiResponse.data);
      
      // Ensure consistent ID field in response
      return {
        ...apiResponse.data,
        id: apiResponse.data._id || apiResponse.data.id,
        _id: apiResponse.data._id || apiResponse.data.id
      };
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  },

  async getComplaintDetails(complaintId) {
    if (!complaintId) {
      throw new Error('Invalid complaint ID');
    }
    
    try {
      console.log('Making API call to get complaint details...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      // Updated endpoint to match backend route
      const response = await api.get(`/complaints/${complaintId}`);
      console.log('API response:', response.data);
      
      // Ensure consistent ID field in response
      return {
        ...response.data,
        id: response.data._id || response.data.id,
        _id: response.data._id || response.data.id
      };
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      throw error;
    }
  },

  async getUserComplaints() {
    try {
      console.log('Making API call to get user complaints...');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!user || !user.id) {
        throw new Error('User not found');
      }
      
      console.log('Using token:', token ? 'Token exists' : 'No token');
      console.log('User ID:', user.id);
      
      const response = await api.get(`/complaints/user/${user.id}`);
      console.log('API response:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      // Transform the data to ensure consistent ID field
      const transformedData = response.data.map(complaint => ({
        ...complaint,
        id: complaint._id || complaint.id,
        _id: complaint._id || complaint.id,
        adminResponse: complaint.response // Map response to adminResponse for frontend
      }));
      
      console.log('Transformed data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      throw error;
    }
  },

  async updateComplaint(complaintId, updateData) {
    if (!complaintId) {
      throw new Error('Invalid complaint ID');
    }
    
    try {
      console.log('Making API call to update complaint...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await api.patch(`/complaints/${complaintId}`, updateData);
      console.log('API response:', response.data);
      
      // Ensure consistent ID field in response
      return {
        ...response.data,
        id: response.data._id || response.data.id,
        _id: response.data._id || response.data.id
      };
    } catch (error) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  },

  async deleteComplaint(complaintId) {
    if (!complaintId) {
      throw new Error('Invalid complaint ID');
    }
    
    try {
      console.log('Making API call to delete complaint...');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      if (!user) {
        throw new Error('User data not found. Please log in again.');
      }
      
      console.log('Delete request details:', {
        complaintId,
        userRole: user.role,
        userId: user.id
      });
      
      const response = await api.delete(`/complaints/${complaintId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.message === 'Complaint deleted successfully') {
        return true;
      } else {
        throw new Error('Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('Complaint not found. It may have been already deleted.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this complaint.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting the complaint.');
      }
      throw error;
    }
  }
};

export const userAPI = {
  getAllUsers: async () => {
    console.log('Making API call to get all users...');
    const token = localStorage.getItem('token');
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    try {
      // Updated endpoint to match backend route
      const response = await api.get('/users/admin');
      console.log('API response:', response.data);
      
      // Transform the data to include complaints
      const usersWithComplaints = await Promise.all(response.data.map(async (user) => {
        try {
          const complaintsResponse = await api.get(`/complaints/user/${user._id || user.id}`);
          return {
            ...user,
            id: user._id || user.id,
            complaints: complaintsResponse.data.map(complaint => ({
              ...complaint,
              id: complaint._id || complaint.id
            }))
          };
        } catch (error) {
          console.error(`Error fetching complaints for user ${user.id}:`, error);
          return {
            ...user,
            id: user._id || user.id,
            complaints: []
          };
        }
      }));
      
      return usersWithComplaints;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    console.log(`Making API call to update user ${userId} status to ${status}...`);
    const token = localStorage.getItem('token');
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    try {
      // Updated endpoint to match backend route
      const response = await api.put(`/users/admin/${userId}/status`, { status });
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  getUserDetails: async (userId) => {
    try {
      console.log('Making API call to get user details...');
      const response = await api.get(`/users/${userId}/profile`);
      console.log('User details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  createProfile: async (profileData) => {
    try {
      console.log('Making API call to create profile...');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await api.post(`/users/${userId}/profile`, profileData);
      console.log('Profile creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      console.log('Making API call to update profile...');
      const response = await api.put(`/users/${userId}/profile`, profileData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
};

export default api; 