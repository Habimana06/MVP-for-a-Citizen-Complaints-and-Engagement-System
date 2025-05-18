import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Alert,
  Paper,
  Divider,
  IconButton,
  Avatar,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    idType: 'nationality',
    idNumber: '',
    phoneNumber: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Debug check for userId and token
    console.log('Current userId:', userId);
    console.log('Current token:', token ? 'Token exists' : 'No token');
    console.log('Local storage contents:', {
      userId: localStorage.getItem('userId'),
      token: localStorage.getItem('token') ? 'exists' : 'missing',
      user: localStorage.getItem('user')
    });
    
    if (!userId || !token) {
      console.error('Missing credentials:', { userId, hasToken: !!token });
      setError('Please log in to access your profile');
      navigate('/login');
      return;
    }
    
    fetchProfile();
  }, [userId, token, navigate]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for userId:', userId);
      if (!userId) {
        console.error('No userId available for profile fetch');
        setError('User ID not found. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await userAPI.getUserDetails(userId);
      console.log('Profile fetch response:', response);
      
      if (response) {
        setProfile(response);
        setFormData(response);
        setIsEditing(false);
        setError(''); // Clear any previous errors
      } else {
        console.log('No profile found, showing creation form');
        setIsEditing(true);
        setProfile(null);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.message.includes('not found')) {
        console.log('Profile not found, showing creation form');
        setIsEditing(true);
        setProfile(null);
      } else if (error.message.includes('authentication')) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Error fetching profile. Please try again later.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId || !token) {
      setError('Please log in to save your profile');
      return;
    }

    try {
      console.log('Submitting profile data:', formData);
      
      // Always try to update first if we have a profile
      if (profile) {
        try {
          const response = await userAPI.updateProfile(userId, formData);
          console.log('Profile update response:', response);
          setSuccess('Profile updated successfully');
          setIsEditing(false);
          fetchProfile();
          return;
        } catch (updateError) {
          console.error('Update failed, trying create:', updateError);
          // If update fails, continue to create
        }
      }

      // Try to create new profile
      try {
        const response = await userAPI.createProfile(formData);
        console.log('Profile creation response:', response);
        setSuccess('Profile created successfully');
        setIsEditing(false);
        fetchProfile();
      } catch (createError) {
        if (createError.message.includes('already exists')) {
          // If profile exists, try to fetch it
          console.log('Profile exists, fetching current profile...');
          await fetchProfile();
          setError('Profile already exists. Showing current profile.');
      } else {
          throw createError;
        }
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setError(error.message || 'An error occurred while saving your profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderProfileForm = () => (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            {profile ? 'Update Profile' : 'Create Profile'}
          </Typography>
          <IconButton 
            onClick={() => {
              setIsEditing(false);
              setFormData(profile || {
                fullName: '',
                idType: 'nationality',
                idNumber: '',
                phoneNumber: '',
                nationality: '',
                address: '',
                city: '',
                country: '',
              });
            }}
            color="error"
          >
            <CancelIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ID Type"
                  name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                  required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="nationality">Nationality ID</MenuItem>
                <MenuItem value="passport">Passport</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Number"
                  name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                  required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                variant="outlined"
                multiline
                rows={2}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                  name="city"
                value={formData.city}
                onChange={handleInputChange}
                  required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                  name="country"
                value={formData.country}
                onChange={handleInputChange}
                  required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<SaveIcon />}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {profile ? 'Save Changes' : 'Create Profile'}
              </Button>
            </Grid>
          </Grid>
          </form>
      </CardContent>
    </Card>
  );

  const renderProfileDetails = () => (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: theme.palette.primary.main,
                fontSize: '1.5rem'
              }}
            >
              {profile.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                {profile.fullName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {profile.idType.charAt(0).toUpperCase() + profile.idType.slice(1)} ID: {profile.idNumber}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            startIcon={<EditIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Edit Profile
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {profile.phoneNumber}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Nationality
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {profile.nationality}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Address Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {profile.address}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  City
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {profile.city}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Country
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {profile.country}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            borderRadius: 2
          }}
        >
          {success}
        </Alert>
      )}
      {isEditing ? renderProfileForm() : profile && renderProfileDetails()}
    </Container>
  );
};

export default Profile; 