import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  AttachMoney,
  Visibility,
  Star,
  LocalShipping,
  CheckCircle
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <Card sx={{ 
    height: '100%', 
    position: 'relative', 
    overflow: 'visible',
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ 
          bgcolor: color, 
          mr: 2,
          width: 56,
          height: 56,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="div" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {value}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
      </Box>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TrendingUp sx={{ fontSize: 18, color: 'success.main', mr: 0.5 }} />
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
            {trend}
          </Typography>
        </Box>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ 
          mt: 1, 
          display: 'block',
          fontWeight: 500
        }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const StatisticsCards = ({ data, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <LinearProgress />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const stats = data?.overview || {};

  return (
    <Grid container spacing={3}>
      {/* Total Users */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<People />}
          color="primary.main"
          subtitle="Registered users"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Visitors"
          value={stats.totalVisitors || 0}
          icon={<Visibility />}
          color="secondary.main"
          subtitle="Website visitors"
        />
      </Grid>

      {/* Total Revenue */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue || 0}`}
          icon={<AttachMoney />}
          color="success.main"
          subtitle="Total sales"
        />
      </Grid>

      {/* Total Transactions */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Orders"
          value={stats.totalTransactions || 0}
          icon={<ShoppingCart />}
          color="warning.main"
          subtitle="Completed orders"
        />
      </Grid>

      {/* Total Visitors */}
     
    </Grid>
  );
};

export default StatisticsCards;
