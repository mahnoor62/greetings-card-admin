import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer, FormHelperText,
  TableHead,
  TableRow, Grid, FormControl, InputLabel, Select, MenuItem,
  Paper, Box, DialogActions, DialogContent, DialogTitle, DialogContentText,
  TablePagination, Container, Tooltip, IconButton, Dialog, Checkbox,
  Button, InputAdornment,
  TextField, FormLabel, FormGroup, FormControlLabel,
  CircularProgress, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FilterHelper, PaginationHelper } from '/src/helpers/filter';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NextLink from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ConfirmationDialog from '../components/confirmationDialogue';
import Switch from '@mui/material/Switch';
import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Head from 'next/head';
import { useAuth } from '../hooks/use-auth';
import { useCardContext } from '../contexts/cardIdContext';
import CategoryIcon from '@mui/icons-material/Category';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

const UplaodCards = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSelectedCardId } = useCardContext();
  const [cards, setCards] = useState([]);
  const [category, setCategories] = useState([]);
  const [card, setCard] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingComplete, setLoadingComplete] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { user } = useAuth();
  const token = user?.token;

//upload pop up
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickEditOpen = (id) => {
    setOpen(true);
    getCardData(id);
  };

  const handleClose = () => {
    setOpen(false);
    setCard(null);
    formik.resetForm();
    // setCard(null);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      destroyCard(itemToDelete);
      setItemToDelete(null);
      setDialogOpen(false);
    }
  };

  let response;

  const destroyCard = async (id) => {
    try {
      response = await axios.delete(`${BASE_URL}/api/cards/destroy/${id}`, {
        headers: {
          'x-access-token': token
        }
      });
      toast.success('Card deleted successfully');
      const updatedCards = cards.filter((row) => row._id !== id);
      setCards(updatedCards);
    } catch (error) {
      console.log('error in delete card', error);
      toast.error(error.response.data.msg);
    }
  };

  //
  const getAllCards = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cards/get-all`, {
        headers: {
          'x-access-token': token
        }
      });
      const data = response.data.data;
      setCards(data);

      setLoadingComplete(false);

    } catch (error) {
      console.log('error in get all cards');
      toast.error(error.response.data.msg);
    }
  };

  useEffect(() => {
    getAllCards();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCardData = (id) => {

    const selectedCard = cards.find((cardItem) => cardItem._id === id);
      setCard(selectedCard);

      formik.setValues({
        title: selectedCard?.title || '',
        cardType: selectedCard?.cardType || [],
        price: selectedCard?.price || ''
      });
  };

  const filteredCards = FilterHelper(cards, searchQuery, ['title']);
  const paginatedCards = PaginationHelper(filteredCards, page, rowsPerPage);
  const totalCount = filteredCards.length;


  //
  const getAllCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/category/get/all`, {
        // headers: {
        //   'x-access-token': token
        // }
      });
      const data = response.data.data;
      setCategories(data);

      setLoadingComplete(false);

    } catch (error) {
      console.log('error in get all categories', error);
      toast.error(error.response.data.msg);
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);


  const formik = useFormik({
    initialValues: {
      title: card?.title || '',
      cardType: card?.cardType || [],
      price: card?.price || '',
      submit: null
    },
    validationSchema: Yup.object({
        title: Yup
          .string()
          .max(255)
          .required('Title  is required')
      },
      {
        cardType: Yup.array().min(1, 'At least one card type must be selected')
      },
      {
        price: Yup
          .number().required('Price is required')
      }
    ),
    onSubmit: async (values, helpers) => {
      try {
        setIsSubmitting(true);
        if (card?._id) {
          const res = await axios.post(`${BASE_URL}/api/cards/edit`, {
            id: card._id,
            title: values.title,
            cardType: values.cardType,
            price: parseInt(values.price)
          }, {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          });
          toast.success('Card Updated Successfully');
          formik.resetForm();
          const newCardId = res.data?.data?.uuid;
          setSelectedCardId(newCardId);
          router.push(`/upload-cards/${newCardId}`);
          // router.push('/upload-cards');
        } else {
          const response = await axios.post(BASE_URL
            + '/api/cards/create',
            {
              title: values.title,
              cardType: values.cardType,
              price: parseInt(values.price)
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
              }
            }
          );
          toast.success('Card Created Successfully');
          formik.resetForm();
          const newCardId = response.data?.data?.uuid;
          setSelectedCardId(newCardId);
          // router.push('/upload-cards');
          router.push(`/upload-cards/${newCardId}`);

        }

      } catch (error) {
        console.log(error);
        toast.error(error.response.data.msg);
        // setIsSubmitting(false);
      }
    }
  });
  return (
    <>
      <Head>
        <title>
          Dashboard | {APP_NAME}
        </title>
      </Head>
      <Box sx={{
        overflowY:'hidden',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        // pt: { xs: 15, md: 10 },
        pt: { xs: 15, md: 10 },
        height: { md: '100% !important', xs: '100% !important' },
        minHeight:'100vh !important'
      }}>
        <Container sx={{ mt: 5}}>
          <Typography variant='h2' sx={{ mb:3, display:'flex', justifyContent:'flex-start', alignItems:'center'}}>Cards</Typography>
          <TableContainer component={Paper} sx={{ width:'100%' }}>
          {/*<TableContainer component={Paper} sx={{width: '100%'}} >*/}
            <Table  aria-label="simple table"  sx={{width:'100%'}}>
              <TableHead>
                <TableRow sx={{ width: '100%' }}>
                  <TableCell colSpan={5} sx={{ width: '100%' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection:{md:'row', xs:'column'},
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>

                      {/* Search Field */}
                      <TextField
                        variant="filled"
                        placeholder="Search..."
                        sx={{
                          '& .MuiInputBase-input': {
                            ml: 1,
                            // textAlign: 'center', // Center align input text and placeholder
                            padding: '16px 0'   // Optional: vertically center text
                          },
                          '& .MuiInputBase-root': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(71, 85, 105, 1)',
                            opacity: 1
                          },
                          height: '55px',
                          width: '100%',  // take as much space as possible
                          maxWidth: '400px',  // limit max width if needed
                          borderRadius: 1
                        }}
                        onChange={event => setSearchQuery(event.target.value)}
                        InputProps={{
                          endAdornment: (
                            <Button variant="text" disabled
                                    sx={{ background: 'transparent !important' }}>
                              <SearchIcon sx={{ ml: 1.5, color: 'rgba(71, 85, 105, 1)' }}/>
                            </Button>
                          )
                        }}
                      />

                      {/* Upload Icon */}
                      <Box
                        sx={{
                          ml: 2,
                          width:'100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:  'flex-end' ,
                          // bgcolor: 'red',
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                      >

                        <Tooltip title="Category">
                          <NextLink href='/category'>
                          <IconButton>
                            <CategoryIcon sx={{ fontSize: 50 ,     width: 60, // Increased width
                              height: 55, color: '#c165a0' }}/>
                          </IconButton>
                          </NextLink>
                        </Tooltip>
                        <Tooltip title="Upload Card">
                          <IconButton onClick={handleClickOpen}>
                            <CloudUploadIcon sx={{ fontSize: 50,      width: 60, // Increased width
                              height: 55,color: 'rgba(71, 85, 105, 1)' }}/>
                          </IconButton>
                        </Tooltip>

                      </Box>

                    </Box>
                  </TableCell>

                </TableRow>
                <TableRow sx={{ justifyContent: 'space-between', alignItems: 'left' }}>
                  <TableCell sx={{ width: '30%' }}>Title</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '30%' }}>Category</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Price</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingComplete ?
                  <TableRow align="center">
                    <TableCell colSpan={4} align="center">
                      <CircularProgress/>
                    </TableCell>
                  </TableRow> :
                  (paginatedCards && paginatedCards.length > 0 ? (
                    paginatedCards.map(data => (
                      <TableRow key={data._id}>
                        <TableCell component="th" scope="row">
                          {data.title}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data.cardType?.join(', ')}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {`${data.price} AUD `}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ textAlign: 'left' }}>
                          <Tooltip title="Delete Card">
                            <IconButton>
                              <DeleteIcon
                                disabled={destroyCard.isSubmitting}
                                onClick={() => {
                                  setItemToDelete(data._id);
                                  setDialogOpen(true);
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          {/*<NextLink*/}
                          {/*  href={{*/}
                          {/*    pathname: '/upload-cards',*/}
                          {/*    // query: { cardId: data._id }*/}
                          {/*  }}*/}
                          {/*  passHref*/}
                          {/*>*/}
                          {/*  <IconButton onClick={() => setSelectedCardId(data._id)}>*/}
                          <Tooltip title="Update Card">
                            <IconButton onClick={() => handleClickEditOpen(data._id)}>
                              <EditIcon/>
                            </IconButton>
                          </Tooltip>
                          {/*</NextLink>*/}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No Cards Found
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            sx={{ mb: 5 }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />


          <React.Fragment>
            <Dialog open={open} onClose={handleClose} sx={{ width: '100%' }}>
              <form onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                <DialogTitle>{card ? 'Update Card' : 'Upload Card'}</DialogTitle>
                <DialogContent>
                  <Grid container columnSpacing={2} sx={{ mt: 1 }}>
                    <Grid item md={6} xs={12}>
                      <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        sx={{ my: 1 }}
                      />
                    </Grid>

                    <Grid item md={6} xs={12}>
                      <TextField
                        // placeholder='The price should be stored in (AUD)'
                        fullWidth
                        label="Price"
                        name="price"
                        type="text"
                        value={formik.values.price}
                        onChange={formik.handleChange}
                        error={formik.touched.price && Boolean(formik.errors.price)}
                        helperText={formik.touched.price && formik.errors.price}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">AUD</InputAdornment>
                        }}
                        sx={{
                          my: 1,
                          '& input::placeholder': {
                            color: 'gray',
                            opacity: 1,
                            fontSize: '10px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item md={12} xs={12}>
                      <FormControl fullWidth component="fieldset" sx={{ my: 1 }}>
                        <FormLabel component="legend" sx={{ color: 'black', fontWeight: 900 }}>
                          Select Card Category
                        </FormLabel>
                        <FormControl component="fieldset" fullWidth>
                          <FormGroup>
                            <Grid container spacing={0}>
                              {category.map((type) => (
                                <Grid item xs={12} md={6} key={type._id || type.name}>
                                  <FormControlLabel
                                    sx={{
                                      '& .MuiFormLabel-root': {
                                        color: 'black',
                                      },
                                      '& .MuiFormLabel-root.Mui-focused': {
                                        color: 'black !important',
                                      },
                                    }}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={formik.values.cardType.includes(type.name)}
                                        onChange={(e) => {
                                          const selected = formik.values.cardType;
                                          if (e.target.checked) {
                                            formik.setFieldValue('cardType', [...selected, type.name]);
                                          } else {
                                            formik.setFieldValue(
                                              'cardType',
                                              selected.filter((item) => item !== type.name)
                                            );
                                          }
                                        }}
                                        name="cardType"
                                      />
                                    }
                                    label={type.name}
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </FormGroup>
                          {formik.touched.cardType && formik.errors.cardType && (
                            <FormHelperText error>{formik.errors.cardType}</FormHelperText>
                          )}
                        </FormControl>


                        {/*<FormGroup>*/}
                        {/*  <Grid container spacing={0}>*/}
                        {/*    {category.map((type) => (*/}
                        {/*      <Grid item xs={12} md={6} key={type}>*/}

                        {/*        <FormControlLabel*/}
                        {/*          sx={{*/}
                        {/*            '& .MuiFormLabel-root': {*/}
                        {/*              color: 'black',*/}
                        {/*              // fontWeight: 900,*/}
                        {/*            },*/}
                        {/*            '& .MuiFormLabel-root.Mui-focused': {*/}
                        {/*              color: 'black !important', // keep label black on focus*/}
                        {/*            },*/}
                        {/*          }}*/}
                        {/*          control={*/}
                        {/*            <Checkbox*/}
                        {/*              size="small"*/}
                        {/*              checked={formik.values.cardType.includes(type.name)}*/}
                        {/*              onChange={(e) => {*/}
                        {/*                const selected = formik.values.cardType;*/}
                        {/*                if (e.target.checked) {*/}
                        {/*                  formik.setFieldValue('cardType', [...selected, type.name]);*/}
                        {/*                } else {*/}
                        {/*                  formik.setFieldValue(*/}
                        {/*                    'cardType',*/}
                        {/*                    selected.filter((item) => item !== type)*/}
                        {/*                  );*/}
                        {/*                }*/}
                        {/*              }}*/}
                        {/*              name="cardType"*/}
                        {/*            />*/}
                        {/*          }*/}
                        {/*          label={type.name}*/}
                        {/*        />*/}
                        {/*      </Grid>*/}
                        {/*    ))}*/}
                        {/*  </Grid>*/}
                        {/*</FormGroup>*/}

                        {formik.touched.cardType && formik.errors.cardType && (
                          <FormHelperText error>{formik.errors.cardType}</FormHelperText>
                        )}
                      </FormControl>

                    </Grid>

                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" variant="contained"
                          disabled={isSubmitting}
                          sx={{
                    '&:hover': {
                      backgroundColor: '#c09b9b !important',
                      color: '#1a1d25'
                    }
                  }} color="primary">{card ? 'Update':'Add'}</Button>
                </DialogActions>
              </form>
            </Dialog>

          </React.Fragment>


          <ConfirmationDialog
            open={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Confirm Delete"
            message="Are you sure you want to delete this card?"
          />

        </Container>
      </Box>
    </>
  );
};

UplaodCards.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default UplaodCards;
