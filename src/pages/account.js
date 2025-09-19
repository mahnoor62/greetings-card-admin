import Head from 'next/head';
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import UpdateProfile from '../components/dashboard/account/update-profile';
import UpdatePassword from '../components/dashboard/account/update-password';

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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        height:'100%',
        width: '100%'
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent:'center',
          alignItems: 'center',
          width: '100%',
          height:'100%',
          py: 4
        }}
      >
        <Stack
          spacing={3}
          sx={{ 
            width: '100%',
            height:'100%',
            maxWidth: '100%',
            // bgcolor: 'green',
            alignItems: 'center',
            display: 'flex',
            justifyContent:'center'
          }}>
          <div style={{ width: '100%' }}>
            <Typography 
              variant="h2"
              sx={{
                display: 'flex',
                // justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
                ,
                ml:2
              }}
            >
              Profile
            </Typography>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Grid
              container
              spacing={3}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                // maxWidth: '1000px',
                // bgcolor: 'red'
              }}
            >
              <Grid
                xs={12}
                sm={10}
                md={6}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <UpdateProfile/>
              </Grid>
              <Grid
                xs={12}
                sm={10}
                md={6}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <UpdatePassword/>
              </Grid>
            </Grid>
          </div>
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
