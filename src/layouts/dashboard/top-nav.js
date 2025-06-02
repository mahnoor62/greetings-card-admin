import PropTypes from 'prop-types';
import Bars3Icon from '@heroicons/react/24/solid/Bars3Icon';
import { useRouter } from 'next/router';
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  SvgIcon,
  useMediaQuery, Container,
  Collapse, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { usePopover } from 'src/hooks/use-popover';
import { AccountPopover } from './account-popover';
import NextLink from 'next/link';
import * as React from 'react';
import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import { Layout as AuthLayout } from '../auth/layout';
import PaidIcon from '@mui/icons-material/Paid';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const SIDE_NAV_WIDTH = 280;
const TOP_NAV_HEIGHT = 60;

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
export const TopNav = (props) => {
  const { onNavOpen } = props;
  const router = useRouter();
  const pathname = router.pathname;
  const isCardCustomization = pathname.startsWith('/upload-video');
  const isAllCards = pathname.startsWith('/cards');
  const isUploadCards = pathname.startsWith('/upload-cards');
  const isPreview = pathname.startsWith('/preview');
  const isDashboard = pathname === '/dashboard';
  const isCategory = pathname === '/category';
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const accountPopover = usePopover();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Box
        component="header"
        sx={{
          // height:'100%',
          // overflowY:'hidden',
          // backdropFilter: 'blur(6px)',
          // backgroundColor: isCardCustomization ? 'white' : '#e9e9e9',
          backgroundColor: '#1a1d25 !important',
          // boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.appBar,
          width: '100% !important',
          position: 'fixed',
          pt: 0,
          top: 0
          // backgroundColor: '#1a1d25',
          // position: 'fixed',
          // width: "100%",
          // // top: 0,
          // paddingTop: 1,
          // paddingBottom: 1
          // zIndex: (theme) => theme.zIndex.appBar
        }}
      >
        <Container>
          {/*stack is used to make list*/}
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{
              p:2,
              // minHeight: TOP_NAV_HEIGHT,
              px: 2
            }}
          >
            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
            >
              <NextLink href="/dashboard"  passHref legacyBehavior>
              <Typography variant="h5" sx={{ fontWeight: 900 , color:'#c09b9b'}}>{isCardCustomization
                ? 'Front Card Customization'
                : isPreview ? 'AR Experience' : isAllCards
                  ? 'Upload Greetings Card'
                  : 'AR Greetings Card'}</Typography></NextLink>
            </Stack>
            {
              lgUp ? (<Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >

                {
                  isCategory && (
                    <NextLink href="/dashboard" passHref legacyBehavior>
                      <Button
                        sx={{
                          textAlign: 'center',
                          color:'black',
                          // display: isCardCustomization || isPreview || isDashboard || isUploadCards?  'none' : 'block',
                          minWidth: 120, '&:hover': {
                            backgroundColor: '#c09b9b !important',
                            color: 'black'
                          }
                        }}
                        variant="contained"
                      >
                        Dashboard
                      </Button>
                    </NextLink>

                  )
                }


                  <Avatar
                    onClick={accountPopover.handleOpen}
                    ref={accountPopover.anchorRef}
                    sx={{
                      display: isCardCustomization || isDashboard || isPreview  || isUploadCards ? 'block' : 'none',
                      cursor: 'pointer',
                      height: 40,
                      width: 40
                    }}
                    src={`${WEB_URL}/blank-profile.webp`}
                  />
                </Stack>) :
                (
                  <>
                  <Avatar
                    onClick={accountPopover.handleOpen}
                    ref={accountPopover.anchorRef}
                    sx={{
                      display: isCardCustomization || isDashboard || isPreview  || isUploadCards  ? 'block' : 'none',
                      cursor: 'pointer',
                      height: 40,
                      width: 40
                    }}
                    src={`${WEB_URL}/blank-profile.webp`}
                  />

            {
              isCategory && (
              <NextLink href="/dashboard" passHref legacyBehavior>
              <Button
              sx={{
              textAlign: 'center',
              color:'black',
              // display: isCardCustomization || isPreview || isDashboard || isUploadCards?  'none' : 'block',
              minWidth: 120, '&:hover': {
              backgroundColor: '#c09b9b !important',
              color: 'black'
            }
            }}
            variant="contained"
          >
            Dashboard
          </Button>
        </NextLink>

        )
        }

                  </>

                  // <IconButton onClick={() => setOpen(!open)} sx={{ p: 0 }}>
                  //   <SvgIcon fontSize="large">
                  //     <Bars3Icon/>
                  //   </SvgIcon>
                  // </IconButton>
                )
            }
          </Stack>
        </Container>
        <Collapse in={!lgUp && open}>
          <Box
            sx={{
              // backgroundColor: '#e9e9e9',
              padding: '10px',
              textAlign: 'right'
            }}
          >
            <NextLink href="/dashboard">
              <Button
                sx={{
                  display: isCardCustomization || isPreview || isDashboard || isCategory?  'none' : 'block'

                }}
                variant="contained"
              >
                Preview
              </Button>
            </NextLink>

            {/*<Avatar*/}
            {/*  onClick={accountPopover.handleOpen}*/}
            {/*  ref={accountPopover.anchorRef}*/}
            {/*  sx={{*/}
            {/*    display: isCardCustomization || isDashboard || isPreview  || isUploadCards ? 'block' : 'none',*/}
            {/*    cursor: 'pointer',*/}
            {/*    height: 40,*/}
            {/*    width: 40*/}
            {/*  }}*/}
            {/*  src={`${WEB_URL}/blank-profile.webp`}*/}
            {/*/>*/}
          </Box>
        </Collapse>
      </Box>
      <AccountPopover
        anchorEl={accountPopover.anchorRef.current}
        open={accountPopover.open}
        onClose={accountPopover.handleClose}
      />
    </>
  );
};
TopNav.getLayout = (page) => (
  <AuthLayout>
    {page}
  </AuthLayout>
);

TopNav.propTypes = {
  onNavOpen: PropTypes.func
};
