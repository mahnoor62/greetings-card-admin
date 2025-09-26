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
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Pending,
  AttachMoney,
  TrendingUp,
  CardGiftcard
} from '@mui/icons-material';

const OrderStatCard = ({ title, value, icon, color, subtitle, trend }) => (
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

const OrderStats = ({ data, loading }) => {
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
            Order Statistics
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const orders = data || {};

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
          <ShoppingCart sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Order Statistics
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Total Orders */}
          <Grid item xs={12} sm={6} md={4}>
            <OrderStatCard
              title="Total Orders"
              value={orders.totalOrders || 0}
              icon={<ShoppingCart />}
              color="primary.main"
              subtitle="All orders"
            />
          </Grid>

          {/* Shipped Orders */}
          <Grid item xs={12} sm={6} md={4}>
            <OrderStatCard
              title="Shipped"
              value={orders.shippedOrders || 0}
              icon={<CheckCircle />}
              color="success.main"
              subtitle={`${orders.shippingCompletionRate || 0}% completion rate`}
            />
          </Grid>

          {/* Pending Shipping Orders */}
          <Grid item xs={12} sm={6} md={4}>
            <OrderStatCard
              title="Pending Shipping"
              value={orders.pendingShippingOrders || 0}
              icon={<Pending />}
              color="warning.main"
              subtitle="Awaiting shipment"
            />
          </Grid>

          {/* Standard Shipping */}
          <Grid item xs={12} sm={6} md={4}>
            <OrderStatCard
              title="Standard Shipping"
              value={orders.standardShippingOrders || 0}
              icon={<LocalShipping />}
              color="info.main"
              subtitle="Regular delivery orders"
            />
          </Grid>

          {/* Express Shipping */}
          <Grid item xs={12} sm={6} md={4}>
            <OrderStatCard
              title="Express Shipping"
              value={orders.expressShippingOrders || 0}
              icon={<LocalShipping />}
              color="warning.main"
              subtitle={`${orders.expressShippingRate || 0}% of orders`}
            />
          </Grid>
          
       
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Revenue Statistics */}
        {orders.revenue && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Revenue Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 1,
                  color: 'white'
                }}>
                  <AttachMoney sx={{ fontSize: 32, color: 'white', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                    ${orders.revenue.totalRevenue || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Total Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <CardGiftcard sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {orders.revenue.totalQuantity || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cards Sold
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStats;
