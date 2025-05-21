// import { useRouter } from 'next/router';
// import * as Yup from 'yup';
// import { useFormik } from 'formik';
// import { Alert, Box, Button, FormHelperText, Stack, TextField, Typography } from '@mui/material';
// import toast from 'react-hot-toast';
// import { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/use-auth';
// import { useMounted } from '../../hooks/use-mounted';
//
// export const EmailRegister = (props) => {
//
//   const isMounted = useMounted();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const { signUp, user } = useAuth();
//
//   const formik = useFormik({
//     initialValues: {
//       name: '',
//       email: '',
//       password: '',
//       submit: null
//     },
//     validationSchema: Yup.object({
//       name: Yup.string().required('Name is required'),
//       email: Yup.string().required('Email is required').email('Email is invalid'),
//       password: Yup.string().required('Password is required')
//     }),
//     onSubmit: async (values, helpers) => {
//       setLoading(true);
//       const loading = toast.loading('Registration in process...');
//       try {
//
//         await signUp({
//           name: values.name,
//           email: values.email,
//           password: values.password
//         });
//
//         toast.success('Check your email for verification');
//       } catch (err) {
//         toast.error(err.message);
//         console.error(err);
//         if (isMounted()) {
//           helpers.setStatus({ success: false });
//           helpers.setErrors({ submit: err.message });
//           helpers.setSubmitting(false);
//         }
//       }
//       toast.dismiss(loading);
//       setLoading(false);
//     }
//   });
//
//   return (
//     <form
//       noValidate
//       onSubmit={formik.handleSubmit}
//     >
//       <Stack spacing={3}>
//         <TextField
//           error={!!(formik.touched.name && formik.errors.name)}
//           fullWidth
//           helperText={formik.touched.name && formik.errors.name}
//           label="Name"
//           name="name"
//           onBlur={formik.handleBlur}
//           onChange={formik.handleChange}
//           value={formik.values.name}
//         />
//         <TextField
//           error={!!(formik.touched.email && formik.errors.email)}
//           fullWidth
//           helperText={formik.touched.email && formik.errors.email}
//           label="Email Address"
//           name="email"
//           onBlur={formik.handleBlur}
//           onChange={formik.handleChange}
//           type="email"
//           value={formik.values.email}
//         />
//         <TextField
//           error={!!(formik.touched.password && formik.errors.password)}
//           fullWidth
//           helperText={formik.touched.password && formik.errors.password}
//           label="Password"
//           name="password"
//           onBlur={formik.handleBlur}
//           onChange={formik.handleChange}
//           type="password"
//           value={formik.values.password}
//         />
//       </Stack>
//       {formik.errors.submit && (
//         <Typography
//           color="error"
//           sx={{ mt: 3 }}
//           variant="body2"
//         >
//           {formik.errors.submit}
//         </Typography>
//       )}
//       <Button
//         fullWidth
//         size="large"
//         sx={{ mt: 3 }}
//         type="submit"
//         //disabled button
//         disabled={formik.isSubmitting}
//         variant="contained"
//         // disabled={loading}
//       >
//         Register
//       </Button>
//     </form>
//   );
// };
