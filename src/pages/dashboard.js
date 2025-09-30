import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
import Head from 'next/head';
import { useAuth } from '../hooks/use-auth';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import dashboard components
import StatisticsCards from '../components/dashboard/statistics-cards';
import MostPopularCard from '../components/dashboard/most-popular-card';
import MostPopularARTemplate from '../components/dashboard/most-popular-ar-template';
import WebsiteTrafficStats from '../components/dashboard/website-traffic-stats';
import OrderStats from '../components/dashboard/order-stats';
import TopBuyingUser from '../components/dashboard/top-buying-user';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [topBuyingUsers, setTopBuyingUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const token = user?.token;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard overview (all time)
      const dashboardResponse = await axios.get(`${BASE_URL}/api/admin/statistics/dashboard?timeframe=all`, {
        headers: { 'x-access-token': token }
      });
      setDashboardData(dashboardResponse.data.data);

      // Fetch website traffic stats (all time)
      const trafficResponse = await axios.get(`${BASE_URL}/api/admin/statistics/website-traffic?timeframe=all`, {
        headers: { 'x-access-token': token }
      });
      setTrafficData(trafficResponse.data.data);

      // Fetch order stats (all time)
      const orderResponse = await axios.get(`${BASE_URL}/api/admin/statistics/orders?timeframe=all`, {
        headers: { 'x-access-token': token }
      });
      setOrderData(orderResponse.data.data);

      // Fetch top buying users
      const topBuyingUsersResponse = await axios.get(`${BASE_URL}/api/admin/statistics/top-buying-users?limit=1`, {
        headers: { 'x-access-token': token }
      });
      setTopBuyingUsers(topBuyingUsersResponse.data.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  return (
    <>
      <Head>
        <title>Dashboard | {APP_NAME}</title>
      </Head>

      <Box sx={{ 
        minHeight: '100vh', 
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Box  sx={{pl:'5%', pr:'5%'}}>
          {/* Elegant Header */}
          <Card sx={{ 
            mb: 10, 
            // display:'flex',justifyContent:'center', ali
            // width:'50%',
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
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  Incardible Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Complete overview of your incardible business
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 3,
              backdropFilter: 'blur(10px)'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Loading dashboard data...
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              {/* Statistics Cards */}
              <Box sx={{ mb: 4 }}>
                <StatisticsCards data={dashboardData} loading={loading} orderData={orderData} />
              </Box>

              {/* Main Content Grid */}
              <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} lg={8}>
                <Grid container spacing={4}>
                  {/* Most Popular Card */}
                  <Grid item xs={12}>
                    <MostPopularCard data={dashboardData} loading={loading} />
                  </Grid>

                  {/* Order Statistics */}
                  <Grid item xs={12}>
                    <OrderStats data={orderData} loading={loading} />
                  </Grid>
                </Grid>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} lg={4}>
                <Grid container spacing={4}>
                  {/* Most Popular AR Template */}
                  <Grid item xs={12}>
                    <MostPopularARTemplate data={dashboardData?.popularArTemplates} loading={loading} />
                  </Grid>

                  {/* Website Traffic */}
                  <Grid item xs={12}>
                    <WebsiteTrafficStats data={trafficData} loading={loading} />
                  </Grid>

                  {/* Top Buying User */}
                  <Grid item xs={12}>
                    <TopBuyingUser data={topBuyingUsers} loading={loading} />
                  </Grid>
                </Grid>
              </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

Dashboard.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Dashboard;

