// import React, { useState } from 'react';
// import Head from 'next/head';
// import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
// import {
//   Box,
//   Typography,
//   Container,
//   Paper,
//   TextField,
//   Button,
//   Card,
//   CardMedia,
//   Grid,
//   IconButton,
//   CircularProgress,
//   Alert
// } from '@mui/material';
// import { PhotoCamera, Delete, Add } from '@mui/icons-material';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import toast from 'react-hot-toast';
// import axios from 'axios';

// const APP_NAME = 'AR Greeting Cards';
// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// const NewsAndOffers = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   const validationSchema = Yup.object({
//     title: Yup.string()
//       .required('Title is required'),
//     description: Yup.string()
//       .required('Description is required')
//       // .min(10, 'Description must be at least 10 characters')
//       // .max(1000, 'Description must be less than 1000 characters')
//   });

//   const formik = useFormik({
//     initialValues: {
//       title: '',
//       description: '',
//       image:'',
//     },
//     validationSchema: validationSchema,
//     onSubmit: async (values) => {
//       if (uploadedImages.length === 0) {
//         toast.error('Please upload at least one image');
//         return;
//       }

//       setIsSubmitting(true);
//       try {
//         const token = localStorage.getItem('token');
        
//         const newsData = {
//           title: values.title,
//           description: values.description,
//           images: uploadedImages.map(img => img.url),

//         };

//         const response = await axios.post(`${BASE_URL}/api/admin/send/news-and-offers`, newsData, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.data.success) {
//           toast.success('News and Offers created successfully!');
//           formik.resetForm();
//           setUploadedImages([]);
//         } else {
//           toast.error('Failed to create news and offers');
//         }
//       } catch (error) {
//         console.error('Error creating news and offers:', error);
//         toast.error('Error creating news and offers. Please try again.');
//       } finally {
//         setIsSubmitting(false);
//       }
//     }
//   });

//   const handleImageUpload = async (event) => {
//     const files = Array.from(event.target.files);
//     if (files.length === 0) return;

//     setUploadingImage(true);
    
//     try {
//       const uploadPromises = files.map(async (file) => {
//         const formData = new FormData();
//         formData.append('image', file);

//         const token = localStorage.getItem('token');
//         const response = await axios.post(`${BASE_URL}/api/admin/send/news-and-offers`, formData, {
//           headers: {
//             'x-access-token': token,
//             'Content-Type': 'multipart/form-data'
//           }
//         });

//         return {
//           url: response.data.imageUrl,
//           name: file.name,
//           size: file.size
//         };
//       });

//       const uploadedFiles = await Promise.all(uploadPromises);
//       setUploadedImages(prev => [...prev, ...uploadedFiles]);
//       toast.success(`${files.length} image(s) uploaded successfully!`);
//     } catch (error) {
//       console.error('Error uploading images:', error);
//       toast.error(error.response.data.msg);
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleRemoveImage = (index) => {
//     setUploadedImages(prev => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <>
//       <Head>
//         <title>
//           News and Offers | {APP_NAME}
//         </title>
//       </Head>

//       <Box
//         sx={{
//           height: '100vh',
//           display: 'flex',
//           justifyContent:'center', alignItems:'center',
//           flexDirection: 'column',
//           overflowY: 'auto',
//           pt: 5,
//           pb: 5
//         }}
//       >
//         <Container maxWidth="lg">
//           {/* Header */}
//           <Box sx={{ mb: 4 }}>
//             <Typography variant="h3" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
//               News and Offers
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Create and manage news and promotional offers for your customers
//             </Typography>
//           </Box>

//           {/* Form */}
//           <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 2 }}>
//             <form onSubmit={formik.handleSubmit}>
//               <Grid container spacing={3}>
//                 {/* Title Field */}
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     label="News/Offer Title"
//                     name="title"
//                     value={formik.values.title}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.title && Boolean(formik.errors.title)}
//                     helperText={formik.touched.title && formik.errors.title}
//                     placeholder="Enter a compelling title for your news or offer"
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 2,
//                         backgroundColor: '#ffffff'
//                       }
//                     }}
//                   />
//                 </Grid>

//                 {/* Description Field */}
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     label="Description"
//                     name="description"
//                     value={formik.values.description}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.description && Boolean(formik.errors.description)}
//                     helperText={formik.touched.description && formik.errors.description}
//                     placeholder="Provide detailed description of your news or offer"
//                     multiline
//                     rows={6}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 2,
//                         backgroundColor: '#ffffff'
//                       }
//                     }}
//                   />
//                 </Grid>

//                 {/* Image Upload Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                     Upload Images
//                   </Typography>
                  
//                   {/* Upload Button */}
//                   <Box sx={{ mb: 3 }}>
//                     <input
//                       accept="image/*"
//                       style={{ display: 'none' }}
//                       id="image-upload"
//                       multiple
//                       type="file"
//                       onChange={handleImageUpload}
//                       disabled={uploadingImage}
//                     />
//                     <label htmlFor="image-upload">
//                       <Button
//                         variant="outlined"
//                         component="span"
//                         startIcon={uploadingImage ? <CircularProgress size={20} /> : <PhotoCamera />}
//                         disabled={uploadingImage}
//                         sx={{
//                           borderRadius: 2,
//                           px: 3,
//                           py: 1.5,
//                           textTransform: 'none',
//                           fontWeight: 600
//                         }}
//                       >
//                         {uploadingImage ? 'Uploading...' : 'Choose Images'}
//                       </Button>
//                     </label>
//                   </Box>

//                   {/* Uploaded Images */}
//                   {uploadedImages.length > 0 && (
//                     <Box>
//                       <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
//                         Uploaded Images ({uploadedImages.length})
//                       </Typography>
//                       <Grid container spacing={2}>
//                         {uploadedImages.map((image, index) => (
//                           <Grid item xs={12} sm={6} md={4} key={index}>
//                             <Card sx={{ position: 'relative' }}>
//                               <CardMedia
//                                 component="img"
//                                 height="200"
//                                 image={image.url}
//                                 alt={`Upload ${index + 1}`}
//                                 sx={{ objectFit: 'cover' }}
//                               />
//                               <Box sx={{ p: 2 }}>
//                                 <Typography variant="caption" color="text.secondary">
//                                   {image.name}
//                                 </Typography>
//                               </Box>
//                               <IconButton
//                                 onClick={() => handleRemoveImage(index)}
//                                 sx={{
//                                   position: 'absolute',
//                                   top: 8,
//                                   right: 8,
//                                   backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                                   color: 'white',
//                                   '&:hover': {
//                                     backgroundColor: 'rgba(0, 0, 0, 0.7)'
//                                   }
//                                 }}
//                                 size="small"
//                               >
//                                 <Delete fontSize="small" />
//                               </IconButton>
//                             </Card>
//                           </Grid>
//                         ))}
//                       </Grid>
//                     </Box>
//                   )}

//                   {uploadedImages.length === 0 && (
//                     <Alert severity="info" sx={{ borderRadius: 2 }}>
//                       No images uploaded yet. Please upload at least one image for your news or offer.
//                     </Alert>
//                   )}
//                 </Grid>

//                 {/* Submit Button */}
//                 <Grid item xs={12}>
//                   <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
//                     <Button
//                       variant="outlined"
//                       onClick={() => {
//                         formik.resetForm();
//                         setUploadedImages([]);
//                       }}
//                       disabled={isSubmitting}
//                       sx={{
//                         borderRadius: 2,
//                         px: 4,
//                         py: 1.5,
//                         textTransform: 'none',
//                         fontWeight: 600
//                       }}
//                     >
//                       Reset
//                     </Button>
//                     <Button
//                       type="submit"
//                       variant="contained"
//                       disabled={isSubmitting || uploadedImages.length === 0}
//                       startIcon={isSubmitting ? <CircularProgress size={20} /> : <Add />}
//                       sx={{
//                         borderRadius: 2,
//                         px: 4,
//                         py: 1.5,
//                         textTransform: 'none',
//                         fontWeight: 600,
//                         '&:hover': {
//                           backgroundColor: '#c09b9b',
//                           color: '#1a1d25'
//                         }
//                       }}
//                     >
//                       {isSubmitting ? 'Creating...' : 'Create News/Offer'}
//                     </Button>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </form>
//           </Paper>
//         </Container>
//       </Box>
//     </>
//   );
// };

// NewsAndOffers.getLayout = (page) => (
//   <DashboardLayout>
//     {page}
//   </DashboardLayout>
// );

// export default NewsAndOffers;

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
import {
  Box, Typography, Container, Paper, TextField, Button, Card, CardMedia, Grid, IconButton
} from '@mui/material';
import { PhotoCamera, Delete, Add } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';

const APP_NAME = 'AR Greeting Cards';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NewsAndOffers = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { title: '', description: '', image: null },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      image: Yup.mixed().required('Image is required')
    }),
    onSubmit: async (values, helpers) => {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('title', values.title);
        fd.append('description', values.description);
        fd.append('image', values.image); // single file

        const { data } = await axios.post(
          `${BASE_URL}/api/admin/send/news-and-offers`,
          fd,
          {
            headers: {
              'x-access-token': token,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (data?.success) {
          toast.success('New and offers send to the subscibeers successfully!');
          helpers.resetForm();
        } else {
          toast.error(data?.message || 'Failed to send');
        }
      } catch (e) {
        toast.error(e?.response?.data?.msg);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const preview = useMemo(() => (formik.values.image ? URL.createObjectURL(formik.values.image) : ''), [formik.values.image]);

  const handleFile = (e) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    formik.setFieldValue('image', f);
  };

  return (
    <>
      <Head><title>News and Offers | {APP_NAME}</title></Head>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 5 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>News & Offers</Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Title" name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && !!formik.errors.title}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Description" name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && !!formik.errors.description}
                    helperText={formik.touched.description && formik.errors.description}
                    multiline rows={6}
                  />
                </Grid>

                <Grid item xs={12}>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFile}
                  />
                  {!formik.values.image && (
                    <label htmlFor="image">
                      <Button variant="outlined" startIcon={<PhotoCamera />} component="span">
                        Choose Image
                      </Button>
                    </label>
                  )}
                  {formik.touched.image && formik.errors.image && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {formik.errors.image}
                    </Typography>
                  )}
                </Grid>

                {preview && (
                  <Grid item xs={12}>
                    <Card sx={{ position: 'relative', maxWidth: 100 }}>
                      <CardMedia component="img" height="auto" image={preview} alt="preview" />
                      <IconButton
                        size="small"
                        onClick={() => formik.setFieldValue('image', null)}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,.55)', color: '#fff' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => { formik.resetForm(); }}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Add />}
                    disabled={isSubmitting}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#c09b9b',
                        color: '#1a1d25'
                      }
                    }}
                  >
                    {isSubmitting ? 'Sending…' : 'Send'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

NewsAndOffers.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default NewsAndOffers;

