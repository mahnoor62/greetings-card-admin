import Head from 'next/head';
import {
  Card, Box,
  CardContent, CardActions, CardMedia, CardActionArea,
  Container,
  Typography, Grid, Button
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import NextLink from 'next/link';
import { useCardContext } from '../contexts/cardIdContext';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/use-auth';
import toast from 'react-hot-toast';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Preview = () => {
  const [card, setCard] = useState(null);
  const { user } = useAuth();
  const token = user?.token;
  const router = useRouter();
  const { id } = router.query;
  // const { selectedCardId } = useCardContext();

  const getCard = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cards/get/${id}`, {
        headers: {
          'x-access-token': token,
        }
      });
      setCard(res.data.data);
    } catch (error) {
      console.log(error);
      // toast.error(error.response.data.msg);
    }

  };

  useEffect(() => {
    getCard();
  }, [id]);


  const videoPath = card?.video
    ? `${BASE_URL}/${card?.video.replace(/\\/g, '/')}`
    : null;

  return (
    <>
      <Head>
        <title>
          Preview | {APP_NAME}
        </title>
      </Head>
      <Box sx={{
        pt: {xs: 10, md:5 },
        pb:{xs:10},
        height: {md: '100vh !important',xs:'100% !important'},
        // minHeight:"100vh"
      }}>
        <Container sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          pt: 5,
          // pb: 10
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3} lg={3} sx={{
              display: 'flex',
              width:'100%',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              position:'relative'
              // height: '100%'
            }}>
              {
                card?.frontDesign ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: { lg: '100%', xs: '80%' , md:'100%', ipad : '55%'},
                      // height: {md: 450 , xs:'100%'},
                      height: {lg: 450 , xs:400, md:400, ipad:500},
                      // width: { md: '100%', xs: '100%' },
                      // height: {md: 450 , xs:400},
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                  <Box
                    component="img"
                    src={`${BASE_URL}/${card.frontDesign.replace(/\\/g, '/')}`}
                    alt="Front Design"
                    sx={{
                      position:'relative',
                      width: { md: '100%', xs: '100%' },
                      height: '100%',
                      // objectFit: 'cover',
                      borderRadius: 0,
                      zIndex:1
                    }}
                  />
                    {
                      videoPath && (
                        <Box
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                          component="video"
                          src={videoPath}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            // transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex:2
                            // borderRadius: 2
                          }}
                        />
                      )
                    }

                  </Box>

                ) : (
                  <Box
                    sx={{
                      width: { lg: 320, xs: '100%' , md:250},
                      height: 450,
                      bgcolor: '#f0f3f8',
                      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                      borderRadius: 0
                    }}
                  />
                )
              }


              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mt: { md: 5, xs: 2 },
                gap: 1
              }}>
                {/*<AddCircleRoundedIcon sx={{color:'grey'}}/>*/}
                <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                  Front design
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6} sx={{
              // bgcolor:'red',
              width:'100%',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%'
            }}>
              {
                card ? (
                  <Box
                    sx={{
                      // bgcolor: '#f0f3f8',
                      width: { md: '100%', xs: '100%', ipad : '90%'},
                      // height: '100%',
                      borderRadius: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      {/* Inside Left Design */}
                      <Box
                        component="img"
                        src={`${BASE_URL}/${card?.insideLeftDesign?.replace(/\\/g, '/')}`}
                        alt="Inside Left"
                        sx={{
                          width: '50%',
                          height: '100%',
                          // objectFit: 'cover'
                        }}
                      />

                      {/* Center Line */}
                      <Box
                        sx={{
                          width: '2px',
                          height: '100%',
                          bgcolor: 'grey',
                          position: 'absolute',
                          left: '50%',
                          top:1,
                          transform: 'translateX(-1px)'
                        }}
                      />

                      {/* Inside Right Design */}
                      <Box
                        component="img"
                        src={`${BASE_URL}/${card?.insideRightDesign?.replace(/\\/g, '/')}`}
                        alt="Inside Right"
                        sx={{
                          width: '50%',
                          height: '100%',
                          // objectFit: 'cover'
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Card sx={{
                    bgcolor: '#f0f3f8',
                    width: { lg: 530, xs: '100%' , md:450},
                    height: 450,
                    // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.06), 0px 0px 0px rgba(0, 0, 0, 0)',
                    borderRadius: 0
                  }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      width: '100%',
                      // height: '100%'
                    }}>

                      <div className="vertical-line-preview"></div>
                    </Box>
                  </Card>
                )
              }

              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mt: { md: 5, xs: 2 },
                gap: 1
              }}>
                {/*<AddCircleRoundedIcon sx={{color:'grey'}}/>*/}
                <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                  Inside design
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3} lg={3} sx={{
              // bgcolor:'grey',
              display: 'flex',
              width:'100%',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%'
            }}>

              {
                card?.backDesign ? (
                  <Box
                    component="img"
                    src={`${BASE_URL}/${card.backDesign.replace(/\\/g, '/')}`}
                    alt="Front Design"
                    sx={{
                      width: { lg: '100%', xs: '80%' , md:'100%', ipad : '55%'},
                      // height: {md: 450 , xs:'100%'},
                      height: {lg: 450 , xs:400, md:400,ipad:500},
                      // objectFit: 'cover',
                      borderRadius: 0
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display:'flex',
                      jusitfyContent:'center',
                      alignItems:'center',
                      width: { lg: 320, xs: '100%', md:250 },
                      height: 450,
                      bgcolor: '#f0f3f8',
                      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                      borderRadius: 0
                    }}
                  />
                )
              }
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mt: { md: 5, xs: 2 },
                gap: 1
              }}>
                {/*<AddCircleRoundedIcon sx={{color:'grey'}}/>*/}
                <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                  Back design
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/*<Box*/}
        {/*  sx={{*/}
        {/*    width: '100%',*/}
        {/*    display: 'flex',*/}
        {/*    justifyContent: { xs: 'center', md: 'flex-end' },*/}
        {/*    // alignItems: 'center',*/}
        {/*    p: 3*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <NextLink href='/dashboard' passHref legacyBehavior>*/}
        {/*    <Button*/}
        {/*      // onClick={handleSkip}*/}
        {/*      sx={{*/}
        {/*        textAlign: 'center',*/}
        {/*        color: 'black',*/}
        {/*        bgcolor: '#d9d9d9',*/}
        {/*        minWidth: { md: 150, xs: 100 },*/}
        {/*        '&:hover': {*/}
        {/*          bgcolor: '#d9d9d9'*/}
        {/*        }*/}
        {/*      }}*/}
        {/*      variant="contained"*/}
        {/*    >*/}
        {/*      Dashboard*/}
        {/*    </Button>*/}
        {/*  </NextLink>*/}
        {/*</Box>*/}
      </Box>
    </>
  );
};

Preview.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Preview;
