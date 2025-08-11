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
import  UplaodCards  from './cards';
import Transaction from './transaction';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>
          Dashboard | {APP_NAME}
        </title>
      </Head>

      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          p: 2,
        }}
      >
        <UplaodCards />
        <Transaction />
      </Box>
    </>
  );
};

Dashboard.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Dashboard;

