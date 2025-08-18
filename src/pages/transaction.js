import React, { useEffect, useState } from 'react';
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
  Switch,
  Container,
  Tooltip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  InputAdornment,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  DialogActions, useTheme, useMediaQuery, Card
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import FilterHelper, { applyFilter, applyPagination } from '../utils/filter';
import toast from 'react-hot-toast';
import NextLink from 'next/link';
import CategoryIcon from '@mui/icons-material/Category';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmationDialog from '../components/confirmationDialogue';
import PrintIcon from '@mui/icons-material/Print';
import { useAuth } from '../hooks/use-auth';
import { useRouter } from 'next/router';
import QRCodeGenerator from '../components/qrCode';
// import applyFilter from '../utils/filter';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AR_EXPERIENCE_LINK = process.env.NEXT_PUBLIC_AR_EXPERIENCE_LINK;

const Transaction = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [printing, setPrinting] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [printingWindow, setPrintingWindow] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingComplete, setLoadingComplete] = useState(true);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  // search bar stats
  const [searchQuery, setSearchQuery] = useState('');
  // pagination stats
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [card, setCard] = useState(null);
  const [openDialogue, setOpenDialogue] = useState(false);


  const getCard = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/get-single-transaction-detail/${id}`,
        {
          headers: {
            'x-access-token': token
          }
        });
      setCard(res.data.data);
    } catch (error) {
      console.log(error);
      // toast.error(error.response.data.msg);
    }

  };

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
          `${API_BASE_URL}/api/transactions/get-all`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          }
        );
        setTransactions(response.data.data);
        setLoadingComplete(false);
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
  const filtered = applyFilter(transactions, searchQuery, [
    'transaction_id',
    'cardCustomizationId.userId.firstName',
    'cardCustomizationId.userId.email',
    'status'
  ]);
  const paginatedTransactions = applyPagination(filtered, page, rowsPerPage);
  const totalCount = filtered.length;

//handle approved button status here:
//   const handleApprovedStatus = async (id) => {
//     const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
//     const token = window.localStorage.getItem('token');
//     const loading = toast.loading('Updating transaction status...');
//
//     try {
//       if (token) {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/admin/approved-status/${id}`,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-token': token
//             }
//           }
//         );
//       }
//     } catch (error) {
//       console.log(error);
//     }
//
//     toast.dismiss(loading);
//   };
  const formatDateTime = (t) => {

    const dateObj = new Date(t);

    // Format date in local time zone
    const formattedDate = dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    // Format time in 24-hour format in local time zone
    const formattedTime = dateObj.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Combine date and time
    return `${formattedDate} ${formattedTime}`;
  };



  const handlePrintClick = (transaction) => {
    // Open window here — inside the click event to avoid popup blocking
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      console.log('Please allow popups for this site.');
      return;
    }

    setPrinting(true);
    setImagesLoaded(0);
    setSelectedTransaction(transaction);
    setPrintingWindow(newWindow); // store window reference
  };

  useEffect(() => {
    if (!selectedTransaction) {
      return;
    }

    const imageUrls = [
      selectedTransaction?.cardCustomizationId?.cardId?.frontDesign,
      selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign,
      selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign,
      selectedTransaction?.cardCustomizationId?.cardId?.backDesign
    ]
      .filter(Boolean)
      .map(url => `${BASE_URL}/${url.replace(/\\/g, '/')}`);

    if (imageUrls.length === 0) {
      callPrint();
      return;
    }

    let loaded = 0;
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loaded++;
        setImagesLoaded(prev => prev + 1);
        if (loaded === imageUrls.length) {
          callPrint();
        }
      };
    });
  }, [selectedTransaction]);

  const callPrint = () => {
    if (!printingWindow) {
      setPrinting(false);
      return;
    }

    const printContents = document.getElementById('card').outerHTML;
    const styles = `
    <style>
     body {
     margin:0; padding:0;
     font-family: 'Calibri', sans-serif !important;
          zoom: 100%; 
        }
       @page {
      size: A5 !important;
      /*display:flex;*/
      /*justify-content:center;*/
      /*align-items:center;*/
      /*marginTop: 20px;*/
    }
      img { max-width: 100%; }
      .print-card { display: block !important; }
    </style>
  `;

    printingWindow.document.write(
      `<html><head><title>Card Print</title>${styles}</head><body>`
    );
    printingWindow.document.write(printContents);
    printingWindow.document.write('</body></html>');
    printingWindow.document.close();
    printingWindow.focus();
    printingWindow.print();
    printingWindow.close();

    setPrinting(false);
    setPrintingWindow(null);
  };

  // const handlePrintClick = (transaction) => {
  //   setPrinting(true);
  //   setImagesLoaded(0);
  //   setSelectedTransaction(transaction);
  // };
  //
  //
  // useEffect(() => {
  //   if (!selectedTransaction) return;
  //
  //   const imageUrls = [
  //     selectedTransaction?.cardCustomizationId?.cardId?.frontDesign,
  //     selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign,
  //     selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign,
  //     selectedTransaction?.cardCustomizationId?.cardId?.backDesign
  //   ].filter(Boolean).map(url => `${BASE_URL}/${url.replace(/\\/g, '/')}`);
  //
  //   if (imageUrls.length === 0) {
  //     callPrint();
  //     return;
  //   }
  //
  //   let loaded = 0;
  //   imageUrls.forEach(url => {
  //     const img = new Image();
  //     img.src = url;
  //     img.onload = () => {
  //       loaded++;
  //       setImagesLoaded(prev => prev + 1);
  //       if (loaded === imageUrls.length) {
  //         callPrint();
  //       }
  //     };
  //   });
  // }, [selectedTransaction]);
  //
  // const callPrint = () => {
  //   const printContents = document.getElementById('card').outerHTML;
  //   const styles = `
  //   <style>
  //     body { font-family: Arial, sans-serif; zoom: 100%; }
  //     img { max-width: 100%; page-break-inside: avoid; }
  //     .print-card { display: block !important; }
  //   </style>
  // `;
  //   const newWindow = window.open('', '_blank');
  //   newWindow.document.write(`<html><head><title>Card Print</title>${styles}</head><body>`);
  //   newWindow.document.write(printContents);
  //   newWindow.document.write('</body></html>');
  //   newWindow.document.close();
  //   newWindow.focus();
  //   newWindow.print();
  //   newWindow.close();
  //
  //   setPrinting(false);
  // };

  console.log('transactions', transactions);
  return (
    <>
      <Head>
        <title>Transaction | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Box
        sx={{
          // backgroundColor: 'background.paper',
          // flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Container sx={{ mt: { xs: 5, md: 0 } }}>
          <Typography variant="h2" sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>Transactions</Typography>
          <TableContainer component={Paper} sx={{ width: '100%' }}>
            {/*<TableContainer component={Paper} sx={{width: '100%'}} >*/}
            <Table aria-label="simple table" sx={{ width: '100%' }}>
              <TableHead>
                <TableRow sx={{ width: '100%' }}>
                  <TableCell colSpan={8} sx={{ width: '100%' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: { md: 'row', xs: 'column' },
                      justifyContent: 'flex-end',
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

                    </Box>
                  </TableCell>

                </TableRow>
                <TableRow sx={{ justifyContent: 'space-between', alignItems: 'left' }}>
                  <TableCell sx={{ width: '10%' }}>No</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Account</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '15%' }}>Transaction Id</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Card Id</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Amount</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Status</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '40%' }}>Order Date</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingComplete ? (
                  <TableRow align="center">
                    <TableCell colSpan={8} align="center">
                      <CircularProgress/>
                    </TableCell>
                  </TableRow>
                ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((data, index) => {
                    const serialNumber = page * rowsPerPage + index + 1;
                    return (
                      <TableRow key={data._id}>
                        <TableCell component="th" scope="row">
                          {serialNumber}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.cardCustomizationId?.userId?.firstName}
                          <br/>
                          {data?.cardCustomizationId?.userId?.email}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.transaction_id}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.cardCustomizationId?._id}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {`${data?.cardCustomizationId?.cardId?.price} AUD`}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data.status}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {formatDateTime(data?.createdAt)}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ textAlign: 'left' }}>
                          <Tooltip title="Download Card">
                            <IconButton>
                              {printing && selectedTransaction?._id === data._id ? (
                                <CircularProgress size={24}/>
                              ) : (
                                <DownloadIcon onClick={() => handlePrintClick(data)}/>
                              )}
                            </IconButton>

                            {/*<IconButton>*/}

                            {/*  {*/}
                            {/*    loading && (*/}
                            {/*      <CircularProgress/>*/}
                            {/*    )*/}
                            {/*  }*/}
                            {/*  <DownloadIcon onClick={() => printReceipt(data)}/>*/}
                            {/*</IconButton>*/}
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Transaction Found
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            sx={{ mb: 5 }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Printable Card Layout */}

          {/*<div id="card" className="print-card" style={{ width: '100%', height: '100%' }}>*/}
          {/*  {selectedTransaction && (*/}
          {/*    <div style={{ display: 'flex', flexDirection: 'column' }}>*/}

          {/*      /!* Front Design - Page 1 *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.frontDesign && (*/}
          {/*        <div style={{*/}
          {/*          width: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          // pageBreakAfter: 'always',*/}
          {/*          display: 'flex',*/}
          {/*          flexDirection: 'column',*/}
          {/*          alignItems: 'center',*/}
          {/*          justifyContent: 'center'*/}
          {/*        }}>*/}
          {/*          <img*/}
          {/*            src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.frontDesign.replace(/\\/g, '/')}`}*/}
          {/*            alt="Front"*/}
          {/*            // style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
          {/*          />*/}
          {/*          <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Front Design</p>*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*      /!* Inside Design - Page 2 *!/*/}
          {/*      {(selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign ||*/}
          {/*        selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign) && (*/}
          {/*        <div style={{*/}
          {/*          width: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          // pageBreakAfter: 'always',*/}
          {/*          display: 'flex',*/}
          {/*          flexDirection: 'column',*/}
          {/*          alignItems: 'center',*/}
          {/*          justifyContent: 'center'*/}
          {/*        }}>*/}
          {/*          <div style={{*/}
          {/*            display: 'flex',*/}
          {/*            // width: '100%',*/}
          {/*            // height: '100%',*/}
          {/*            alignItems: 'center',*/}
          {/*            justifyContent: 'center',*/}
          {/*            position: 'relative'*/}
          {/*          }}>*/}
          {/*            {selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign && (*/}
          {/*              <img*/}
          {/*                src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign.replace(/\\/g, '/')}`}*/}
          {/*                alt="Inside Left"*/}
          {/*                // style={{ width: '50%', height: '100%', objectFit: 'contain' }}*/}
          {/*              />*/}
          {/*            )}*/}
          {/*            <div style={{*/}
          {/*              width: '2px',*/}
          {/*              height: '100%',*/}
          {/*              backgroundColor: 'grey',*/}
          {/*              position: 'absolute',*/}
          {/*              left: '50%',*/}
          {/*              transform: 'translateX(-50%)'*/}
          {/*            }} />*/}
          {/*            {selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign && (*/}
          {/*              <img*/}
          {/*                src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign.replace(/\\/g, '/')}`}*/}
          {/*                alt="Inside Right"*/}
          {/*                // style={{ width: '50%', height: '100%', objectFit: 'contain' }}*/}
          {/*              />*/}
          {/*            )}*/}
          {/*          </div>*/}
          {/*          <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Inside Design</p>*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*      /!* Back Design - Page 3 *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.backDesign && (*/}
          {/*        <div style={{*/}
          {/*          width: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          display: 'flex',*/}
          {/*          flexDirection: 'column',*/}
          {/*          alignItems: 'center',*/}
          {/*          justifyContent: 'center'*/}
          {/*        }}>*/}
          {/*          <div style={{*/}
          {/*            position: 'relative',*/}
          {/*            // width: '100%',*/}
          {/*            // height: '100%',*/}
          {/*          }}>*/}
          {/*            <img*/}
          {/*              src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.backDesign.replace(/\\/g, '/')}`}*/}
          {/*              alt="Back"*/}
          {/*              // style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
          {/*            />*/}
          {/*            <div style={{*/}
          {/*              position: 'absolute',*/}
          {/*              bottom: '10%',*/}
          {/*              left: '50%',*/}
          {/*              transform: 'translateX(-50%)'*/}
          {/*            }}>*/}
          {/*              <QRCodeGenerator*/}
          {/*                size={100} // bigger QR for print clarity*/}
          {/*                value={`${AR_EXPERIENCE_LINK}/${selectedTransaction?.cardCustomizationId?._id}`}*/}
          {/*              />*/}
          {/*            </div>*/}
          {/*          </div>*/}
          {/*          <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Back Design</p>*/}
          {/*        </div>*/}
          {/*      )}*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}

          {/*<div id="card" className="print-card" style={{ width: '100%' }}>*/}
          {/*  {selectedTransaction && (*/}
          {/*    <div style={{ display: 'flex', flexDirection: 'column' }}>*/}

          {/*      /!* Front - Page 1 *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.frontDesign && (*/}
          {/*        <div style={{*/}
          {/*          height: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          // display: 'flex',*/}
          {/*          // flexDirection: 'column',*/}
          {/*          // alignItems: 'center',*/}
          {/*          // justifyContent: 'center',*/}
          {/*          // pageBreakAfter: 'always'*/}
          {/*        }}>*/}
          {/*          <img*/}
          {/*            src={`${BASE_URL}/${selectedTransaction.cardCustomizationId.cardId.frontDesign.replace(/\\/g, '/')}`}*/}
          {/*            alt="Front"*/}
          {/*            style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
          {/*          />*/}
          {/*          /!*<p style={{ fontWeight: 'bold', marginTop: '10px' }}>Front Design</p>*!/*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*      /!* Inside Left - Page 2 *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign && (*/}
          {/*        <div style={{*/}
          {/*          height: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          // display: 'flex',*/}
          {/*          // flexDirection: 'column',*/}
          {/*          // alignItems: 'center',*/}
          {/*          // justifyContent: 'center',*/}
          {/*          // pageBreakAfter: 'always'*/}
          {/*        }}>*/}
          {/*          <img*/}
          {/*            src={`${BASE_URL}/${selectedTransaction.cardCustomizationId.cardId.insideLeftDesign.replace(/\\/g, '/')}`}*/}
          {/*            alt="Inside Left"*/}
          {/*            style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
          {/*          />*/}
          {/*          /!*<p style={{ fontWeight: 'bold', marginTop: '10px' }}>Inside Left</p>*!/*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*      /!* Inside Right - Page 3 *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign && (*/}
          {/*        <div style={{*/}
          {/*          height: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          // display: 'flex',*/}
          {/*          // flexDirection: 'column',*/}
          {/*          // alignItems: 'center',*/}
          {/*          // justifyContent: 'center',*/}
          {/*          // pageBreakAfter: 'always'*/}
          {/*        }}>*/}
          {/*          <img*/}
          {/*            src={`${BASE_URL}/${selectedTransaction.cardCustomizationId.cardId.insideRightDesign.replace(/\\/g, '/')}`}*/}
          {/*            alt="Inside Right"*/}
          {/*            style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
          {/*          />*/}
          {/*          /!*<p style={{ fontWeight: 'bold', marginTop: '10px' }}>Inside Right</p>*!/*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*      /!* Back - Page 4 *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.backDesign && (*/}
          {/*        <div style={{*/}
          {/*          height: '100%',*/}
          {/*          aspectRatio: '1 / 1.414',*/}
          {/*          // display: 'flex',*/}
          {/*          // flexDirection: 'column',*/}
          {/*          // alignItems: 'center',*/}
          {/*          // justifyContent: 'center'*/}
          {/*        }}>*/}
          {/*          <div style={{ position: 'relative', width: '100%' , height:'100%'}}>*/}
          {/*            <img*/}
          {/*              src={`${BASE_URL}/${selectedTransaction.cardCustomizationId.cardId.backDesign.replace(/\\/g, '/')}`}*/}
          {/*              alt="Back"*/}
          {/*              style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
          {/*            />*/}
          {/*            <div style={{*/}
          {/*              position: 'absolute',*/}
          {/*              bottom: '10%',*/}
          {/*              left: '50%',*/}
          {/*              transform: 'translateX(-50%)'*/}
          {/*            }}>*/}
          {/*              <QRCodeGenerator*/}
          {/*                size={150}*/}
          {/*                value={`${AR_EXPERIENCE_LINK}/${selectedTransaction.cardCustomizationId?._id}`}*/}
          {/*              />*/}
          {/*            </div>*/}
          {/*          </div>*/}
          {/*          /!*<p style={{ fontWeight: 'bold', marginTop: '10px' }}>Back Design</p>*!/*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}

          <div id="card" className="print-card" style={{width: '100%'}}>
            {selectedTransaction && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Reusable Card Page */}
                {[
                  {
                    src: selectedTransaction?.cardCustomizationId?.cardId?.frontDesign,
                    label: 'Front Design'
                  },
                  {
                    src: selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign,
                    label: 'Inside Left Design'
                  },
                  {
                    src: selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign,
                    label: 'Inside Right Design'
                  },
                  {
                    src: selectedTransaction?.cardCustomizationId?.cardId?.backDesign,
                    label: 'Back Design',
                    qr: true
                  }
                ].map((card, index) => (
                  card.src && (
                    <div key={index} style={{
                      width: '100%',
                      aspectRatio: '1 / 1.4142',
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // pageBreakAfter: 'none',
                      position: 'relative',
                      // marginTop: 20          // center horizontally
                    }}>
                      <img
                        src={`${BASE_URL}/${card.src.replace(/\\/g, '/')}`}
                        alt={card.label}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                      {/*<p style={{*/}
                      {/*  fontWeight: 'bold',*/}
                      {/*  marginTop: '10px',*/}
                      {/*  fontSize: '20px'*/}
                      {/*}}>{card.label}</p>*/}
                      {card.qr && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',


                          }}>
                          <QRCodeGenerator
                            value={`${AR_EXPERIENCE_LINK}/${selectedTransaction?.cardCustomizationId?._id}`}
                          />
                        </div>
                      )}
                    </div>
                  )
                ))}

              </div>
            )}
          </div>


          {/*<div id="card" className="print-card">*/}
          {/*  {selectedTransaction && (*/}
          {/*    <div*/}
          {/*      style={{*/}
          {/*        display: 'flex',*/}
          {/*        flexDirection: 'row',*/}
          {/*        justifyContent: 'center',*/}
          {/*        alignItems: 'flex-start',*/}
          {/*        gap: '10px',*/}
          {/*        padding: '10px',*/}
          {/*        flexWrap: 'nowrap'*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      /!* Front Design *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.frontDesign && (*/}
          {/*        <div style={{ textAlign: 'center', flex: '1 1 25%', maxWidth: '250px' }}>*/}
          {/*          <div*/}
          {/*            style={{*/}
          {/*              position: 'relative',*/}
          {/*              aspectRatio: '1 / 1.414',*/}
          {/*              marginBottom: '0.5rem'*/}
          {/*            }}*/}
          {/*          >*/}
          {/*            <img*/}
          {/*              src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.frontDesign.replace(*/}
          {/*                /\\/g,*/}
          {/*                '/')}`}*/}
          {/*              alt="Front"*/}
          {/*              style={{*/}
          {/*                width: '100%',*/}
          {/*                height: '100%',*/}
          {/*                objectFit: 'contain'*/}
          {/*              }}*/}
          {/*            />*/}
          {/*          </div>*/}
          {/*          <p style={{ fontWeight: 'bold' }}>Front Design</p>*/}
          {/*        </div>*/}
          {/*      )}*/}

          {/*      /!* Inside Left + Inside Right Combined *!/*/}
          {/*      {(selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign ||*/}
          {/*        selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign) && (*/}
          {/*        <div*/}
          {/*          style={{*/}
          {/*            display: 'flex',*/}
          {/*            flexDirection: 'column',*/}
          {/*            alignItems: 'center',*/}
          {/*            flex: '1 1 50%',*/}
          {/*            maxWidth: '500px',*/}
          {/*            margin: '0 auto'*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          /!* Images Row *!/*/}
          {/*          <div*/}
          {/*            style={{*/}
          {/*              width: '100%',*/}
          {/*              display: 'flex',*/}
          {/*              justifyContent: 'center',*/}
          {/*              alignItems: 'center',*/}
          {/*              position: 'relative'*/}
          {/*            }}*/}
          {/*          >*/}
          {/*            /!* Inside Left *!/*/}
          {/*            {selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign && (*/}
          {/*              <img*/}
          {/*                src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign.replace(*/}
          {/*                  /\\/g,*/}
          {/*                  '/')}`}*/}
          {/*                alt="Inside Left"*/}
          {/*                style={{*/}
          {/*                  width: '50%',*/}
          {/*                  aspectRatio: '1 / 1.414',*/}
          {/*                  objectFit: 'contain'*/}
          {/*                }}*/}
          {/*              />*/}
          {/*            )}*/}

          {/*            /!* Center Divider *!/*/}
          {/*            <div*/}
          {/*              style={{*/}
          {/*                width: '2px',*/}
          {/*                height: '99%',*/}
          {/*                backgroundColor: 'grey',*/}
          {/*                position: 'absolute',*/}
          {/*                left: '50%',*/}
          {/*                transform: 'translateX(-50%)'*/}
          {/*              }}*/}
          {/*            />*/}

          {/*            /!* Inside Right *!/*/}
          {/*            {selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign && (*/}
          {/*              <img*/}
          {/*                src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign.replace(*/}
          {/*                  /\\/g,*/}
          {/*                  '/')}`}*/}
          {/*                alt="Inside Right"*/}
          {/*                style={{*/}
          {/*                  width: '50%',*/}
          {/*                  aspectRatio: '1 / 1.414',*/}
          {/*                  objectFit: 'contain'*/}
          {/*                }}*/}
          {/*              />*/}
          {/*            )}*/}
          {/*          </div>*/}

          {/*          /!* Caption *!/*/}
          {/*          <p style={{ fontWeight: 'bold' }}>Inside Design</p>*/}
          {/*        </div>*/}
          {/*      )}*/}


          {/*      /!* Back Design with QR Code *!/*/}
          {/*      {selectedTransaction?.cardCustomizationId?.cardId?.backDesign && (*/}
          {/*        <div style={{ textAlign: 'center', flex: '1 1 25%', maxWidth: '250px' }}>*/}
          {/*          <div*/}
          {/*            style={{*/}
          {/*              position: 'relative',*/}
          {/*              aspectRatio: '1 / 1.414',*/}
          {/*              marginBottom: '0.5rem'*/}
          {/*            }}*/}
          {/*          >*/}
          {/*            <img*/}
          {/*              src={`${BASE_URL}/${selectedTransaction?.cardCustomizationId?.cardId?.backDesign.replace(*/}
          {/*                /\\/g,*/}
          {/*                '/')}`}*/}
          {/*              alt="Back"*/}
          {/*              style={{*/}
          {/*                width: '100%',*/}
          {/*                height: '100%',*/}
          {/*                objectFit: 'contain'*/}
          {/*              }}*/}
          {/*            />*/}
          {/*            <div*/}
          {/*              style={{*/}
          {/*                position: 'absolute',*/}
          {/*                bottom: '10%',*/}
          {/*                left: '50%',*/}
          {/*                transform: 'translateX(-50%)'*/}
          {/*                // padding: '4px',*/}
          {/*                // borderRadius: '4px'*/}
          {/*                // boxShadow: '0 4px 8px rgba(0,0,0,0.2)'*/}
          {/*              }}*/}
          {/*            >*/}
          {/*              /!*<div style={{*!/*/}
          {/*              /!*  width: '20px', height: '20px',*!/*/}
          {/*              /!*}}>*!/*/}
          {/*              <QRCodeGenerator*/}
          {/*                size={10}*/}
          {/*                value={`${AR_EXPERIENCE_LINK}/${selectedTransaction?.cardCustomizationId?._id}`}/>*/}
          {/*            </div>*/}
          {/*            /!*</div>*!/*/}
          {/*          </div>*/}
          {/*          <p style={{ fontWeight: 'bold' }}>Back Design</p>*/}
          {/*        </div>*/}
          {/*      )}*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}

        </Container>
      </Box>

    </>
  )
    ;
};

Transaction.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default Transaction;
