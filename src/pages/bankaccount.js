import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
import { useRouter } from 'next/router';

export const Bank_Account = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    name: '',
    account_no: '',
    iban: '',
    description: ''
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const formik = useFormik({
    initialValues: {
      name: bankDetails.name,
      account_no: bankDetails.account_no || '',
      iban: bankDetails.iban || '',
      description: bankDetails.description || '',
      submit: null
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required('Name is required'),
      account_no: Yup.string().max(255).required('Account number is required'),
      iban: Yup.string().max(255).required('IBAN is required'),
      description: Yup.string().max(255)
    }),
    onSubmit: async (values, helpers) => {
      setLoading(true);

      try {
        const token = window.localStorage.getItem('token');
        const response = await axios.post(API_BASE_URL + '/api/admin/create-details', {
          name: values.name,
          account_no: values.account_no,
          iban: values.iban,
          description: values.description
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });

        const data = response.data.data;
        setBankDetails(data);
        toast.success('Bank details save successfully');
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.msg);
      }

      setLoading(false);
    }
  });

  // fetch bank details:
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const token = window.localStorage.getItem('token');

        const response = await axios.get(API_BASE_URL + `/api/admin/get-details`, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });

        const data = response.data.data;
        setBankDetails(data);
        // Here, set the initial form values after fetching bank details
        formik.setValues({
          name: data.name || '',
          account_no: data.account_no || '',
          iban: data.iban || '',
          description: data.description || '',
          submit: null
        });

      } catch (error) {
        console.log(error);
      }

    };
    fetchBankDetails();
  }, []);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h4">Bank Account</Typography>
          <form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
            <Card>
              <CardHeader subheader="The information can be edited" title="Create Account"/>
              <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      name="account_no"
                      required
                      error={Boolean(formik.touched.account_no && formik.errors.account_no)}
                      helperText={formik.touched.account_no && formik.errors.account_no}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.account_no}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="IBAN"
                      name="iban"
                      columns={100}
                      required
                      error={Boolean(formik.touched.iban && formik.errors.iban)}
                      helperText={formik.touched.iban && formik.errors.iban}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.iban}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      required
                      rows={100}
                      error={Boolean(formik.touched.description && formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.description}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit" disabled={formik.isSubmitting}>
                  Save details
                </Button>
              </CardActions>
            </Card>
          </form>
        </Stack>
      </Container>
    </Box>
  );
};

Bank_Account.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Bank_Account;
