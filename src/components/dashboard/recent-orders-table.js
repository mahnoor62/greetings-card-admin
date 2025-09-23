import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material';
import { 
  ShoppingCart, 
  AttachMoney, 
  Person,
  LocalShipping,
  CheckCircle,
  Pending
} from '@mui/icons-material';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
      case 'delivered':
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
      case 'delivered':
      case 'completed':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'pending':
      case 'processing':
        return <Pending sx={{ fontSize: 16 }} />;
      default:
        return <LocalShipping sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Chip
      icon={getStatusIcon(status)}
      label={status || 'Pending'}
      color={getStatusColor(status)}
      size="small"
      variant="outlined"
    />
  );
};

const RecentOrdersTable = ({ data, loading }) => {
  if (loading) {
    return (
      <Paper sx={{ 
        p: 3, 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Recent Orders
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  const orders = data?.recentOrders || [];

  return (
    <Paper sx={{ 
      p: 3, 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ShoppingCart sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Recent Orders
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              '& .MuiTableCell-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                color: 'text.primary',
                borderBottom: '2px solid',
                borderColor: 'primary.main'
              }
            }}>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <TableRow key={order._id || index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      #{order._id?.slice(-8) || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        {order.user_id?.firstName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {order.user_id?.firstName} {order.user_id?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.user_id?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.title || 'Custom Card'}
                    </Typography>
                    {order.expressShipping && (
                      <Chip
                        label="Express"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                        ${order.total || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={order.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentOrdersTable;
