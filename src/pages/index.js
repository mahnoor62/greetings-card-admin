import Head from 'next/head';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from 'src/hooks/use-auth';
import { useEffect } from 'react';

const Page = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/cards');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <>
      <Head>
        <title>
          Homepage | {process.env.NEXT_PUBLIC_APP_NAME}
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
      </Box>
    </>
  );
};

export default Page;
