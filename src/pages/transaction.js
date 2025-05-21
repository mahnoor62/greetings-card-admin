import { useEffect, useState } from 'react';
import Head from 'next/head';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { Layout as DashboardLayout } from '../layouts/dashboard/layout';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Switch
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import FilterHelper, { applyPagination } from '../utils/filter';
import toast from 'react-hot-toast';

const Transaction = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  // search bar stats
  const [searchQuery, setSearchQuery] = useState('');
  // pagination stats
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // api function
  const getTransactions = async () => {
    setLoading(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token = window.localStorage.getItem('token');
    try {
      if (token) {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/get-all-transaction`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          }
        );
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getTransactions();
    // Polling mechanism: Fetch leaderboard data every 30 seconds
    const intervalId = setInterval(getTransactions, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    // console.log(searchQuery);
  };

//filter function
  const filtered = FilterHelper(transactions,
    searchQuery,
    ['transactionId', 'userId.name', 'gameId.name']);
  const paginatedList = applyPagination(filtered, page, rowsPerPage);
  const totalCount = filtered.length;

//handle approved button status here:
  const handleApprovedStatus = async (id) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token = window.localStorage.getItem('token');
    const loading = toast.loading('Updating transaction status...');

    try {
      if (token) {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/approved-status/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
    }

    toast.dismiss(loading);
  };

  // search bar
  return (
    <>
      <Head>
        <title>Transaction | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          // flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 1000,
            px: 3,
            py: '80px',
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', width: '100%', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>

            <Box sx={{ width: '100%' }}>
              <Typography variant="h4">Transactions</Typography>
            </Box>

            {/* Right side: Search bar */}
            <TextField
              variant="filled"
              placeholder="Search..."
              sx={{
                '&::placeholder': {
                  color: 'rgba(71, 85, 105, 1)'
                },
                height: { xs: '30%', md: '40%' },
                width: { xs: '100%', md: '40%' },
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '25px',
                marginTop: { xs: '20px', md: '0' },
                padding: 0
              }}
              onChange={event => setSearchQuery(event.target.value)}
              InputProps={{
                endAdornment: (
                  <Button variant="text" disabled={true}>
                    <SearchIcon sx={{ mt: 1.5, color: 'rgba(71, 85, 105, 1)' }}/>
                  </Button>
                )
              }}
            />
          </Box>

          <div>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ backgroundColor: '#add540' }}>
                  <TableRow sx={{ backgroundColor: '#add540' }}>
                    <TableCell style={{ backgroundColor: '#add540' }}>Transaction Id</TableCell>
                    <TableCell align="right" style={{ backgroundColor: '#add540' }}>User</TableCell>
                    <TableCell align="right" style={{ backgroundColor: '#add540' }}>Game</TableCell>
                    <TableCell align="right"
                               style={{ backgroundColor: '#add540' }}>Approved</TableCell>
                    <TableCell align="right" style={{ backgroundColor: '#add540' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedList.map((transaction, index) => (
                    <TableRow key={index}>
                      {
                        transaction.userId !== null ? (
                          <>
                            <TableCell component="th" scope="row">
                              {transaction.transactionId}
                            </TableCell>
                            <TableCell align="right">{transaction.userId.name}</TableCell>
                            <TableCell align="right">{transaction.gameId.name}</TableCell>
                            <TableCell align="right"><Switch
                              disabled={transaction.approved}
                              checked={transaction.approved}
                              onClick={() => handleApprovedStatus(transaction._id)}
                            /></TableCell>
                            <TableCell
                              align="right">{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                          </>
                        ) : ''
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/*pagination*/}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </div>
        </Box>
      </Box>

    </>
  );
};

Transaction.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default Transaction;
