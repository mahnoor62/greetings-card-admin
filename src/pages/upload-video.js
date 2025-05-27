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
  const [previewURL, setPreviewURL] = useState(null);

  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState();
  const inputRef = useRef();
  const { selectedCardId } = useCardContext();


  const handleVideoClick = () => {
    inputRef.current.click();
  };

  // const handleVideoSelect = (e) => {
  //   // const file = e.target.files[0];
  //
  //   // if (!file.type.startsWith('video/')) {
  //   //   toast.error('Please select a valid video file');
  //   //   return;
  //   // }
  //   //
  //   // const sizeInMB = file.size / (1024 * 1024);
  //   //
  //   // if (sizeInMB > 1) {
  //   //   toast.error(`Video too large. Selected file is ${sizeInMB.toFixed(2)} MB. Max allowed is 1 MB.`);
  //   //   return;
  //   // }
  //   //
  //   // setVideo(file);
  //   // const preview = URL.createObjectURL(file);
  //   // setPreviewURL(preview);
  //
  //   const file = e.target.files[0];
  //   const sizeInMB = file.size / (1024 * 1024);
  //
  //   if (sizeInMB > 1) {
  //     toast.error(`Video size is too large. Selected file is ${sizeInMB.toFixed(2)} MB. Max allowed size is 1 MB.`,{
  //       duration: 3000,
  //     });
  //     return;
  //   }
  //
  //   if (file && file.type.startsWith('video/')) {
  //     setVideo(file);
  //     const preview = URL.createObjectURL(file);
  //     setPreviewURL(preview);
  //   } else {
  //     toast.error('Please select a valid video file');
  //   }
  // };
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 1) {
      toast.error(
        `Video size is too large. Selected file is ${sizeInMB.toFixed(2)} MB. Max allowed size is 1 MB.`,
        { duration: 3000 }
      );
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = () => {
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;

      URL.revokeObjectURL(videoElement.src); // Clean up object URL

      if (width === 148 && height === 210) {
        setVideo(file);
        const preview = URL.createObjectURL(file);
        setPreviewURL(preview);
      } else {
        toast.error(
          `Invalid video dimensions. Required: 148x210. Selected: ${width}x${height}`,
          { duration: 3000 }
        );
      }
    };

    videoElement.onerror = () => {
      toast.error('Failed to load video metadata. Please try a different file.');
    };

    videoElement.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);



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
    setLoading(true);
    try {
      const card = await axios.get(`${BASE_URL}/api/cards/get/${selectedCardId}`, {
        headers: {
          'x-access-token': token
        }
      });
      setCard(card.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      // setLoading(true);
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
          pt: {xs: 15, md:5 },
          height: {md: '100vh !important', lg:'100vh !important',xs:'100vh !important'},
          width: '100%',
          // height: {md: '100%', lg:'100%', xl:'100vh' },

          // bgcolor:'red',
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
            // bgcolor:'blue',
            position:'relative',
            display: 'flex',
            flexDirection:'column',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            // flex: '1 0 auto'
          }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection:'column',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

          <Box
            component="img"
            loading="lazy"
            src={frontDesignPath}
            alt="Card Image"
            sx={{
              position: 'relative',
              width: {md: 430, xs:300 },
              height: {md: 500, xs:400 },
              objectFit: 'contain',
              // position: 'absolute',
              // top: 0,
              // left: 0
            }}
          />

          {previewURL || videoPath ? (
            <>
            <Box
              // controls
              autoPlay
              muted
              loop
              playsInline
              component="video"
              src={previewURL || videoPath}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: {md: 400, xs:300 },
                height: {md: 500, xs:400 },
                // width: 120,
                // height: 120,
                objectFit: 'cover',
                // borderRadius: 2
              }}
            />
            <Box
              onClick={handleVideoClick}
              component="img"
              src={`${WEB_URL}/videoIcon.png`}
              alt="video icon"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-70%, -70%)',
                width: 50,
                height: 50
              }}
            />
            </>
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

          </Box>

          {/* BUTTONS - OUTSIDE CONTAINER, INSIDE BOX */}



    </Container>

        <Box
          sx={{
            pt:{xl:15,md:0, xs:5},
            mb:5,
            // bgcolor:'red',
            width: '100%',
            display: 'flex',
            justifyContent: { xs: 'flex-end', md: 'flex-end' },
            alignItems: 'center',
            gap: 2,
            pr: {md: 5 , xs:5}
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
