import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { withAuthGuard } from 'src/hocs/with-auth-guard';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';

const SIDE_NAV_WIDTH = 280;
const TOP_NAV_HEIGHT = 64;

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  // overflowY:'hidden',
  flex: '1 1 auto',
  maxWidth: '100%',
  // height:'100vh'
  // [theme.breakpoints.up('lg')]: {
  //   paddingLeft: SIDE_NAV_WIDTH
  // }
}));

const LayoutContainer = styled('div')({
  // overflowY:'hidden',
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
  // height:'100vh'
});

export const Layout = withAuthGuard((props) => {
  const { children } = props;
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);

  const handlePathnameChange = useCallback(
    () => {
      if (openNav) {
        setOpenNav(false);
      }
    },
    [openNav]
  );

  useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

  return (
    <>
      <TopNav onNavOpen={() => setOpenNav(true)} />
      {/*<SideNav*/}
      {/*  onClose={() => setOpenNav(false)}*/}
      {/*  open={openNav}*/}
      {/*/>*/}
      <LayoutRoot>
        <LayoutContainer >
          {children}
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
});
