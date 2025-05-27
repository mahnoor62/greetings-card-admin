import Head from 'next/head';
import {
  Card, Box,
  CardContent, CardActions, CardMedia, CardActionArea,
  Container,
  Typography, Grid, Button
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import * as React from 'react';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/use-auth';
import { useCardContext } from '../contexts/cardIdContext';
import NextLink from 'next/link';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Page = () => {
  const router = useRouter();
  const [card, setCard] = useState(null);
  const { selectedCardId } = useCardContext();
  const { user } = useAuth();
  const token = user?.token;
  const [image, setImage] = useState(null);
  const [backImage, setBackImage] = useState(false);
  const [insideLeftImage, setInsideLeftImage] = useState(false);
  const [insideRightImage, setInsideRightImage] = useState(false);
  // const { id } = router.query;

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file);
    }
  };

  const handleImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {

    const sizeInBytes = file.size;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

// Format size string for user-friendly display
    const sizeString = sizeInMB >= 1
      ? `${sizeInMB.toFixed(2)} MB`
      : `${sizeInKB.toFixed(2)} KB`;

// Set maximum size to 1MB (in bytes)
    const maxSizeInBytes = 1 * 1024 * 1024;

    if (sizeInBytes > maxSizeInBytes) {
      toast.error(`Image size is too large. Uploaded image size is: ${sizeString}. Max allowed: 1 MB.`,
        {
          duration: 3000
        });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // const aspectRatio = height / width; // A5 is ~1.414
        // const expectedRatio = 1.414;
        // const tolerance = 0.05; // Allow slight margin for error

        if (img.width !== 148 || img.height !== 210) {
          toast.error('Please upload an image of  148 × 210 pixels',
            {
              duration: 3000
            });
          return;
        }

        // if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        //   toast.error('Please upload an image with A5 aspect ratio (approx 1:1.414)');
        //   return;
        // }

        formik.setFieldValue('frontDesign', file);
        setImage(file);
      };
    };
    reader.readAsDataURL(file);
  };

  const formik = useFormik({
    initialValues: {
      frontDesign: ''
    },

    validationSchema: yup.object({
      // image: yup.string().required('Image of gallery is required'),
    }),
    onSubmit: async (values, { resetForm }) => {

      try {
        const formData = new FormData();
        formData.append('id', selectedCardId);
        formData.append('frontDesign', image);

        const response = await axios.post(`${BASE_URL}/api/cards/upload-front-design`, formData, {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });

        toast.success('Front Card design uploaded successfully.');
        formik.resetForm();

        document.getElementById('frontDesign').value = '';
        // setImage(null);
      } catch (error) {
        console.log('error in uploaded front card design', error);
        toast.error(error.response.data.msg);
      }
    }
  });

  useEffect(() => {
    if (image) {
      formik.handleSubmit();
    }
  }, [image]);

  const handleDropForBack = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageBackDesign(file);
    }
  };

  const handleBackImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageBackDesign(file);
    }
  };

  const processImageBackDesign = (file) => {
    const sizeInBytes = file.size;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

// Format size string for user-friendly display
    const sizeString = sizeInMB >= 1
      ? `${sizeInMB.toFixed(2)} MB`
      : `${sizeInKB.toFixed(2)} KB`;

// Set maximum size to 1MB (in bytes)
    const maxSizeInBytes = 1 * 1024 * 1024;

    if (sizeInBytes > maxSizeInBytes) {
      toast.error(`Image size is too large. Uploaded image size is: ${sizeString}. Max allowed: 1 MB.`,
        {
          duration: 3000
        });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // const aspectRatio = height / width; // A5 is ~1.414
        // const expectedRatio = 1.414;
        // const tolerance = 0.05; // Allow slight margin for error

        if (img.width !== 148 || img.height !== 210) {
          toast.error('Please upload an image of  148 × 210 pixels', {
            duration: 3000
          });
          return;
        }

        // if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        //   toast.error('Please upload an image with A5 aspect ratio (approx 1:1.414)');
        //   return;
        // }

        formik.setFieldValue('backDesign', file);
        setBackImage(file);
      };
    };
    reader.readAsDataURL(file);
  };

  const formikForBackDesign = useFormik({
    initialValues: {
      backDesign: ''
    },

    validationSchema: yup.object({
      // image: yup.string().required('Image of gallery is required'),
    }),
    onSubmit: async (values, { resetForm }) => {

      try {
        const formData = new FormData();
        formData.append('id', selectedCardId);
        formData.append('backDesign', backImage);

        const response = await axios.post(`${BASE_URL}/api/cards/upload-back-design`, formData, {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });

        toast.success('Back Card design uploaded successfully.');
        formik.resetForm();

        document.getElementById('backDesign').value = '';
        // setImage(null);
      } catch (error) {
        console.log('error in uploaded back card design', error);
        toast.error(error.response.data.msg);
      }
    }
  });

  useEffect(() => {
    if (backImage) {
      formikForBackDesign.handleSubmit();
    }
  }, [backImage]);

  // image for inside left card

  const handleDropForInsideLeft = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageInsideLeftDesign(file);
    }
  };

  const handleInsideLeftImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageInsideLeftDesign(file);
    }
  };

  const processImageInsideLeftDesign = (file) => {
    const sizeInBytes = file.size;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

// Format size string for user-friendly display
    const sizeString = sizeInMB >= 1
      ? `${sizeInMB.toFixed(2)} MB`
      : `${sizeInKB.toFixed(2)} KB`;

// Set maximum size to 1MB (in bytes)
    const maxSizeInBytes = 1 * 1024 * 1024;

    if (sizeInBytes > maxSizeInBytes) {
      toast.error(`Image size is too large. Uploaded image size is: ${sizeString}. Max allowed: 1 MB.`,
        {
          duration: 3000
        });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // const aspectRatio = height / width; // A5 is ~1.414
        // const expectedRatio = 1.414;
        // const tolerance = 0.05; // Allow slight margin for error

        if (img.width !== 148 || img.height !== 210) {
          toast.error('Please upload an image of  148 × 210 pixels', {
            duration: 3000
          });
          return;
        }

        // if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        //   toast.error('Please upload an image with A5 aspect ratio (approx 1:1.414)');
        //   return;
        // }

        formik.setFieldValue('insideLeftDesign', file);
        setInsideLeftImage(file);
      };
    };
    reader.readAsDataURL(file);
  };

  const formikForInsideLeftDesign = useFormik({
    initialValues: {
      insideLeftDesign: ''
    },

    validationSchema: yup.object({
      // image: yup.string().required('Image of gallery is required'),
    }),
    onSubmit: async (values, { resetForm }) => {

      try {
        const formData = new FormData();
        formData.append('id', selectedCardId);
        formData.append('insideLeftDesign', insideLeftImage);

        const response = await axios.post(`${BASE_URL}/api/cards/upload-inside-left-design`,
          formData,
          {
            headers: {
              'x-access-token': token,
              'Content-Type': 'multipart/form-data'
            }
          });

        toast.success('Inside left card uploaded successfully.');
        formik.resetForm();

        document.getElementById('insideLeftDesign').value = '';
        // setImage(null);
      } catch (error) {
        console.log('error in uploaded inside left card design', error);
        toast.error(error.response.data.msg);
      }
    }
  });

  useEffect(() => {
    if (insideLeftImage) {
      formikForInsideLeftDesign.handleSubmit();
    }
  }, [insideLeftImage]);

  // image for inside right card

  const handleDropForInsideRight = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageInsideRightDesign(file);
    }
  };
  const handleInsideRightImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageInsideRightDesign(file);
    }
  };

  const processImageInsideRightDesign = (file) => {
    const sizeInBytes = file.size;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

// Format size string for user-friendly display
    const sizeString = sizeInMB >= 1
      ? `${sizeInMB.toFixed(2)} MB`
      : `${sizeInKB.toFixed(2)} KB`;

// Set maximum size to 1MB (in bytes)
    const maxSizeInBytes = 1 * 1024 * 1024;

    if (sizeInBytes > maxSizeInBytes) {
      toast.error(`Image size is too large. Uploaded image size is: ${sizeString}. Max allowed: 1 MB.`,
        {
          duration: 3000
        });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // const aspectRatio = height / width; // A5 is ~1.414
        // const expectedRatio = 1.414;
        // const tolerance = 0.05; // Allow slight margin for error

        if (img.width !== 148 || img.height !== 210) {
          toast.error('Please upload an image of  148 × 210 pixels', {
            duration: 3000
          });
          return;
        }

        // if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        //   toast.error('Please upload an image with A5 aspect ratio (approx 1:1.414)');
        //   return;
        // }

        formik.setFieldValue('insideRightDesign', file);
        setInsideRightImage(file);
      };
    };
    reader.readAsDataURL(file);
  };

  const formikForInsideRightDesign = useFormik({
    initialValues: {
      insideRightDesign: ''
    },

    validationSchema: yup.object({
      // image: yup.string().required('Image of gallery is required'),
    }),
    onSubmit: async (values, { resetForm }) => {

      try {
        const formData = new FormData();
        formData.append('id', selectedCardId);
        formData.append('insideRightDesign', insideRightImage);

        const response = await axios.post(`${BASE_URL}/api/cards/upload-inside-right-design`,
          formData,
          {
            headers: {
              'x-access-token': token,
              'Content-Type': 'multipart/form-data'
            }
          });

        toast.success('Inside right card uploaded successfully.');
        formik.resetForm();

        document.getElementById('insideRightDesign').value = '';
        // setImage(null);
      } catch (error) {
        console.log('error in uploaded inside right card design', error);
        toast.error(error.response.data.msg);
      }
    }
  });

  useEffect(() => {
    if (insideRightImage) {
      formikForInsideRightDesign.handleSubmit();
    }
  }, [insideRightImage]);

  const handleNextClick = () => {
    if (!image || !backImage || !insideLeftImage || !insideRightImage) {
      toast.error('Please upload all required card images before proceeding.',
        {
          duration: 3000
        });
      return;
    }

    router.push('/upload-video');
  };

  const handleUpdateNextClick = () => {
    router.push('/upload-video');
  };

  const getCardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cards/get/${selectedCardId}`, {
        headers: {
          'x-access-token': token
        }
      });
      setCard(res.data.data);
    } catch (error) {
      console.log(error);

    }

  };

  useEffect(() => {
    getCardData();
  }, [selectedCardId]);

  const existingImageUrl = card?.frontDesign
    ? `${BASE_URL}/${card.frontDesign.replace(/\\/g, '/')}`
    : null;
  const existingBackUrl = card?.backDesign
    ? `${BASE_URL}/${card.backDesign.replace(/\\/g, '/')}`
    : null;
  const existingInsideLeftUrl = card?.insideLeftDesign
    ? `${BASE_URL}/${card.insideLeftDesign.replace(
      /\\/g,
      '/')}`
    : null;
  const existingInsideRightUrl = card?.insideRightDesign
    ? `${BASE_URL}/${card.insideRightDesign.replace(
      /\\/g,
      '/')}`
    : null;

  console.log('backImage', backImage);
  console.log('selectedCardId', selectedCardId);
  console.log('selectedCardId', selectedCardId);
  console.log('selectedCardId', selectedCardId);

  return (
    <>
      <Head>
        <title>
          Cards | {APP_NAME}
        </title>
      </Head>
      <Box sx={{
        pt: { xs: 15, md: 5 },
        height: { md: '100vh !important', xs: '100% !important' },
        // pt:60,
        width: '100%',
        // height: '100vh !important'
        // minHeight:'100vh',
        // bgcolor: 'pink',
        // backgroundImage: `url(${WEB_URL}/bg.png)`,
        // backgroundSize: 'cover',
        // backgroundPosition: 'center',
        // backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
        // , overflowY: 'hidden',
        // backgroundColor: '#f0f0f0'
        // , height: { md: '100vh', xs: '100%' }
      }}>
        <Container sx={{
          pt: { xs: 5 }, pb: { xs: 5, md: 2 },
          display: 'flex',
          // bgcolor:'red',
          // justifyContent: 'center',
          flexDirection: 'column',
          // alignItems: 'center',
          height: '100%'
        }}>
          <Grid container spacing={2} sx={{
            display: 'flex',
            // bgcolor:'blue',
            height: '100%',
            justifyContent: 'center',
            // flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Grid item xs={6} md={3}>
              <Card sx={{
                bgcolor: '#f0f3f8',
                height: 400,
                // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.06), 0px 0px 0px rgba(0, 0, 0, 0)',
                borderRadius: 0
              }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    py: 3
                  }}
                >
                  {/* Image at Top */}
                  <Box
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    component="img"
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : existingImageUrl || `${WEB_URL}/drag.png`
                    }
                    // src={image ? URL.createObjectURL(image) : `${WEB_URL}/drag.png`}
                    alt="Drag Icon"
                    sx={{ width: image || existingImageUrl ? 150 : 100, height: image || existingImageUrl? 200:100 }}
                  />

                  {/* Text in Center */}
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                      Drag & drop <span style={{ color: '#c09b9b' }}>image</span>
                    </Typography>
                  </CardContent>

                  {/* Button at Bottom */}
                  <CardActions>
                    <Button
                      variant="contained"
                      onClick={() => document.getElementById('frontDesign').click()}
                      sx={{
                        minWidth: { md: 150, xs: 100 },
                        backgroundColor: '#c09b9b !important',
                        color: '#1a1d25',
                        fontWeight: 700,
                        borderRadius: '999px',
                        '&:hover': {
                          backgroundColor: '#c09b9b !important',
                          color: '#1a1d25'
                        }
                      }}
                    >
                      Upload
                    </Button>
                  </CardActions>
                </Box>

              </Card>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mt: { md: 5, xs: 2 },
                gap: 1
              }}>
                <AddCircleRoundedIcon onClick={() => document.getElementById('frontDesign').click()}
                                      sx={{ color: 'grey' }}/>
                <Typography variant=" body1" sx={{ color: 'black' }}>
                  Front design
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{
                bgcolor: '#f0f3f8',
                height: 400,
                // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.06), 0px 0px 0px rgba(0, 0, 0, 0)',
                borderRadius: 0
              }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    py: 3
                  }}
                >
                  {/* Image at Top */}
                  <Box
                    component="img"
                    onDrop={handleDropForBack}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    src={
                      backImage
                        ? URL.createObjectURL(backImage)
                        : existingBackUrl || `${WEB_URL}/drag.png`
                    }
                    // src={backImage ? URL.createObjectURL(backImage) : `${WEB_URL}/drag.png`}
                    // src={`${WEB_URL}/drag.png`}
                    alt="Drag Icon"
                    sx={{ width: backImage || existingBackUrl ? 150 : 100, height: backImage || existingBackUrl  ? 200:100 }}
                  />

                  {/* Text in Center */}
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                      Drag & drop <span style={{ color: '#c09b9b' }}>image</span>
                    </Typography>
                  </CardContent>

                  {/* Button at Bottom */}
                  <CardActions>
                    <Button
                      onClick={() => document.getElementById('backDesign').click()}
                      variant="contained"
                      sx={{
                        minWidth: { md: 150, xs: 100 },
                        backgroundColor: '#c09b9b !important',
                        color: '#1a1d25',
                        fontWeight: 700,
                        borderRadius: '999px',
                        '&:hover': {
                          backgroundColor: '#c09b9b !important'
                        }
                      }}
                    >
                      Upload
                    </Button>
                  </CardActions>
                </Box>
              </Card>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mt: { md: 5, xs: 2 },
                gap: 1
              }}>
                <AddCircleRoundedIcon onClick={() => document.getElementById('backDesign').click()}
                                      sx={{ color: 'grey' }}/>
                <Typography variant="body1" sx={{ color: 'black' }}>
                  Back design
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                bgcolor: '#f0f3f8',
                height: 400,
                // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.06), 0px 0px 0px rgba(0, 0, 0, 0)',
                borderRadius: 0
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%'
                }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: '100%',
                      py: 3
                    }}
                  >
                    {/* Image at Top */}
                    <Box
                      onDrop={handleDropForInsideLeft}
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={(e) => e.preventDefault()}
                      component="img"
                      src={
                        insideLeftImage
                          ? URL.createObjectURL(insideLeftImage)
                          : existingInsideLeftUrl || `${WEB_URL}/drag.png`
                        // insideLeftImage
                        //   ? URL.createObjectURL(insideLeftImage)
                        //   : `${WEB_URL}/drag.png`
                      }
                      // src={`${WEB_URL}/drag.png`}
                      alt="Drag Icon"
                      sx={{ width: insideLeftImage || existingInsideLeftUrl ? 150 : 100, height: insideLeftImage || existingInsideLeftUrl? 200:100 }}
                    />

                    {/* Text in Center */}
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                        Drag & drop <span style={{ color: '#c09b9b' }}>image</span>
                      </Typography>
                    </CardContent>

                    {/* Button at Bottom */}
                    <CardActions>
                      <Button
                        onClick={() => document.getElementById('insideLeftDesign').click()}
                        variant="contained"
                        sx={{
                          minWidth: { md: 150, xs: 100 },
                          backgroundColor: '#c09b9b !important',
                          color: '#1a1d25',
                          fontWeight: 700,
                          borderRadius: '999px',
                          '&:hover': {
                            backgroundColor: '#c09b9b !important'
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </CardActions>

                  </Box>
                  <div className="vertical-line"></div>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: '100%',
                      py: 3
                    }}
                  >
                    {/* Image at Top */}
                    <Box
                      onDrop={handleDropForInsideRight}
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={(e) => e.preventDefault()}
                      component="img"
                      src={
                        insideRightImage
                          ? URL.createObjectURL(insideRightImage)
                          : existingInsideRightUrl || `${WEB_URL}/drag.png`
                        // insideRightImage
                        //   ? URL.createObjectURL(insideRightImage)
                        //   : `${WEB_URL}/drag.png`
                      }
                      // src={`${WEB_URL}/drag.png`}
                      alt="Drag Icon"
                      sx={{ width: insideRightImage || existingInsideRightUrl? 150 : 100, height: insideRightImage || existingInsideRightUrl ? 200:100 }}
                    />

                    {/* Text in Center */}
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: 'black', fontWeight: 900 }}>
                        Drag & drop <span style={{ color: '#c09b9b' }}>image</span>
                      </Typography>
                    </CardContent>

                    {/* Button at Bottom */}
                    <CardActions>
                      <Button
                        onClick={() => document.getElementById('insideRightDesign').click()}
                        variant="contained"
                        sx={{
                          minWidth: { md: 150, xs: 100 },
                          backgroundColor: '#c09b9b !important',
                          color: '#1a1d25',
                          fontWeight: 700,
                          borderRadius: '999px',
                          '&:hover': {
                            backgroundColor: '#c09b9b !important'
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </CardActions>
                  </Box>
                </Box>
              </Card>
              <Box sx={{
                display: 'flex',
                // flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                mt: { md: 5, xs: 2 },
                gap: 1
              }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AddCircleRoundedIcon
                    onClick={() => document.getElementById('insideLeftDesign').click()}
                    sx={{ color: 'grey' }}/>
                  <Typography variant="body1" sx={{ color: 'black', mt: 1 }}>
                    Inside left design
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AddCircleRoundedIcon
                    onClick={() => document.getElementById('insideRightDesign').click()}
                    sx={{ color: 'grey' }}/>
                  <Typography variant="body1" sx={{ color: 'black', mt: 1 }}>
                    Inside right design
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

        </Container>
        <Box
          sx={{
            mb:5,
            // pt: { lg: 5, xl: 5, xs: 5 },
            // pt:{xs:0, md:0, lg:0,xl:10},
            width: '100%',
            display: 'flex',
            // bgcolor:'red',
            justifyContent: { xs: 'center', md: 'flex-end' },
            alignItems: 'center',
            pr: {md: 5 , xs:0},
            pb: { xs: 5, md: 0 }
          }}
        >


          {
            card?.frontDesign
            && card?.backDesign
            && card?.insideLeftDesign
            && card?.insideRightDesign ? (
              <Button
                onClick={handleUpdateNextClick}
                sx={{
                  textAlign: 'center',
                  backgroundColor: '#c09b9b !important',
                  color: '#1a1d25',
                  // display: isUploadCards?  'block' : 'none',
                  minWidth: 120, '&:hover': {
                    backgroundColor: '#c09b9b !important'
                    // color: '#1a1d25',
                  }
                }}
                variant="contained"
              >
                Next
              </Button>
            ) : (

              <Button
                onClick={handleNextClick}
                sx={{
                  textAlign: 'center',
                  backgroundColor: '#c09b9b !important',
                  color: '#1a1d25',
                  // display: isUploadCards?  'block' : 'none',
                  minWidth: 120, '&:hover': {
                    backgroundColor: '#c09b9b !important'
                    // color: '#1a1d25',
                  }
                }}
                variant="contained"
              >
                Next
              </Button>

            )
          }

        </Box>

        <input
          accept="image/*"
          id="frontDesign"
          type="file"
          style={{ display: 'none' }}
          onChange={handleImage}
        />
        <input
          accept="image/*"
          id="backDesign"
          type="file"
          style={{ display: 'none' }}
          onChange={handleBackImage}
        />
        <input
          accept="image/*"
          id="insideLeftDesign"
          type="file"
          style={{ display: 'none' }}
          onChange={handleInsideLeftImage}
        />
        <input
          accept="image/*"
          id="insideRightDesign"
          type="file"
          style={{ display: 'none' }}
          onChange={handleInsideRightImage}
        />
      </Box>

    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
