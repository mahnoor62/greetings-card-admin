import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material';
import { 
  Star, 
  AttachMoney, 
  ShoppingCart,
  Person,
  Email,
  Phone
} from '@mui/icons-material';

const TopBuyingUser = ({ data, loading }) => {
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
            Top Buying User
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const topBuyer = data?.[0]; // Get the first (top) buyer
  
  if (!topBuyer) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Top Buying User
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No purchase data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

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
          <Person sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Top Buying User
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* User Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                mr: 2, 
                width: 60, 
                height: 60,
                fontSize: '1.5rem'
              }}>
                {topBuyer.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {topBuyer.firstName} {topBuyer.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Top Customer
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {topBuyer.email}
                </Typography>
              </Box>
              {topBuyer.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {topBuyer.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Purchase Stats */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <ShoppingCart sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {topBuyer.totalCards || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cards Purchased
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <AttachMoney sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${topBuyer.totalSpent?.toFixed(2) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Star sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {topBuyer.transactionCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TopBuyingUser;
