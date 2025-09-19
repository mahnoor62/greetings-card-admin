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

export const UpdatePassword = () => {

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  console.log("user in pas", user)
  const formik = useFormik({
    initialValues: {
      oldPassword:  '',
      newPassword: '',
      reTypeNewPassword: '',
      submit: null
    },
    validationSchema: Yup.object({
      newPassword: Yup
        .string()
        .max(255)
        .required('New Password is required'),
      reTypeNewPassword: Yup
        .string()
        .max(255)
        .required('Password confirmation is required')
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    }),
    onSubmit: async (values, helpers) => {
      setLoading(true);

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = window.localStorage.getItem('token');
        const response = await axios.post(API_BASE_URL + '/api/profile/update-password',
          {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            reTypeNewPassword: values.reTypeNewPassword

          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token

            }
          }
        );
        toast.success('Password updated successfully');
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.msg);
      }
      setLoading(false);
    }
  });
console.log("formik.values.oldPassword", formik.values.oldPassword)
  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <Card>
        <CardHeader
          subheader="The information can be edited"
          title="Password"
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Old Password"
                  name="oldPassword"
                  type="password"
                  required
                  error={Boolean(formik.touched.oldPassword && formik.errors.oldPassword)}
                  helperText={formik.touched.oldPassword && formik.errors.oldPassword}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.oldPassword}
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  required
                  error={Boolean(formik.touched.newPassword && formik.errors.newPassword)}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.newPassword}
                />
              </Grid>
              <Grid
                xs={12}
                md={12}
              >
                <TextField
                  fullWidth
                  label="Re Type New Password"
                  name="reTypeNewPassword"
                  type="password"
                  required
                  error={Boolean(formik.touched.reTypeNewPassword
                    && formik.errors.reTypeNewPassword)}
                  helperText={formik.touched.reTypeNewPassword && formik.errors.reTypeNewPassword}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.reTypeNewPassword}
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

export default UpdatePassword;
