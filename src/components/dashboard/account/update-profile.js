import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextField,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/use-auth';
import { QrCodeScannerOutlined } from '@mui/icons-material';

export const UpdateProfile = () => {

  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user ? user.email : '');

  console.log("user", user)


  const formik = useFormik({
    initialValues: {
      name: user ? user.name : '',
      currentEmail: user ? user.email : '',
      newEmail: '',
      submit: null
    },
    validationSchema: Yup.object({
      name: Yup
        .string()
        .max(255)
        .required('Name is required'),
      currentEmail: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      newEmail: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required')
    }), // Corrected
    onSubmit: async (values, helpers) => {
      setLoading(true);

console.log("values.currentEmail", values.currentEmail)

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = window.localStorage.getItem('token');
        const response = await axios.post(API_BASE_URL + '/api/profile/update-email',
          {
            name: values.name,
            currentEmail: values.currentEmail,
            newEmail: values.newEmail

          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token

            }
          }
        );
        // Update the user email in the state
        const updatedEmail = response.data.data.email;
        setEmail(updatedEmail);
        // Update the currentEmail field value in the formik values
        formik.setValues({
          ...formik.values,
          currentEmail: updatedEmail
        
        });
      
        toast.success('Email updated successfully');
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.msg);
      }
      setLoading(false);
    }
  });

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <Card>
        <CardHeader
          subheader="The information can be edited"
          title="Email"
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={12}
              >
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  required
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Current Email"
                  name="currentEmail"
                  required
                  error={Boolean(formik.touched.currentEmail && formik.errors.currentEmail)}
                  helperText={formik.touched.currentEmail && formik.errors.currentEmail}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.currentEmail}
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="New Email"
                  name="newEmail"
                  required
                  error={Boolean(formik.touched.newEmail && formik.errors.newEmail)}
                  helperText={formik.touched.newEmail && formik.errors.newEmail}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.newEmail}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            type="submit" 
            disabled={formik.isSubmitting}
            sx={{
              '&:hover': {
                backgroundColor: '#c09b9b !important',
                color: '#1a1d25',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease-in-out'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Save details
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

export default UpdateProfile;
