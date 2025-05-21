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
import NextLink from 'next/link';

const Page = () => {
  const [loading, setLoading] = useState(false);
  // const { user, setUser } = useAuth();
  // console.log(user);
  const formik = useFormik({
    initialValues: {
      email:  '',
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required')
    }),
    onSubmit: async (values, helpers) => {
      // const loading = toast.loading('Please check your email to reset your password');
      setLoading(true);

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.post(API_BASE_URL + '/api/admin/forget',
          {
            email: values.email
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Please check your email to reset your password');
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
          Forget Password| {process.env.NEXT_PUBLIC_APP_NAME}
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
                Forget Password
              </Typography>
            </Stack>
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{mt:0, mb:2}}
            >
              Back to login?
              &nbsp;
              <NextLink
                component={NextLink}
                href="/login"
                underline="hover"
                variant="subtitle2"
                style={{ color: '#add540' }}
              >
                Log in
              </NextLink>
            </Typography>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Email Address"
                  name="email"
                  id="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
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


