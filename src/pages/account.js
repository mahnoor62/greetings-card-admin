import Head from 'next/head';
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Unstable_Grid2 as Grid, 
  Paper, 
  Card, 
  CardContent,
  Chip,
  Avatar,
  Divider,
  Fade,
  Skeleton
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import UpdateProfile from '../components/dashboard/account/update-profile';
import UpdatePassword from '../components/dashboard/account/update-password';
import { 
  TrendingUp, 
  Visibility, 
  ShoppingCart, 
  CardGiftcard,
  People,
  AttachMoney,
  Star,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

const Page = () => (
  
  <>
    <Head>
      <title>
        Account | Incardible
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'left', mb: 4 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                //   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                //   backgroundClip: 'text',
                //   WebkitBackgroundClip: 'text',
                //   WebkitTextFillColor: 'transparent',
                //   letterSpacing: '-0.02em'
                }}
              >
                Account Management
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                //   maxWidth: '600px', 
                //   mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Manage your account settings, update your profile information, and change your password.
              </Typography>
            </Box>
          </Fade>

          {/* Profile Management Section */}
          <Fade in timeout={1000}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid container spacing={4}>
                <Grid xs={12} md={6}>
                  <Box 
                    sx={{ 
                    //   p: 4, 
                      borderRadius: 3,
                    //   boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    //   border: '1px solid rgba(0,0,0,0.05)',
                    //   background: 'rgba(255,255,255,0.9)',
                    //   backdropFilter: 'blur(10px)',
                    //   transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        // boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <UpdateProfile/>
                  </Box>
                </Grid>
                <Grid xs={12} md={6}>
                  <Box 
                    sx={{ 
                    //   p: 4, 
                      borderRadius: 3,
                    //   boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    //   border: '1px solid rgba(0,0,0,0.05)',
                    //   background: 'rgba(255,255,255,0.9)',
                    //   backdropFilter: 'blur(10px)',
                    //   transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        // boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <UpdatePassword/>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Stack>
      </Container>
    </Box>
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
