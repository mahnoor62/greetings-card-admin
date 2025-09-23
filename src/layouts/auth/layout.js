import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Box, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Logo } from 'src/components/logo';
import { useAuth } from '../../hooks/use-auth';
import { useRouter } from 'next/router';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
// TODO: Change subtitle text

export const Layout = (props) => {
  const { children } = props;

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push('/home');
  }

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flex: '1 1 auto'
      }}
    >
      <Grid
        container
        sx={{ flex: '1 1 auto' }}
      >
        <Grid
          xs={12}
          lg={12}
          sx={{
            backgroundColor: 'background.paper',

            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <Box
            component="header"
            sx={{
              left: 0,
              p: 3,
              position: 'fixed',
              top: 0,
              width: '100%'
            }}
          >
            <Box
              component={NextLink}
              href="/"
              sx={{
                display: 'inline-flex',
                height: 32,
                width: 32
              }}
            >
              <Logo/>
            </Box>
          </Box>
          {children}
        </Grid>
        {/*<Grid*/}
        {/*  xs={12}*/}
        {/*  lg={6}*/}
        {/*  sx={{*/}
        {/*    alignItems: 'center',*/}
        {/*    // background: 'background.paper',*/}
        {/*    background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',*/}
        {/*    color: 'white',*/}
        {/*    display: 'flex',*/}
        {/*    justifyContent: 'center',*/}
        {/*    '& img': {*/}
        {/*      maxWidth: '100%'*/}
        {/*    }*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Box sx={{ p: 3 }}>*/}
        {/*    <img*/}
        {/*      alt=""*/}
        {/*      src={WEB_URL + '/' + '/logo3.png'}*/}
        {/*      width={450}*/}
        {/*    />*/}
        {/*  </Box>*/}
        {/*</Grid>*/}
      </Grid>
    </Box>
  );
};

Layout.prototypes = {
  children: PropTypes.node
};