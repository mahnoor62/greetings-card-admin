import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  People,
  ShoppingCart,
  TrendingUp,
  VerifiedUser,
  Google,
  PersonAdd,
  Visibility
} from '@mui/icons-material';

const TrafficStatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color, mr: 1 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
          <Typography variant="body2" color="success.main">
            {trend}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const WebsiteTrafficStats = ({ data, loading }) => {
  if (loading) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Website Traffic
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const traffic = data || {};

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <People sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Website Traffic
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Total Registered Users */}
          <Grid item xs={12} sm={6}>
            <TrafficStatCard
              title="Registered Users"
              value={traffic.totalRegisteredUsers || 0}
              icon={<People />}
              color="primary.main"
              subtitle="Users with accounts"
            />
          </Grid>

          {/* Total Page Views */}
          <Grid item xs={12} sm={6}>
            {/* <TrafficStatCard
              title="Total Viewers"
              value={traffic.totalPageViews || 0}
              icon={<PersonAdd />}
              color="info.main"
              subtitle="Website viewers"
            /> */}
    
            <TrafficStatCard
              title="Unique Visitors"
              value={traffic.totalVisitors || 0}
              icon={<Visibility />}
              color="info.main"
              subtitle="Website visitors"
            />
          </Grid>

          {/* Buyers */}
          <Grid item xs={12} sm={6}>
            <TrafficStatCard
              title="Buyers"
              value={traffic.totalBuyers || 0}
              icon={<ShoppingCart />}
              color="success.main"
              subtitle="Users who made purchases"
            />
          </Grid>

          {/* Conversion Rate */}
          <Grid item xs={12} sm={6}>
            <TrafficStatCard
              title="Conversion Rate"
              value={`${traffic.conversionRate || 0}%`}
              icon={<TrendingUp />}
              color="warning.main"
              subtitle="Buyers / Total Visitors"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* User Verification Status */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            User Verification Status
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUser sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Verified</Typography>
                </Box>
                <Chip label={traffic.verifiedUsers || 0} size="small" color="success" />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ fontSize: 16, mr: 1, color: 'warning.main' }} />
                  <Typography variant="body2">Unverified</Typography>
                </Box>
                <Chip label={traffic.unverifiedUsers || 0} size="small" color="warning" />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Login Methods */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Login Methods
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonAdd sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Manual</Typography>
                </Box>
                <Chip label={traffic.manualLoginUsers || 0} size="small" color="primary" />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Google sx={{ fontSize: 16, mr: 1, color: 'error.main' }} />
                  <Typography variant="body2">Google</Typography>
                </Box>
                <Chip label={traffic.googleLoginUsers || 0} size="small" color="error" />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WebsiteTrafficStats;
