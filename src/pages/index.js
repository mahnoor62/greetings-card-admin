import Head from 'next/head';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';

const Page = () => {

  const router = useRouter();

  router.push('/login');

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
