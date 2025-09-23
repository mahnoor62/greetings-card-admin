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
        Home | Incardible
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        width: '100%',
        // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, ml:3
                  // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  // backgroundClip: 'text',
                  // WebkitBackgroundClip: 'text',
                  // WebkitTextFillColor: 'transparent',
                  // letterSpacing: '-0.02em'
                }}
              >
                Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  ml:3,
                  maxWidth: '700px', 
                  // mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Welcome back! Here's what's happening with your AR Greeting Cards platform.
              </Typography>
            </Box>
          </Fade>

          {/* Stats Cards */}
          <Fade in timeout={1000}>
            <Grid container spacing={4}>
              {/* Most Popular Card */}
              <Grid xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  <CardContent sx={{ color: 'white', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          mr: 2,
                          width: 48,
                          height: 48,
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <CardGiftcard sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Most Popular Card
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: '2rem' }}>
                      "Valentine's Day"
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.9rem' }}>
                      1,247 downloads
                    </Typography>
                    <Chip 
                      icon={<ArrowUpward sx={{ fontSize: 16 }} />}
                      label="+12% this month" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.25)', 
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Most Popular AR Experience */}
              <Grid xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)'
                    }
                  }}
                >
                  <CardContent sx={{ color: 'white', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          mr: 2,
                          width: 48,
                          height: 48,
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <Visibility sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Popular AR Experience
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: '2rem' }}>
                      "Birthday Magic"
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.9rem' }}>
                      892 interactions
                    </Typography>
                    <Chip 
                      icon={<ArrowUpward sx={{ fontSize: 16 }} />}
                      label="+8% this month" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.25)', 
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Website Traffic */}
              <Grid xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
                    }
                  }}
                >
                  <CardContent sx={{ color: 'white', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          mr: 2,
                          width: 48,
                          height: 48,
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Website Traffic
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: '2rem' }}>
                      12,847
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.9rem' }}>
                      visitors this month
                    </Typography>
                    <Chip 
                      icon={<ArrowUpward sx={{ fontSize: 16 }} />}
                      label="+15% this month" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.25)', 
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Orders */}
              <Grid xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(67, 233, 123, 0.4)'
                    }
                  }}
                >
                  <CardContent sx={{ color: 'white', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          mr: 2,
                          width: 48,
                          height: 48,
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <ShoppingCart sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Total Orders
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: '2rem' }}>
                      2,341
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.9rem' }}>
                      orders completed
                    </Typography>
                    <Chip 
                      icon={<ArrowUpward sx={{ fontSize: 16 }} />}
                      label="+23% this month" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.25)', 
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>

          {/* Additional Stats Row */}
          <Fade in timeout={1200}>
            <Grid container spacing={4}>
              {/* Revenue */}
              <Grid xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#e3f2fd', 
                          color: '#1976d2', 
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#2e7d32', fontSize: '2.2rem' }}>
                      $45,678
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      Total revenue this month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Active Users */}
              <Grid xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#f3e5f5', 
                          color: '#7b1fa2', 
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        <People sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                        Active Users
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#7b1fa2', fontSize: '2.2rem' }}>
                      1,234
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      Users active this week
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Average Rating */}
              <Grid xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#fff3e0', 
                          color: '#f57c00', 
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        <Star sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#f57c00' }}>
                        Average Rating
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#f57c00', fontSize: '2.2rem' }}>
                      4.8/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                      Based on 892 reviews
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>

          <Divider sx={{ my: 10 }} />

          {/* Profile Management Section */}
          <Fade in timeout={1400}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 4,ml:3,
                  textAlign: 'left',
                  // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  // backgroundClip: 'text',
                  // WebkitBackgroundClip: 'text',
                  // WebkitTextFillColor: 'transparent'
                }}
              >
                Profile Management
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      boxShadow: 'none',
                      // border: '1px solid rgba(0,0,0,0.05)',
                      background: 'transparent'
                    }}
                  >
                    <UpdateProfile/>
                  </Paper>
                </Grid>
                <Grid xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      boxShadow: 'none',
                      // border: '1px solid rgba(0,0,0,0.05)',
                      background: 'transparent'
                    }}
                  >
                    <UpdatePassword/>
                  </Paper>
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
