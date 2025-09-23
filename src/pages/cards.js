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
  CircularProgress, Typography, Avatar
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
  //upload pop up
  const [open, setOpen] = React.useState(false);
  const [category, setCategories] = useState([]);
  const [card, setCard] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingComplete, setLoadingComplete] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // New filter state
  const [filteredCardsData, setFilteredCardsData] = useState([]); // Store filtered data
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { user } = useAuth();
  const token = user?.token;

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

  // Fetch filtered cards based on filter type
  const fetchFilteredCards = async (filter) => {
    try {
      if (filter === 'all') {
        setFilteredCardsData([]);
        return;
      }
      
      let endpoint = '';
      if (filter === 'popular') {
        endpoint = '/api/admin/statistics/filter/popular-cards';
      } else if (filter === 'ar-experience') {
        endpoint = '/api/admin/statistics/filter/popular-ar-experience-cards';
      }
      
      if (endpoint) {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { 'x-access-token': token }
        });
        setFilteredCardsData(response.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching filtered cards:', error);
      setFilteredCardsData([]);
    }
  };

  useEffect(() => {
    getAllCards();
  }, []);

  // Fetch filtered data when filter changes
  useEffect(() => {
    fetchFilteredCards(filterType);
  }, [filterType]);

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

  // Determine which cards to use based on filter
  let cardsToFilter = cards;
  if (filterType === 'popular' && filteredCardsData.length > 0) {
    cardsToFilter = filteredCardsData;
  } else if (filterType === 'ar-experience' && filteredCardsData.length > 0) {
    cardsToFilter = filteredCardsData;
  }
  
  // Apply search filter
  const filteredCards = FilterHelper(cardsToFilter, searchQuery, ['title']);
  
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
        .required('Title is required'),

      cardType: Yup
        .array()
        .min(1, 'Please select at least one category'),

      price: Yup
        .number()
        .typeError('Price must be a number')
        .required('Price is required')
    }),

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
          Cards | Incardible
        </title>
      </Head>
      <Box sx={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container 
          maxWidth="lg"
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            py: 4
          }}
        >
          <Typography variant="h2" sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%'
          }}>Cards</Typography>
          {/* Table Title - Always visible on mobile */}
          {/* <Box sx={{ 
            width: '100%', 
            mb: 2,
            display: { xs: 'block', md: 'none' } // Show only on mobile
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              textAlign: 'center',
              py: 1,
              borderBottom: '2px solid',
              borderColor: 'primary.main'
            }}>
              Cards Table
            </Typography>
          </Box> */}
          <TableContainer
  component={Paper}
  sx={{
    width: '100%',
    maxWidth: '100%',
    mx: 'auto',
    display: 'block',
    overflowX: {xs: 'auto', md:'auto' },             // <-- horizontal scroll
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { height: 6 },
    '&::-webkit-scrollbar-thumb': { borderRadius: 4 }
  }}
>
<Paper sx={{ width: '100%' }}>
  <Table
    aria-label="cards table"
    sx={{
      width: '100%',
      // force a logical min width only on small screens
      minWidth: { xs: 720, sm: 720, md: 'auto' }, // adjust 720 as needed
      tableLayout: { xs: 'fixed', md: 'auto' }    // keeps columns readable on xs
    }}
  >
{/* 
          <TableContainer component={Paper} sx={{ 
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Table aria-label="simple table" sx={{ width: '100%' }}> */}
              <TableHead>
                <TableRow sx={{ width: '100%' }}>
                  <TableCell colSpan={6} sx={{ width: '100%' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: { md: 'row', xs: 'row' },
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
                            padding: '16px 0'
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
                          width: '100%',
                          maxWidth: '400px',
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

                      {/* Filter Dropdown */}
                      <FormControl 
                        variant="filled" 
                        sx={{ 
                          minWidth: 200, 
                          ml: 2,
                          '& .MuiInputBase-root': {
                            height: '55px',
                            borderRadius: 1
                          }
                        }}
                      >
                        <InputLabel>Filter by</InputLabel>
                        <Select
                          value={filterType}
                          onChange={(event) => setFilterType(event.target.value)}
                          label="Filter by"
                        >
                          <MenuItem value="all">All Cards</MenuItem>
                          <MenuItem value="popular">Popular Cards</MenuItem>
                          <MenuItem value="ar-experience">Popular AR Experience</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Upload Icon */}
                      <Box
                        sx={{
                          ml: 2,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                      >

                        {/* <Tooltip title="Category">
                          <NextLink href="/category">
                            <IconButton>
                              <CategoryIcon sx={{
                                fontSize: 50, width: 60,
                                height: 55, color: '#c165a0'
                              }}/>
                            </IconButton>
                          </NextLink>
                        </Tooltip>
                        <Tooltip title="Upload Card">
                          <IconButton onClick={handleClickOpen}>
                            <CloudUploadIcon sx={{
                              fontSize: 50, width: 60,
                              height: 55, color: 'rgba(71, 85, 105, 1)'
                            }}/>
                          </IconButton>
                        </Tooltip> */}
                        
                        {/* Category Image */}
                        <Tooltip title="Category">
                          <NextLink href="/category">
                            <IconButton>
                              <img 
                                src="/category.png" 
                                alt="Category" 
                                style={{
                                  width: 60,
                                  height: 55,
                                  objectFit: 'contain'
                                }}
                              />
                            </IconButton>
                          </NextLink>
                        </Tooltip>
                        
                        {/* Upload Image */}
                        <Tooltip title="Upload Card">
                          <IconButton onClick={handleClickOpen}>
                            <img 
                              src="/upload.png" 
                              alt="Upload" 
                              style={{
                                width: 60,
                                height: 55,
                                objectFit: 'contain'
                              }}
                            />
                          </IconButton>
                        </Tooltip>

                      </Box>

                    </Box>
                  </TableCell>

                </TableRow>
                <TableRow sx={{ 
                  justifyContent: 'space-between', 
                  alignItems: 'left',
                  '& .MuiTableCell-root': {
                    fontWeight: 'bold',
                    // backgroundColor: 'primary.light',
                    // color: 'primary.contrastText',
                    // fontSize: { xs: '0.875rem', md: '1rem' },
                    // padding: { xs: '8px 4px', md: '16px' }
                  }
                }}>
                  <TableCell sx={{ 
                    width: { xs: '15%', md: '15%' },
                    minWidth: { xs: '80px', md: '100px' }
                  }}>
                    Image
                  </TableCell>
                  <TableCell sx={{ 
                    width: { xs: '25%', md: '25%' },
                    minWidth: { xs: '100px', md: '120px' }
                  }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ 
                    width: { xs: '25%', md: '25%' },
                    minWidth: { xs: '100px', md: '120px' }
                  }}>
                    Views
                  </TableCell>
                  <TableCell sx={{ 
                    textAlign: 'left', 
                    width: { xs: '20%', md: '25%' },
                    minWidth: { xs: '80px', md: '120px' }
                  }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ 
                    textAlign: 'left', 
                    width: { xs: '15%', md: '15%' },
                    minWidth: { xs: '60px', md: '80px' }
                  }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ 
                    textAlign: 'left', 
                    width: { xs: '25%', md: '20%' },
                    minWidth: { xs: '80px', md: '100px' }
                  }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingComplete ?
                  <TableRow align="center">
                    <TableCell colSpan={6} align="center">
                      <CircularProgress/>
                    </TableCell>
                  </TableRow> :
                  (paginatedCards && paginatedCards.length > 0 ? (
                    paginatedCards.map(data => (
                      <TableRow key={data._id} sx={{
                        '& .MuiTableCell-root': {
                          // fontSize: { xs: '0.75rem', md: '0.875rem' },
                          // padding: { xs: '8px 4px', md: '16px' },
                          wordBreak: 'break-word'
                        }
                      }}>
                        <TableCell component="th" scope="row" sx={{
                          width: { xs: '15%', md: '15%' },
                          minWidth: { xs: '80px', md: '100px' }
                        }}>
                          <Avatar
                            src={data.frontDesign ? `${BASE_URL}/${data.frontDesign.replace(/\\/g, '/')}` : '/placeholder-card.png'}
                            alt={data.title}
                            sx={{
                              width: { xs: 40, md: 60 },
                              height: { xs: 40, md: 60 },
                              borderRadius: 1,
                              objectFit: 'cover'
                            }}
                            variant="rounded"
                          />
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{
                          width: { xs: '25%', md: '25%' },
                          minWidth: { xs: '100px', md: '120px' }
                        }}>
                          {data.title}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{
                          width: { xs: '25%', md: '25%' },
                          minWidth: { xs: '100px', md: '120px' }
                        }}>
                          {data.views}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{
                          width: { xs: '20%', md: '25%' },
                          minWidth: { xs: '80px', md: '120px' }
                        }}>
                          {data.cardType?.join(', ')}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{
                          width: { xs: '15%', md: '15%' },
                          minWidth: { xs: '60px', md: '80px' }
                        }}>
                          {`${data.price} AUD `}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ 
                          textAlign: 'left',
                          width: { xs: '25%', md: '20%' },
                          minWidth: { xs: '80px', md: '100px' }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: { xs: 0.5, md: 1 },
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'center', md: 'flex-start' }
                          }}>
                            <Tooltip title="Delete Card">
                              <IconButton size="small">
                                <DeleteIcon
                                  fontSize="small"
                                  disabled={destroyCard.isSubmitting}
                                  onClick={() => {
                                    setItemToDelete(data._id);
                                    setDialogOpen(true);
                                  }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Update Card">
                              <IconButton size="small" onClick={() => handleClickEditOpen(data._id)}>
                                <EditIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No Cards Found
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
            <TablePagination
            sx={{
              // mb: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%'
,   borderTop: 1,
borderColor: 'divider'            }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
</Paper>
          </TableContainer>

          

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
                                        color: 'black'
                                      },
                                      '& .MuiFormLabel-root.Mui-focused': {
                                        color: 'black !important'
                                      }
                                    }}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={formik.values.cardType.includes(type.name)}
                                        onChange={(e) => {
                                          const selected = formik.values.cardType;
                                          if (e.target.checked) {
                                            formik.setFieldValue('cardType',
                                              [...selected, type.name]);
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

                        {/*{formik.touched.cardType && formik.errors.cardType && (*/}
                        {/*  <FormHelperText error>{formik.errors.cardType}</FormHelperText>*/}
                        {/*)}*/}
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
                          }} color="primary">{card ? 'Update' : 'Add'}</Button>
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
