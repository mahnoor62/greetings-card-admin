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
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

const Category = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSelectedCardId } = useCardContext();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
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
    getCategoryData(id);
  };

  const handleClose = () => {
    setOpen(false);
    setCategory(null);
    formik.resetForm();
    // setCategory(null);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      destroyCategory(itemToDelete);
      setItemToDelete(null);
      setDialogOpen(false);
    }
  };

  let response;

  const destroyCategory = async (id) => {
    try {
      response = await axios.delete(`${BASE_URL}/api/admin/category/destroy/${id}`, {
        headers: {
          'x-access-token': token
        }
      });
      toast.success('Category deleted successfully');
      const updatedCategory = categories.filter((row) => row._id !== id);
      setCategories(updatedCategory);
    } catch (error) {
      console.log('error in delete category', error);
      toast.error(error.response.data.msg);
    }
  };

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryData = (id) => {

    const selectedCard = categories.find((cardItem) => cardItem._id === id);
    setCategory(selectedCard);

    formik.setValues({
      name: selectedCard?.name || ''
    });
  };

  const filteredCategories = FilterHelper(categories, searchQuery, ['name']);
  const paginatedCategories = PaginationHelper(filteredCategories, page, rowsPerPage);
  const totalCount = filteredCategories.length;

  const formik = useFormik({
    initialValues: {
      name: category?.name || '',
      submit: null
    },
    validationSchema: Yup.object({
        name: Yup
          .string()
          .max(255)
          .required('Name  is required')
      }
    ),
    onSubmit: async (values, helpers) => {
      try {
        setIsSubmitting(true);
        if (category?._id) {
          const res = await axios.post(`${BASE_URL}/api/admin/category/edit`, {
            id: category._id,
            name: values.name
          }, {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          });

          setCategories(prev =>
            prev.map(cat => cat._id === category._id ? { ...cat, name: values.name } : cat)
          );
          toast.success('Category Updated Successfully');
          formik.resetForm();
          setIsSubmitting(false);
          setOpen(false);
        } else {
          const response = await axios.post(BASE_URL
            + '/api/admin/category/add',
            {
              name: values.name
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
              }
            }
          );
          const newCategory = response.data.data;
          setCategories(prev => [newCategory, ...prev]);
          toast.success('Category Created Successfully');
          formik.resetForm();
          setOpen(false);
          setIsSubmitting(false);
        }
      } catch (error) {
        console.log('error in category formik', error);
        setIsSubmitting(false);
        toast.error(error.response.data.msg);
        formik.resetForm();
        setOpen(false);
      }
    }
  });

  return (
    <>
      <Head>
        <title>
          Category | {APP_NAME}
        </title>
      </Head>
      <Box sx={{
        // bgcolor:'red',

        pt: { xs: 15, md: 10 },
         display: 'flex', justifyContent: 'center',flexDirection:'column', alignItems: 'center',
        height: { md: '100% !important', lg: '100% !important', xs: '100% !important' },
        minHeight: '100vh !important',
        // height: { md: '100% !important', xs: '100% !important' },
        // minHeight: '100vh !important'
      }}>
        <Container sx={{ mt: 5}}>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}>
            <Typography variant="h2" sx={{
              mb: 3,
              display: 'flex',
              width: { lg: 500, xs: '100%' },
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}>Categories</Typography>
            <TableContainer component={Paper} sx={{ width: { lg: 500, xs: '100%' } }}>
              <Table aria-label="simple table" sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ width: '100%' }}>
                    <TableCell colSpan={5} sx={{ width: '100%' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
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

                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // bgcolor: 'red',
                            borderRadius: 1,
                            cursor: 'pointer'
                          }}
                        >

                          <Tooltip title="Add Category">
                            <IconButton onClick={handleClickOpen}>
                              <AddToPhotosIcon sx={{
                                fontSize: 50, width: 60, // Increased width
                                height: 55, color: '#c165a0'
                              }}/>
                            </IconButton>
                          </Tooltip>
                        </Box>

                      </Box>
                    </TableCell>

                  </TableRow>
                  <TableRow sx={{ justifyContent: 'space-between', alignItems: 'left' }}>
                    <TableCell>Name</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingComplete ?
                    <TableRow align="center">
                      <TableCell colSpan={2} align="center">
                        <CircularProgress/>
                      </TableCell>
                    </TableRow> :
                    (paginatedCategories && paginatedCategories.length > 0 ? (
                      paginatedCategories.map(data => (
                        <TableRow key={data._id}>
                          <TableCell component="th" scope="row">
                            {data.name}
                          </TableCell>
                          <TableCell component="th" scope="row" sx={{ textAlign: 'right' }}>
                            <Tooltip title="Delete Category">
                              <IconButton>
                                <DeleteIcon
                                  disabled={destroyCategory.isSubmitting}
                                  onClick={() => {
                                    setItemToDelete(data._id);
                                    setDialogOpen(true);
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Update Category">
                              <IconButton onClick={() => handleClickEditOpen(data._id)}>
                                <EditIcon/>
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No Categories Found
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <TablePagination
              sx={{ mb: 5, width: { lg: 500, xs: '100%' } }}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>

        </Container>
        {/*<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center',   pr: 3 }}>*/}
        {/*  <NextLink href="/dashboard" passHref legacyBehavior>*/}
        {/*    <Button*/}
        {/*      sx={{*/}
        {/*        textAlign: 'center',*/}
        {/*        color: 'black',*/}
        {/*        // display: isCardCustomization || isPreview || isDashboard || isUploadCards?  'none' : 'block',*/}
        {/*        minWidth: 120, '&:hover': {*/}
        {/*          backgroundColor: '#c09b9b !important',*/}
        {/*          color: 'black'*/}
        {/*        }*/}
        {/*      }}*/}
        {/*      variant="contained"*/}
        {/*    >*/}
        {/*      Dashboard*/}
        {/*    </Button>*/}
        {/*  </NextLink>*/}
        {/*</Box>*/}

        {/*pop up*/}

        <React.Fragment>
          <Dialog open={open} onClose={handleClose} sx={{ width: '100% !important' }}>
            <form onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <DialogTitle>{category ? 'Update Category' : 'Add Category'}</DialogTitle>
              <DialogContent sx={{ pb: 1, pl: 1, pr: 1, width: 350 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  sx={{ my: 1 }}
                />
              </DialogContent>
              <DialogActions sx={{ pt: 0 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#c09b9b !important',
                            color: '#1a1d25'
                          }
                        }} color="primary">{category ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </form>
          </Dialog>

        </React.Fragment>


        <ConfirmationDialog
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirm Delete"
          message="Are you sure you want to delete this Category?"
        />


      </Box>
    </>
  );
};

Category.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default Category;
