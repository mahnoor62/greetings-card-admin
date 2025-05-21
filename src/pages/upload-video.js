import Head from 'next/head';
import {
  Card, Box,
  CardContent, CardActions, CardMedia, CardActionArea, CircularProgress,
  Container,
  Typography, Grid, Button
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as React from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import NextLink from 'next/link';
import { useCardContext } from '../contexts/cardIdContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/use-auth';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const UploadVideo = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState();
  const inputRef = useRef();
  const { selectedCardId } = useCardContext();


  const handleVideoClick = () => {
    inputRef.current.click();
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
    } else {
      toast.error('Please select a valid video file');
    }
  };

  const handleSave = async () => {
    if (!video) {
      toast.error('Please select a video');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('id', selectedCardId);
      formData.append('video', video);

      await axios.post(`${BASE_URL}/api/cards/upload-video-design`, formData, {
        headers: {
          'x-access-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Video uploaded successfully');
      // router.push('/preview');
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Failed to upload video');
      setLoading(false);
    }
  };

  const getCardDetails = async () => {
    try {

      const card = await axios.get(`${BASE_URL}/api/cards/get/${selectedCardId}`, {
        headers: {
          'x-access-token': token
        }
      });
      setCard(card.data.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCardDetails();
  }, [selectedCardId]);

  const frontDesignPath = card?.frontDesign
    ? `${BASE_URL}/${card?.frontDesign.replace(/\\/g, '/')}`
    : `${WEB_URL}/card.png`;

  const videoPath = card?.video
    ? `${BASE_URL}/${card?.video.replace(/\\/g, '/')}`
    : null;


  return (
    <>
      <Head>
        <title>
          Upload Video | {APP_NAME}
        </title>
      </Head>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          // minHeight:'100vh',
          // backgroundImage: `url(${WEB_URL}/bg.png)`,
          // backgroundSize: 'cover',
          // backgroundPosition: 'center',
          // backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
          // , overflowY: 'hidden'
        }}

      >
        <Container
          sx={{
            mt:3,
            // bgcolor:'red',
            position:'relative',
            display: 'flex',
            // height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            // flex: '1 0 auto'
          }}
        >

          <Box
            component="img"
            src={frontDesignPath}
            alt="Card Image"
            sx={{
              position: 'relative',
              width: {md: 430, xs:300 },
              height: 530,
              objectFit: 'contain',
              // position: 'absolute',
              // top: 0,
              // left: 0
            }}
          />

          {videoPath ? (
            <Box
              component="video"
              src={videoPath}
              controls
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 120,
                height: 120,
                // objectFit: 'cover',
                borderRadius: 2
              }}
            />
          ) : (
            <Box
              onClick={handleVideoClick}
              component="img"
              src={`${WEB_URL}/videoIcon.png`}
              alt="video icon"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 50,
                height: 50
              }}
            />
          )}
          <input
            type="file"
            accept="video/*"
            hidden
            ref={inputRef}
            onChange={handleVideoSelect}
          />
          {
            loading && (
              <Box sx={{
                display: 'flex', position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <CircularProgress/>
              </Box>
            )
          }

          {/*</Box>*/}
        </Container>

        {/* BUTTONS - OUTSIDE CONTAINER, INSIDE BOX */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            alignItems: 'center',
            gap: 2,
            pr: {md: 5 , xs:0}
          }}
        >
          <NextLink href={`/preview?id=${selectedCardId}`} passHref legacyBehavior>
            <Button
              // onClick={handleSkip}
              sx={{
                textAlign: 'center',
                color: 'black',
                bgcolor: '#d9d9d9',
                minWidth: { md: 150, xs: 100 },
                '&:hover': {
                  bgcolor: '#d9d9d9'
                }
              }}
              variant="contained"
            >
              Skip
            </Button>
          </NextLink>
          <NextLink href={`/preview?id=${selectedCardId}`} passHref legacyBehavior>
            <Button
              // onClick={handleSkip}
              sx={{
                textAlign: 'center',
                color: 'black',
                bgcolor: '#d9d9d9',
                minWidth: { md: 150, xs: 100 },
                '&:hover': {
                  bgcolor: '#d9d9d9'
                }
              }}
              variant="contained"
            >
              Preview
            </Button>
          </NextLink>
          {/*<NextLink href="/dashboard" passHref legacyBehavior>*/}
          <Button
            onClick={handleSave}
            sx={{
              textAlign: 'center',
              backgroundColor: '#c09b9b !important',
              color: '#1a1d25',
              minWidth: { md: 150, xs: 100 },
              '&:hover': {
                backgroundColor: '#c09b9b !important',
                color: '#1a1d25'
              }
            }}
            variant="contained"
          >
            Save
          </Button>
          {/*</NextLink>*/}
        </Box>
      </Box>

    </>
  );
};

UploadVideo.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default UploadVideo;
