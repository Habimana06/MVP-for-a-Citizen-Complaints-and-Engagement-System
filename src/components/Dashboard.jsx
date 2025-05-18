import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { complaintAPI, userAPI } from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    rejected: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      // Fetch user profile
      const profileResponse = await userAPI.getUserDetails(userId);
      setProfile(profileResponse);

      // Fetch complaints
      const complaintsResponse = await complaintAPI.getUserComplaints();
      console.log('Fetched complaints:', complaintsResponse); // Debug log
      const complaints = Array.isArray(complaintsResponse) ? complaintsResponse : complaintsResponse.data || [];

      // Calculate statistics
      const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        inProgress: complaints.filter(c => c.status === 'in progress').length,
        rejected: complaints.filter(c => c.status === 'rejected').length
      };
      console.log('Calculated stats:', stats); // Debug log
      setStats(stats);

      // Get recent complaints (last 5)
      const recent = complaints
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentComplaints(recent);

        setLoading(false);
      } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'in progress':
        return theme.palette.info.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon sx={{ color: getStatusColor(status) }} />;
      case 'pending':
        return <PendingIcon sx={{ color: getStatusColor(status) }} />;
      case 'in progress':
        return <WarningIcon sx={{ color: getStatusColor(status) }} />;
      case 'rejected':
        return <CancelIcon sx={{ color: getStatusColor(status) }} />;
      default:
        return <DescriptionIcon sx={{ color: getStatusColor(status) }} />;
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        bgcolor: 'background.paper',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: `${color}15`,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Welcome Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {profile?.fullName || 'User'}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Here's an overview of your complaint management dashboard
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                  onClick={() => navigate('/submit-complaint')}
                sx={{ borderRadius: 2 }}
                >
                  Submit New Complaint
              </Button>
              <Button
                variant="outlined"
                  onClick={() => navigate('/my-complaints')}
                sx={{ borderRadius: 2 }}
              >
                Track Complaints
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ borderRadius: 2 }}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon={<DescriptionIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<PendingIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<WarningIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        {stats.rejected > 0 && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<CancelIcon />}
              color={theme.palette.error.main}
            />
          </Grid>
        )}
      </Grid>

      {/* Recent Complaints and Profile Info */}
      <Grid container spacing={3}>
        {/* Recent Complaints */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Complaints
              </Typography>
              <List>
                {recentComplaints.map((complaint, index) => (
                  <React.Fragment key={complaint.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          cursor: 'pointer'
                        },
                      }}
                      onClick={() => navigate(`/track-complaints/${complaint.id}`)}
                    >
                      <ListItemIcon>
                        {getStatusIcon(complaint.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={complaint.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                            >
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </Typography>
                            {' • '}
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: getStatusColor(complaint.status) }}
                            >
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentComplaints.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {recentComplaints.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No complaints yet"
                      secondary="Submit your first complaint to see it here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Summary
              </Typography>
              {profile ? (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={profile.email}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={profile.phoneNumber}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={`${profile.address}, ${profile.city}, ${profile.country}`}
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color="textSecondary">
                  Profile information not available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;