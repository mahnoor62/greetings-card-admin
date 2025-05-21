import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useFormik } from 'formik';
import { CircularProgress } from '@mui/material';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import toast from 'react-hot-toast';
import * as React from 'react';
import axios from 'axios';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { useRouter } from 'next/router';

const Page = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = router.query;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const formik = useFormik({
    initialValues: {
      confirmPassword: '',
      submit: null
    },
    validationSchema: Yup.object({
      confirmPassword: Yup
        .string()
        .max(255)
        .required('Confirm password is required')
    }),
    onSubmit: async (values, helpers) => {
      // const loading = toast.loading('Please check your email to reset your password');
      setLoading(true);

      try {
        if (token) {
          await axios.post(API_BASE_URL + '/api/admin/reset',
            {
              token,
              confirmPassword: values.confirmPassword
            },
            {
              headers: {
                'Content-Type': 'application/json'

              }
            }
          );
          toast.success('Password reset successfully');
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.msg);
      }
      setLoading(false);
    }
  });

  return (
    <>

      <Head>
        <title>
          Reset Password | {process.env.NEXT_PUBLIC_APP_NAME}
        </title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%'
          }}
        >
          <div>
            <Stack
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Typography variant="h4">
                Reset Password
              </Typography>
            </Stack>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                  fullWidth
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  label="Confirm Password"
                  name="confirmPassword"
                  id="confirmPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.confirmPassword}
                />
              </Stack>
              {
                loading && <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress/></Box>
              }
              {formik.errors.submit && (
                <Typography
                  color="error"
                  sx={{ mt: 3 }}
                  variant="body2"
                >
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
              >
                Submit
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <AuthLayout>
    {page}
  </AuthLayout>
);

export default Page;


