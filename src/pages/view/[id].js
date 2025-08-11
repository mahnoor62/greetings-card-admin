import Head from 'next/head';
import {
  Card, Box,
  CardContent, CardActions, CardMedia, CardActionArea, IconButton,
  Container,
  Typography, Grid, Button, useMediaQuery, useTheme, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import NextLink from 'next/link';
import { useCardContext } from '../../contexts/cardIdContext';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/use-auth';
import toast from 'react-hot-toast';
import QRCodeGenerator from '../../components/qrCode';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AR_EXPERIENCE_LINK = process.env.NEXT_PUBLIC_AR_EXPERIENCE_LINK;
const Id = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [card, setCard] = useState(null);
  const [openDialogue, setOpenDialogue] = useState(false);
  const { user } = useAuth();
  const token = user?.token;
  const router = useRouter();
  const { id } = router.query;

  const getCard = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/get-single-transaction-detail/${id}`,
        {
          headers: {
            'x-access-token': token
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

  const videoPath = card?.cardId?.video
    ? `${BASE_URL}/${card?.cardId?.video.replace(/\\/g, '/')}`
    : null;

  const printReceipt = () => {
    const printContents = document.getElementById('card').innerHTML;
    const styles = `
    <style>
      @media print {
        @page {
          margin: 0;
        }
        body {
          margin: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji' !important;
          zoom: 180%; 
        }
        .print-only {
          display: block !important;
        }
      }
      .print-only {
        display: none;
      }
    </style>`;

    const originalTitle = document.title;
    document.title = `Delivery Receipt-${transactionId}`;
    // Create a new iframe element
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>Print Receipt</title>');
    doc.write(styles); // Inject styles
    doc.write('</head><body>');
    doc.write(printContents);
    doc.write('</body></html>');
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Remove the iframe after printing
    iframe.contentWindow.onafterprint = () => {
      document.body.removeChild(iframe);
      document.title = originalTitle;
    };
  };

  const handleClickOpen = (trans) => {
    setSelectedTransaction(trans);
    setOpenDialogue(true);
  };

  const handleClose = () => {
    setOpenDialogue(false);
  };

  return (
    <>
      <Head>
        <title>
          View | {APP_NAME}
        </title>
      </Head>

      <Box sx={{
        pt: { xs: 10, md: 5 },
        pb: { xs: 10 },
        height: { md: '100% !important', lg: '100% !important', xs: '100% !important' },
        minHeight: '100vh'
      }}>
        <Container sx={{

          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: { xs: 'column' },
          height: { md: '100%' },
          pt: 5
          // pb: 10
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <Typography variant="h4">
              View Card Customization
            </Typography>
            <IconButton aria-describedby={id} onClick={printReceipt}>
              <Tooltip title="Print Card">
                <PrintIcon sx={{ color: 'black', fontSize: 30 }}/>
              </Tooltip>
            </IconButton>
          </Box>
          <Grid container spacing={2} sx={{
            display: 'flex',
            // bgcolor:'blue',
            justifyContent: 'center',
            alignItems: 'center',
            height: { md: '100%' },
            flexGrow: 1
          }}>
            <Grid item xs={6} md={3} lg={3} sx={{
              display: 'flex',
              order: 1,
              // width: '100%',
              // bgcolor:'yellow',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
              // height: '100%'
            }}>
              {
                card?.cardId?.frontDesign ? (
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1.414',
                      position: 'relative',
                      mb: 1.1
                    }}
                  >
                    <Box
                      component="img"
                      loading="lazy"
                      src={`${BASE_URL}/${card?.cardId?.frontDesign.replace(/\\/g, '/')}`}
                      alt="Front Design"
                      sx={{
                        mb: 1.1,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        // aspectRatio: '1 / 1.414',
                        objectFit: 'contain',
                        borderRadius: 0,
                        zIndex: 1
                      }}
                    />


                    {/*{*/}
                    {/*  videoPath && (*/}
                    {/*    <Box*/}
                    {/*      autoPlay*/}
                    {/*      muted*/}
                    {/*      loop*/}
                    {/*      playsInline*/}
                    {/*      component="video"*/}
                    {/*      src={videoPath}*/}
                    {/*      sx={{*/}
                    {/*        position: 'absolute',*/}
                    {/*        // top: 0,*/}
                    {/*        // left: 0,*/}
                    {/*        // mb:1.1,*/}
                    {/*        // transform: 'translate(-50%, -50%)',*/}
                    {/*        width: '100%',*/}
                    {/*        // aspectRatio: '1 / 1.414',*/}
                    {/*        height: '100%',*/}
                    {/*        objectFit: 'cover',*/}
                    {/*        zIndex: 2*/}
                    {/*        // borderRadius: 2*/}
                    {/*      }}*/}
                    {/*    />*/}

                    {/*  )*/}
                    {/*}*/}

                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: { lg: 320, xs: '100%', md: 250 },
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
                alignItems: 'center'
                // mt: 2
                // gap: 1
              }}>
                {/*<AddCircleRoundedIcon sx={{color:'grey'}}/>*/}
                <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                  Front design
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6} sx={{
              // bgcolor:'red',
              width: '100%',
              order: { md: 2, xs: 3 },
              // p:'0 !important',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center'
              // height: '100%',

            }}>
              {
                card ? (
                  // <Box
                  //   sx={{

                  //   // bgcolor: '#f0f3f8',
                  //   width: { md: '100%', xs: '100%', ipad : '90%'},
                  //   height: {lg: 450 , xs:'100%', md:400, ipad:500},
                  //   // height: '100%',
                  //   borderRadius: 0,
                  //   overflow: 'hidden'
                  //   }}
                  // >
                  <Box
                    sx={{
                      width: '100%',
                      // aspectRatio: '2 / 1.414',
                      // display: 'flex',
                      // justifyContent: 'space-between',
                      // alignItems: 'center',
                      // width: '100%',
                      // height: '100%',
                      position: 'relative',
                      px: { md: '8px' }
                    }}
                  >
                    {/* Inside Left Design */}
                    <Box
                      component="img"
                      loading="lazy"
                      src={`${BASE_URL}/${card?.cardId?.insideLeftDesign?.replace(/\\/g, '/')}`}
                      alt="Inside Left"
                      sx={{
                        width: '50%',
                        aspectRatio: '1 / 1.414',
                        // height: '100%',
                        objectFit: 'contain'
                      }}
                    />

                    {/* Center Line */}
                    <Box
                      sx={{
                        width: '2px',
                        height: { xs: '97%', md: '98.5%' },
                        bgcolor: 'grey',
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        transform: 'translateX(-1px)'
                      }}
                    />

                    {/* Inside Right Design */}
                    <Box
                      component="img"
                      loading="lazy"
                      src={`${BASE_URL}/${card?.cardId?.insideRightDesign?.replace(/\\/g, '/')}`}
                      alt="Inside Right"
                      sx={{
                        width: '50%',
                        aspectRatio: '1 / 1.414',
                        // height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                  // </Box>
                ) : (
                  <Card sx={{
                    // bgcolor: '#f0f3f8',
                    // width: { lg: 530, xs: '100%' , md:450},
                    // height: 450,
                    // // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.06), 0px 0px 0px rgba(0, 0, 0, 0)',
                    // borderRadius: 0
                  }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      width: '100%'
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
                alignItems: 'center'
                // mt: 2
                // gap: 1
              }}>
                {/*<AddCircleRoundedIcon sx={{color:'grey'}}/>*/}
                <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                  Inside design
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} lg={3} sx={{
              // bgcolor:'grey',
              display: 'flex',
              order: 2,
              // bgcolor:'red',
              width: '100%',
              aspectRatio: '1 / 1.414',
              // justifyContent: 'center',
              flexDirection: 'column'
              // alignItems: 'center',
              // height: '100%'
            }}>

              {
                card?.cardId?.backDesign ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1.414',
                      mb: 1.1
                    }}
                  >
                    <Box
                      component="img"
                      loading="lazy"
                      src={`${BASE_URL}/${card?.cardId?.backDesign.replace(/\\/g, '/')}`}
                      alt="Back Design"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 0
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '10%', // adjust this value as needed
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        // bgcolor: 'white',
                        borderRadius: 1,
                        p: 0.5,
                        boxShadow: 2
                      }}
                    >
                      <QRCodeGenerator value={`${AR_EXPERIENCE_LINK}/${id}`} style={{
                        height: isMobile ? 30 : 100,
                        width: isMobile ? 30 : 100
                      }}/>
                    </Box>
                  </Box>
                  // <Box
                  //   component="img"
                  //   loading="lazy"
                  //   src={`${BASE_URL}/${card?.cardId?.backDesign.replace(/\\/g, '/')}`}
                  //   alt="Front Design"
                  //   sx={{
                  //     position:'relative',
                  //     mb: 1.1,
                  //     width: '100%',
                  //     // width: { lg: '100%', xs: '80%', md: '100%', ipad: '55%' },
                  //     // height: {md: 450 , xs:'100%'},
                  //     aspectRatio: '1 / 1.414',
                  //     // height: '100%',
                  //
                  //     // height: {lg: 450 , xs:400, md:400,ipad:500},
                  //     objectFit: 'contain',
                  //     borderRadius: 0
                  //   }}
                  // />

                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      jusitfyContent: 'center',
                      alignItems: 'center',
                      width: { lg: 320, xs: '100%', md: 250 },
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
                alignItems: 'center'
                // mt: 2
                // gap: 1
              }}>
                {/*<AddCircleRoundedIcon sx={{color:'grey'}}/>*/}
                <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                  Back design
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Dialog
          fullScreen={fullScreen}
          open={openDialogue}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title" sx={{ paddingBottom: 0 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}>
              <Typography variant="h5">
                Receipt
              </Typography>
              <IconButton aria-describedby={id} onClick={printReceipt}>
                <PrintIcon sx={{ color: 'black', fontSize:30 }}/>
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <div
              id="card"
              className="card"
              style={{
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'space-around'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  paddingTop: '40px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <h4>Card</h4>
                  <button
                    onClick={printReceipt}
                    aria-describedby="id"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
        <span title="Print Card">
          <svg style={{ color: 'black', fontSize: '30px' }}/>
        </span>
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    flexWrap: 'wrap',
                    width: '100%'
                  }}
                >
                  {/* Front Design */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flex: '1 1 25%',
                      maxWidth: '25%'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1.414',
                        position: 'relative',
                        marginBottom: '1.1rem'
                      }}
                    >
                      <img
                        src="BASE_URL/frontDesign"
                        alt="Front Design"
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: 0,
                          zIndex: 1
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ color: 'black', fontWeight: 900 }}>Front design</p>
                    </div>
                  </div>

                  {/* Inside Design */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '1 1 50%',
                      maxWidth: '50%'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        position: 'relative',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        src="BASE_URL/insideLeftDesign"
                        alt="Inside Left"
                        loading="lazy"
                        style={{
                          width: '50%',
                          aspectRatio: '1 / 1.414',
                          objectFit: 'contain'
                        }}
                      />
                      <div
                        style={{
                          width: '2px',
                          height: '98.5%',
                          backgroundColor: 'grey',
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          transform: 'translateX(-1px)'
                        }}
                      />
                      <img
                        src="BASE_URL/insideRightDesign"
                        alt="Inside Right"
                        loading="lazy"
                        style={{
                          width: '50%',
                          aspectRatio: '1 / 1.414',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ color: 'black', fontWeight: 900 }}>Inside design</p>
                    </div>
                  </div>

                  {/* Back Design */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flex: '1 1 25%',
                      maxWidth: '25%'
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1.414',
                        marginBottom: '1.1rem'
                      }}
                    >
                      <img
                        src="BASE_URL/backDesign"
                        alt="Back Design"
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: 0
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '10%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 10,
                          borderRadius: '4px',
                          padding: '4px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div
                          id="qr-code"
                          style={{
                            width: '100px',
                            height: '100px'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ color: 'black', fontWeight: 900 }}>Back design</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>


      </Box>
    </>
  );
};

Id.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Id;
