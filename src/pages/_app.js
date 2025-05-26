import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline , Box} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AuthConsumer, AuthProvider } from 'src/contexts/auth-context';
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import 'simplebar-react/dist/simplebar.min.css';
import { Toaster } from 'react-hot-toast';
import '../../public/style.css';
const clientSideEmotionCache = createEmotionCache();
import { CardProvider } from '../contexts/cardIdContext';


const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const SplashScreen = () => null;

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useNProgress();

  const getLayout = Component.getLayout ?? ((page) => page);

  const theme = createTheme();

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>
          {process.env.NEXT_PUBLIC_APP_NAME}
        </title>
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width"
        />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Toaster/>
          <ThemeProvider theme={theme}>
            <CardProvider>
            <CssBaseline/>
            <AuthConsumer>
              {(auth) =>
                auth.isLoading ? (
                  <SplashScreen />
                ) : (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    minHeight:'100vh',
                    backgroundImage: `url(${WEB_URL}/bg1.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}>
                    {
                      getLayout(<Component {...pageProps} />)
                    }
                  </Box>
                )
              }
            </AuthConsumer>
            </CardProvider>
          </ThemeProvider>
        </AuthProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
};

export default App;
