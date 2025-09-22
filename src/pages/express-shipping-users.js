import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  Container,
  Tooltip,
  IconButton,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import FilterHelper, { applyFilter, applyPagination } from '../utils/filter';
import toast from 'react-hot-toast';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../hooks/use-auth';

const APP_NAME = 'AR Greeting Cards';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ExpressShippingUsers = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expressUsers, setExpressUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddressData, setSelectedAddressData] = useState(null);

  const fetchExpressShippingUsers = async () => {
    try {
      setLoading(true);
      console.log("BASE_URL:", BASE_URL);
      const token = localStorage.getItem('token');
      console.log("Token exists:", !!token);
      
      const response = await axios.get(`${BASE_URL}/api/user/ar-experience/get-all-express-shipping-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Express shipping users fetched:", response.data?.data?.length || 0, "users");
      
      setExpressUsers(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching express shipping users:', error);
      toast.error('Failed to fetch express shipping users');
      setExpressUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpressShippingUsers();
  }, []);

  // Ensure expressUsers is always an array
  const safeExpressUsers = Array.isArray(expressUsers) ? expressUsers : [];
  
  const filteredUsers = applyFilter(safeExpressUsers, searchQuery, [
    'data.payment_source.paypal.name.given_name',
    'data.payment_source.paypal.name.surname',
    'data.payment_source.paypal.email_address',
    'cardCustomizationId.email',
    'cardCustomizationId.userId.firstName',
    'cardCustomizationId.userId.lastName',
    'cardCustomizationId.userId.email',
    'delivery_address',
    'suburb',
    'state',
    'postal_code',
    'phone_number',
    'paypal_order_id'
  ]);

  const paginatedUsers = applyPagination(filteredUsers, page, rowsPerPage);
  
  // Debug logging
  console.log("Filtered users:", filteredUsers.length, "Paginated users:", paginatedUsers.length);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddressModal = (user) => {
    setSelectedAddressData(user);
    setAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setAddressModalOpen(false);
    setSelectedAddressData(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>
          Express Shipping Users | {APP_NAME}
        </title>
      </Head>

      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent:'center', alignItems:'center',
          flexDirection: 'column',
          overflowY: 'auto',
          pt: {md:5, xs:15},
          pb: {md:5, xs:5}
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
               Express Shipping Users
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View all users who have opted for express shipping services
            </Typography>
          </Box>


          {/* Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {/* Table Header with Search */}
            <Box sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
                <TextField
                        variant="filled"
                        placeholder="Search..."
                        sx={{
                          '& .MuiInputBase-input': {
                            ml: 1,
                            // textAlign: 'center', // Center align input text and placeholder
                            padding: '16px 0'   // Optional: vertically center text
                          },
                          '& .MuiInputBase-root': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(71, 85, 105, 1)',
                            opacity: 1
                          },
                          height: '55px',
                          width: '100%',  // take as much space as possible
                          maxWidth: '400px',  // limit max width if needed
                          borderRadius: 1
                        }}
                        onChange={event => setSearchQuery(event.target.value)}
                        InputProps={{
                          endAdornment: (
                            <Button variant="text" disabled
                                    sx={{ background: 'transparent !important' }}>
                              <SearchIcon sx={{ ml: 1.5, color: 'rgba(71, 85, 105, 1)' }}/>
                            </Button>
                          )
                        }}
                      />
              {/* <TextField
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{
                  width: '400px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              /> */}
            </Box>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="express shipping users table">
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Card Title</TableCell>
                    <TableCell>Delivery Address</TableCell>
                    <TableCell>Express Shipping Rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Order Date</TableCell>
                  </TableRow>
                </TableHead>
                 <TableBody>
                   {paginatedUsers.length > 0 ? (
                     paginatedUsers.map((user, index) => (
                      <TableRow key={user._id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                         <TableCell>
                           <Box>
                             <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                               {user.data?.payment_source?.paypal?.name?.given_name || 
                                user.cardCustomizationId?.userId?.firstName || 
                                'Unknown'} {user.data?.payment_source?.paypal?.name?.surname || 
                                user.cardCustomizationId?.userId?.lastName || 
                                'User'}
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {user.data?.payment_source?.paypal?.email_address || 
                                user.cardCustomizationId?.email || 
                                user.cardCustomizationId?.userId?.email || 
                                'No email'}
                             </Typography>
                           </Box>
                         </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {user.paypal_order_id || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.cardCustomizationId?.cardId?.title || user.title || 'No title'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Tooltip title="View Address Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenAddressModal(user)}
                                sx={{
                                  color: '#000000',
                                  backgroundColor: '#fce7f3',
                                  border: '2px solid',
                                  borderColor: '#fce7f3',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: '#000000',
                                    color: '#fce7f3',
                                    borderColor: '#000000',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                  }
                                }}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Box sx={{ 
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}>
                              {user.delivery_address || 'No address'}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                            ${user.expressShippingRate || 0} AUD
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor: user.status === 'COMPLETED' ? 'success.light' : 
                                             user.status === 'PENDING' ? 'warning.light' : 'error.light',
                              color: user.status === 'COMPLETED' ? 'success.dark' : 
                                     user.status === 'PENDING' ? 'warning.dark' : 'error.dark'
                            }}
                          >
                            {user.status}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(user.paid_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                     ))
                   ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          No express shipping users found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery ? 'Try adjusting your search criteria' : 'No users have opted for express shipping yet'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                mb:2,
                borderTop: 1,
                borderColor: 'divider'
              }}
            />
          </Paper>
        </Container>

        {/* Address Details Modal */}
        <Dialog
          open={addressModalOpen}
          onClose={handleCloseAddressModal}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 2,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            py: 4,
            px: 4,
            borderBottom: '1px solid #e5e7eb'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              <InfoIcon sx={{ fontSize: 24, color: '#374151' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 1,
                color: '#111827',
                fontSize: '1.75rem'
              }}>
                Address Details
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6b7280',
                fontWeight: 400,
                fontSize: '1rem'
              }}>
                Complete delivery and customer information
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ 
            p: 0,
            backgroundColor: '#ffffff',
            mt: 2,
            overflowY: 'auto',
            maxHeight: '50vh',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}>
            {selectedAddressData && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3,
                p: 3,
                px: 4
              }}>
                {/* Delivery Address */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#111827',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📍 Delivery Address
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          color: '#374151',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Complete Address
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#111827' }}>
                          {selectedAddressData?.delivery_address}<br/>
                          {selectedAddressData?.suburb}<br/>
                          {selectedAddressData?.state} {selectedAddressData?.postal_code}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Contact Information */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#111827',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📞 Contact Information
                  </Typography>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          color: '#374151',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Phone Number
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '1.1rem',
                          color: '#111827',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {selectedAddressData?.phone_number}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          color: '#374151',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Customer Email
                        </Typography>
                        <Typography sx={{ 
                          color: '#111827',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {selectedAddressData?.data?.payment_source?.paypal?.email_address || 
                           selectedAddressData?.cardCustomizationId?.email || 
                           'No email'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Customer Information */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#111827',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    👤 Customer Information
                  </Typography>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          color: '#374151',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Customer Name
                        </Typography>
                        <Typography sx={{ 
                          color: '#111827',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {selectedAddressData?.data?.payment_source?.paypal?.name?.given_name || 
                           selectedAddressData?.cardCustomizationId?.userId?.firstName || 
                           'Unknown'} {selectedAddressData?.data?.payment_source?.paypal?.name?.surname || 
                           selectedAddressData?.cardCustomizationId?.userId?.lastName || 
                           'User'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          color: '#374151',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Order Status
                        </Typography>
                        <Typography sx={{ 
                          color: selectedAddressData?.status === 'COMPLETED' ? '#0ea5e9' : '#ef4444',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {selectedAddressData?.status || 'Unknown'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
            <Button 
              onClick={handleCloseAddressModal} 
              variant="outlined"
              sx={{
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '1px solid #d1d5db',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  borderColor: '#9ca3af',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease-in-out'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

ExpressShippingUsers.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default ExpressShippingUsers;
