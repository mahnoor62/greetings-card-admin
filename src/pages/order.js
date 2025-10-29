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
  DialogActions, useTheme, useMediaQuery, Card, CardMedia, Divider,
  Select,
  MenuItem
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
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
import jsPDF from 'jspdf';

// import applyFilter from '../utils/filter';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AR_EXPERIENCE_LINK = process.env.NEXT_PUBLIC_AR_EXPERIENCE_LINK;

const Transaction = () => {
  const theme = useTheme();
const printRef = React.useRef(null);

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
  const [shippingFilter, setShippingFilter] = useState('all');
  // pagination stats
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [card, setCard] = useState(null);
  const [openDialogue, setOpenDialogue] = useState(false);
  const [cardDetailsModal, setCardDetailsModal] = useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = useState(null);
  const [transactionDetailsModal, setTransactionDetailsModal] = useState(false);
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState(null);
  const [addressDetailsModal, setAddressDetailsModal] = useState(false);
  const [selectedAddressDetails, setSelectedAddressDetails] = useState(null);
  const [shippingConfirmationDialog, setShippingConfirmationDialog] = useState(false);
  const [selectedTransactionForShipping, setSelectedTransactionForShipping] = useState(null);
  const [shippingAction, setShippingAction] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [isProcessingShipping, setIsProcessingShipping] = useState(false);

  const handleOpenCardDetails = (transaction) => {
    setSelectedCardDetails(transaction);
    setCardDetailsModal(true);
  };

  const handleCloseCardDetails = () => {
    setCardDetailsModal(false);
    setSelectedCardDetails(null);
  };

  const handleOpenTransactionDetails = (transaction) => {
    setSelectedTransactionDetails(transaction);
    setTransactionDetailsModal(true);
  };

  const handleCloseTransactionDetails = () => {
    setTransactionDetailsModal(false);
    setSelectedTransactionDetails(null);
  };

  const handleOpenAddressDetails = (transaction) => {
    setSelectedAddressDetails(transaction);
    setAddressDetailsModal(true);
  };

  const handleCloseAddressDetails = () => {
    setAddressDetailsModal(false);
    setSelectedAddressDetails(null);
  };

  const handlePrintAddressDetails = () => {
    if (!selectedAddressDetails) return;

    const doc = new jsPDF();
    
    // Set font size and styles
    const titleFontSize = 18;
    const headingFontSize = 14;
    const textFontSize = 11;
    
    let yPosition = 20;
    
    // Title
    doc.setFontSize(titleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('Address Details', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Complete Address Section
    doc.setFontSize(headingFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('Address:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(textFontSize);
    doc.setFont(undefined, 'normal');
    const addressLines = [
      selectedAddressDetails.delivery_address || 'N/A',
      selectedAddressDetails.suburb || '',
      `${selectedAddressDetails.state || ''} ${selectedAddressDetails.postal_code || ''}`
    ];
    
    addressLines.forEach(line => {
      if (line.trim()) {
        doc.text(line, 20, yPosition);
        yPosition += 6;
      }
    });
    
    yPosition += 5;
    
    // Customer Name Section
    doc.setFontSize(headingFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('Name:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(textFontSize);
    doc.setFont(undefined, 'normal');
    const customerName = selectedAddressDetails?.cardCustomizationId?.userId 
      ? `${selectedAddressDetails.cardCustomizationId.userId.firstName || ''} ${selectedAddressDetails.cardCustomizationId.userId.lastName || ''}`
      : 'N/A';
    doc.text(customerName, 20, yPosition);
    yPosition += 10;
    
    // Phone Number Section
    doc.setFontSize(headingFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('Phone Number:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(textFontSize);
    doc.setFont(undefined, 'normal');
    doc.text(selectedAddressDetails.phone_number || 'N/A', 20, yPosition);
    
    // Generate filename with order number or timestamp
    const filename = selectedAddressDetails.orderId 
      ? `Address_Details_Order_${selectedAddressDetails.orderId}.pdf`
      : `Address_Details_${Date.now()}.pdf`;
    
    // Download the PDF
    doc.save(filename);
    toast.success('Address details downloaded successfully!');
  };

  const handleShippingStatusChange = (transaction, newStatus) => {
    // Prevent direct transition from processing to shipped
    if (newStatus === 'shipped' && transaction.shippingStatus === 'processing') {
      toast.error('Please mark order as "In Shipping" first before marking as "Shipped"');
      return;
    }
    
    if (newStatus === 'in_shipping' && transaction.shippingStatus !== 'in_shipping') {
      setSelectedTransactionForShipping(transaction);
      setShippingConfirmationDialog(true);
      setShippingAction('in_shipping');
    } else if (newStatus === 'shipped' && transaction.shippingStatus !== 'shipped') {
      setSelectedTransactionForShipping(transaction);
      setShippingConfirmationDialog(true);
      setShippingAction('shipped');
    }
  };

  const handleConfirmShipping = async () => {
    if (!selectedTransactionForShipping || !shippingAction) return;

    // If shipping action is 'in_shipping', tracking ID is required
    if (shippingAction === 'in_shipping' && !trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setIsProcessingShipping(true);
    const token = window.localStorage.getItem('token');
    try {
      let response;
      
      // If in_shipping and tracking ID is provided, use add-tracking-id endpoint to send email
      if (shippingAction === 'in_shipping' && trackingId.trim()) {
        response = await axios.put(
          `${BASE_URL}/api/transactions/add-tracking-id/${selectedTransactionForShipping._id}`,
          { 
            trackingId: trackingId.trim(),
            shippingCompany: shippingCompany.trim(),
            shippingStatus: 'in_shipping'
          },
          {
            headers: {
              'x-access-token': token
            }
          }
        );
      } else {
        // For other statuses, use the regular update endpoint
        response = await axios.put(
          `${BASE_URL}/api/transactions/update-shipping-status-new/${selectedTransactionForShipping._id}`,
          { shippingStatus: shippingAction },
          {
            headers: {
              'x-access-token': token
            }
          }
        );
      }

      if (response.data.success) {
        // Update the transaction in the local state
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction._id === selectedTransactionForShipping._id
              ? { 
                  ...transaction, 
                  shippingStatus: shippingAction,
                  isShipped: shippingAction === 'shipped',
                  trackingId: trackingId.trim() ? trackingId : transaction.trackingId,
                  shippingCompany: shippingCompany.trim() ? shippingCompany : transaction.shippingCompany,
                  inShippingDate: shippingAction === 'in_shipping' ? new Date() : transaction.inShippingDate,
                  shippedDate: shippingAction === 'shipped' ? new Date() : transaction.shippedDate
                }
              : transaction
          )
        );
        
        const actionText = shippingAction === 'in_shipping' ? 'In Shipping' : 'Shipped';
        toast.success(`Order marked as ${actionText} successfully${shippingAction === 'shipped' ? ' and email sent!' : '!'}`);
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
      toast.error('Failed to update shipping status');
    } finally {
      setIsProcessingShipping(false);
      setShippingConfirmationDialog(false);
      setSelectedTransactionForShipping(null);
      setShippingAction(null);
      setTrackingId('');
      setShippingCompany('');
    }
  };

  const handleCancelShipping = () => {
    setShippingConfirmationDialog(false);
    setSelectedTransactionForShipping(null);
    setShippingAction(null);
    setTrackingId('');
    setShippingCompany('');
    setIsProcessingShipping(false);
  };

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

  // Reset page when shipping filter changes
  useEffect(() => {
    setPage(0);
  }, [shippingFilter]);

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
        setTransactions(response.data.data || []);
        setLoadingComplete(false);
      } else {
        setLoadingComplete(false);
      }
    } catch (error) {
      console.log(error);
      setTransactions([]);
      setLoadingComplete(false);
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

  console.log("transactions", transactions)

//filter function
  let filtered = applyFilter(transactions, searchQuery, [
    'payment_intent',
    'checkout_id',
    'cardCustomizationId.userId.firstName',
    'cardCustomizationId.userId.email',
    'status',
    'title'
  ]);

  // Apply shipping status filter
  if (shippingFilter !== 'all') {
    filtered = filtered.filter(transaction => {
      const status = transaction.shippingStatus || 'processing';
      if (shippingFilter === 'shipped') {
        return status === 'shipped';
      } else if (shippingFilter === 'shipping') {
        return status === 'in_shipping';
      } else if (shippingFilter === 'processing') {
        return status === 'processing';
      }
      return true;
    });
  }
  const paginatedTransactions = applyPagination(filtered, page, rowsPerPage);
  const totalCount = filtered.length;


  console.log("paginatedTransactions", paginatedTransactions)

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

// 1) helper: builds & prints without relying on React state
//   const printTransaction = (transaction, winRef) => {
//     const docTitle = `Incardible-${transaction?.transaction_id}`;
//     const makeUrl = (p) => p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null;
//
//     const cards = [
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),  qr: false },
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.insideLeftDesign),  qr: false },
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.insideRightDesign), qr: false },
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign),   qr: true }
//     ].filter(c => !!c.src);
//
//     const styles = `
//     <style>
//       @page { size: A4 landscape; margin: 10mm; }
//       * { box-sizing: border-box; }
//       html, body { margin:0; padding:0; font-family: Calibri, sans-serif; }
//       .page { display:grid; grid-template-columns:1fr 1fr; gap:8mm; page-break-after:always; align-items:center; }
//       .page:last-child { page-break-after:auto; }
//       .card { position:relative; width:100%; aspect-ratio:1/1.4142; border:0.2mm solid #ddd; overflow:hidden; break-inside:avoid; }
//       .card img { width:100%; height:100%; object-fit:contain; display:block; }
//       .qr { position:absolute; bottom:10%; left:50%; transform:translateX(-50%); display:flex; }
//     </style>
//   `;
//
//     const makeCardHTML = (c) => `
//     <div class="card">
//       <img src="${c.src}" alt="card" />
//       ${c.qr ? `<div class="qr" id="qr-slot"></div>` : ``}
//     </div>
//   `;
//
//     const pages = [];
//     for (let i = 0; i < cards.length; i += 2) {
//       pages.push(`
//       <section class="page">
//         ${makeCardHTML(cards[i])}
//         ${cards[i + 1] ? makeCardHTML(cards[i + 1]) : `<div></div>`}
//       </section>
//     `);
//     }
//
//     winRef.document.write(`<html><head><title>${docTitle}</title>${styles}</head><body>${pages.join('')}</body></html>`);
//     winRef.document.close();
//
//     // NOTE: QRCodeGenerator is React component; print window me direct mount mushkil hota hai.
//     // Agar QR chahiye to isay server se PNG/IMG laa kar yahan <img> se inject kar dein.
//     // Example (agar aap ke paas QR image URL ho): holder.innerHTML = '<img src=".../qr.png" />';
//
//     winRef.focus();
//     winRef.print();
//   };
//
// // 2) click handler: open window synchronously, call helper, close & set flags

//   const handlePrintClick = (transaction) => {
//     try {
//       const newWindow = window.open('', '_blank'); // must be in click stack
//       if (!newWindow) {
//         toast.error('Please allow popups to print/download.');
//         return;
//       }
//       setPrinting(true);
//
//       // OPTIONAL: pre-load images to avoid blank prints in some browsers
//       const urls = [
//         transaction?.cardCustomizationId?.cardId?.frontDesign,
//         transaction?.cardCustomizationId?.cardId?.insideLeftDesign,
//         transaction?.cardCustomizationId?.cardId?.insideRightDesign,
//         transaction?.cardCustomizationId?.cardId?.backDesign
//       ].filter(Boolean).map(u => `${BASE_URL}/${u.replace(/\\/g,'/')}`);
//
//       let loaded = 0;
//       if (urls.length === 0) {
//         printTransaction(transaction, newWindow);
//         newWindow.close();
//         setPrinting(false);
//         return;
//       }
//       urls.forEach(src => {
//         const img = new Image();
//         img.onload = () => {
//           loaded += 1;
//           if (loaded === urls.length) {
//             printTransaction(transaction, newWindow);
//             newWindow.close();
//             setPrinting(false);
//           }
//         };
//         img.onerror = () => {
//           // even if one fails, continue after attempts
//           loaded += 1;
//           if (loaded === urls.length) {
//             printTransaction(transaction, newWindow);
//             newWindow.close();
//             setPrinting(false);
//           }
//         };
//         img.src = src;
//       });
//     } catch (e) {
//       console.error(e);
//       setPrinting(false);
//     }
//   };

  // 2nd wokring version
//   const printTransaction = (transaction, winRef) => {
//     const docTitle = `Incardible-${transaction?.transaction_id}`;
//     const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);
//
//     const cards = [
//       {
//         src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
//         qr: false,
//         heading: transaction?.cardCustomizationId?.arTemplateData?.mainHeadingText,
//         para1: transaction?.cardCustomizationId?.arTemplateData?.paragraph1Text,
//         para2: transaction?.cardCustomizationId?.arTemplateData?.paragraph2Text
//       },
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.insideLeftDesign), qr: false },
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.insideRightDesign), qr: false },
//       { src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign), qr: true }
//     ].filter(c => !!c.src);
//
//     const PAGE_MARGIN_MM = 10;
//     const GAP_MM = 6;            // A5 me thoda chhota gap best hota hai
//     const CONTENT_W = 210 - PAGE_MARGIN_MM * 2; // 190mm
//     const CONTENT_H = 148 - PAGE_MARGIN_MM * 2; // 128mm
//     const COL_W = (CONTENT_W - GAP_MM) / 2;   // (190 - 6)/2 = 92mm
//
//     const styles = `
// <style>
//   @page {
//     size: A5 landscape;
//     zoom: 110%;
//     margin: ${PAGE_MARGIN_MM}mm;
//   }
//
//   * { box-sizing: border-box; }
//   html, body { margin:0; padding:0; font-family: Calibri, sans-serif; }
//
//   /* Har printed page ko exact content mm do. VH use nahi karna! */
//   .page {
//     width: ${CONTENT_W}mm;
//     height: ${CONTENT_H}mm;
//     display: grid;
//     grid-template-columns:
//       ${COL_W}mm
//       ${COL_W}mm;
//     gap: ${GAP_MM}mm;
//     align-items: center;
//     justify-items: center;
//     /* Important: break-inside avoid to stop weird splits */
//     break-inside: avoid;
//     page-break-after: always;
//   }
//   .page:last-child { page-break-after: auto; }
//
//   /* Card ko HEIGHT-first fit karao, width ratio se aaye */
//   .card {
//     position: relative;
//     height: calc(100% - 2mm);   /* tiny safety to avoid overflow */
//     aspect-ratio: 1 / 1.4142;   /* A-series ratio */
//     width: auto;
//     /* Border ko ya to remove ya hairline, warna rounding se wrap ho sakta */
//     border: 0;                  /* was: 0.2mm solid #ddd */
//     overflow: hidden;
//     break-inside: avoid;
//   }
//
//   .card img {
//     width: 100%;
//     height: 100%;
//     object-fit: contain;
//     display: block;
//   }
//
//   .qr {
//     position: absolute;
//     bottom: 7%;
//     left: 50%;
//     transform: translateX(-50%);
//     display: flex;
//   }
//   .qr > img, .qr > canvas, .qr > svg {
//     width: 10mm;  /* A5 me chhota size */
//     height: 10mm;
//   }
//
// /*heading and paragaph css*/
//
// /* FULL overlay box that sits inside the card with safe padding */
// .overlay-text{
//   position: absolute;
//   inset: 8%;                 /* = 8% padding from all sides (safe border) */
//   display: flex;             /* center content vertically + horizontally */
//   align-items: center;
//   justify-content: center;
//   text-align: center;
//   z-index: 2;
//   pointer-events: none;
//   /* ensure the box never spills outside the card */
//   max-width: 84%;
//   max-height: 84%;
// }
//
// /* the actual text container that must fit in the box */
// .overlay-inner{
//   max-width: 100%;
//   max-height: 100%;
//   overflow: hidden;          /* if text still exceeds, cut safely (no overlap) */
//   line-height: 1.25;
//   color: black;               /* dark bg example; change to #111 on light bg */
// }
//
// /* make long words/uuuuuu… wrap instead of overflowing */
// .overlay-inner h2,
// .overlay-inner p{
//   margin: 0 0 3mm;
//   word-break: break-word;    /* break long tokens */
//   overflow-wrap: anywhere;   /* wrap anywhere if no spaces */
// }
//
// .overlay-inner h2{
//   font-weight: 700;
//   font-size: 18pt;
//   margin-bottom: 4mm;
// }
//
// /* default paragraph size; adjust if needed */
// .overlay-inner p{
//   font-size: 12pt;
// }
//
// /* optional outline for readability on busy artwork */
// .overlay-inner .stroke{
//   -webkit-text-stroke: 0.6pt #000;
//   /*text-shadow: 0 0 1.2mm rgba(0,0,0,.6);*/
// }
//
// @media print{
//   body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//
// }
//
//
// /* placeholder box that replaces the image */
// /* placeholder box that overlays but allows faint image */
// .card-placeholder {
//   position: absolute;
//   inset: 0;
//   background: #ffff; /* white with 85% opacity */
//   border:2px solid #bbb;
//   /*border-radius: 1mm;*/
//   z-index: 1;  /* above image but below text + QR */
// }
//
// /* Overlay text should always be above */
// .overlay-text {
//   position: absolute;
//   inset: 8%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   text-align: center;
//   z-index: 2;  /* above placeholder */
//   pointer-events: none;
//   max-width: 84%;
//   max-height: 84%;
//   overflow: hidden;
// }
//
// /* QR code on top of everything */
// .qr {
//   position: absolute;
//   bottom: 7%;
//   left: 50%;
//   transform: translateX(-50%);
//   display: flex;
//   z-index: 3;  /* highest layer */
// }
// .qr > img,
// .qr > canvas,
// .qr > svg {
//   width: 10mm;
//   height: 10mm;
// }
//
//
//
//
// </style>
// `;
//
//     //   const styles = `
//     //   <style>
//     //     @page { size: A4 landscape; margin: 10mm; }
//     //     * { box-sizing: border-box; }
//     //     html, body { margin:0; padding:0; font-family: Calibri, sans-serif; }
//     //     .page { display:grid; grid-template-columns:1fr 1fr; gap:8mm; page-break-after:always; align-items:center; }
//     //     .page:last-child { page-break-after:auto; }
//     //     .card { position:relative; width:100%; aspect-ratio:1/1.4142; border:0.2mm solid #ddd; overflow:hidden; break-inside:avoid; }
//     //     .card img { width:100%; height:100%; object-fit:contain; display:block; }
//     //     .qr { position:absolute; bottom:10%; left:50%; transform:translateX(-50%); display:flex; }
//     //     .qr > img, .qr > canvas, .qr > svg { width:20mm; height:20mm; } /* QR size */
//     //   </style>
//     // `;
//
//
//     const makeCardHTML = (c) => `
//   <div class="card">
//     <!-- keep the img in DOM but hide it -->
//     <img src="${c.src}" alt="card" class="is-hidden" />
//     <!-- placeholder white box with border -->
//     <div class="card-placeholder"></div>
//
//     ${
//       (c.heading || c.para1 || c.para2) ? `
//         <div class="overlay-text">
//           <div class="overlay-inner">
//             ${c.heading ? `<h2 class="stroke">${c.heading}</h2>` : ``}
//             ${c.para1  ? `<p class="stroke">${c.para1}</p>`       : ``}
//             ${c.para2  ? `<p class="stroke">${c.para2}</p>`       : ``}
//           </div>
//         </div>
//       ` : ``
//     }
//
//     ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ``}
//   </div>
// `;
//
//
// //     const makeCardHTML = (c) => `
// //   <div class="card">
// //     <img src="${c.src}" alt="card" />
// //     ${
// //       (c.heading || c.para1 || c.para2) ? `
// //         <div class="overlay-text">
// //           <div class="overlay-inner">
// //             ${c.heading ? `<h2 class="stroke">${c.heading}</h2>` : ``}
// //             ${c.para1  ? `<p class="stroke">${c.para1}</p>`       : ``}
// //             ${c.para2  ? `<p class="stroke">${c.para2}</p>`       : ``}
// //           </div>
// //         </div>
// //       ` : ``
// //     }
// //     ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ``}
// //   </div>
// // `;
//
//
//     const pages = [];
//     for (let i = 0; i < cards.length; i += 2) {
//       pages.push(`
//     <section class="page">
//       ${makeCardHTML(cards[i])}
//       ${cards[i + 1]
//         ? makeCardHTML(cards[i + 1])
//         : `<div style="width:${COL_W}mm;height:100%"></div>`}
//     </section>
//   `);
//     }
//
//
//     // const pages = [];
//     // for (let i = 0; i < cards.length; i += 2) {
//     //   pages.push(`
//     //   <section class="page">
//     //     ${makeCardHTML(cards[i])}
//     //     ${cards[i + 1] ? makeCardHTML(cards[i + 1]) : `<div></div>`}
//     //   </section>
//     // `);
//     // }
//
//     // Write the printable document
//     winRef.document.write(`<html><head><title>${docTitle}</title>${styles}</head><body>${pages.join(
//       '')}</body></html>`);
//     winRef.document.close();
//
//     // --- Add QR using a tiny CDN lib (no install required) ---
//     const script = winRef.document.createElement('script');
//     // qrcodejs (UMD)
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
//     script.onload = () => {
//       const qrValue = `${AR_EXPERIENCE_LINK}/${transaction?.cardCustomizationId?._id}`;
//       const slot = winRef.document.getElementById('qr-slot');
//
//       if (slot && winRef.QRCode) {
//         // Generate QR into the slot
//         const qr = new winRef.QRCode(slot, {
//           text: qrValue,
//           width: 150,   // rendered size; CSS will cap to 34mm for print
//           height: 150,
//           correctLevel: winRef.QRCode.CorrectLevel.M
//         });
//
//         // Wait until the QR <img> is present/loaded, then print
//         const waitForImgAndPrint = () => {
//           const img = slot.querySelector('img') || slot.querySelector('canvas');
//           if (!img) {
//             // observe until child arrives
//             const obs = new winRef.MutationObserver(() => {
//               const ready = slot.querySelector('img') || slot.querySelector('canvas');
//               if (ready) {
//                 obs.disconnect();
//                 // for <img>, ensure it's loaded
//                 if (ready.tagName === 'IMG' && !ready.complete) {
//                   ready.onload = () => {
//                     winRef.focus();
//                     winRef.print();
//                   };
//                 } else {
//                   winRef.focus();
//                   winRef.print();
//                 }
//               }
//             });
//             obs.observe(slot, { childList: true, subtree: true });
//           } else {
//             if (img.tagName === 'IMG' && !img.complete) {
//               img.onload = () => {
//                 winRef.focus();
//                 winRef.print();
//               };
//             } else {
//               winRef.focus();
//               winRef.print();
//             }
//           }
//         };
//
//         waitForImgAndPrint();
//       } else {
//         // Fallback: print anyway
//         winRef.focus();
//         winRef.print();
//       }
//     };
//     script.onerror = () => {
//       // If CDN fails, still print (without QR) so user isn't blocked
//       winRef.focus();
//       winRef.print();
//     };
//     winRef.document.head.appendChild(script);
//
//     // Close when printing finishes
//     winRef.onafterprint = () => {
//       try { winRef.close(); } catch {}
//     };
//   };
//
//   const handlePrintClick = (transaction) => {
//     try {
//       const newWindow = window.open('', '_blank'); // must be user-initiated
//       if (!newWindow) {
//         toast.error('Please allow popups to print/download.');
//         return;
//       }
//       setPrinting(true);
//
//       const urls = [
//         transaction?.cardCustomizationId?.cardId?.frontDesign,
//         transaction?.cardCustomizationId?.cardId?.insideLeftDesign,
//         transaction?.cardCustomizationId?.cardId?.insideRightDesign,
//         transaction?.cardCustomizationId?.cardId?.backDesign
//       ].filter(Boolean).map(u => `${BASE_URL}/${u.replace(/\\/g, '/')}`);
//
//       const proceed = () => {
//         printTransaction(transaction, newWindow);
//         // window will close on afterprint inside printTransaction
//         setPrinting(false);
//       };
//
//       if (urls.length === 0) {
//         proceed();
//         return;
//       }
//
//       let loaded = 0;
//       urls.forEach(src => {
//         const img = new Image();
//         img.onload = img.onerror = () => {
//           loaded += 1;
//           if (loaded === urls.length) {
//             proceed();
//           }
//         };
//         img.src = src;
//       });
//     } catch (e) {
//       console.error(e);
//       setPrinting(false);
//     }
//   };


//new edition with functions website

// function printTransaction(transaction) {
//   const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);

//   const arTemplateData = transaction?.cardCustomizationId?.arTemplateData || {};
//   const front = {
//     src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
//     heading: arTemplateData?.mainHeading,
//     para1:   arTemplateData?.paragraph1,
//     para2:   arTemplateData?.paragraph2
//   };
//   const back = {
//     src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign),
//     qr: true
//   };

//   const PAGE_MARGIN_MM = 10;
//   const GAP_MM = 6;
//   const CONTENT_W = 210 - PAGE_MARGIN_MM * 2;
//   const CONTENT_H = 148 - PAGE_MARGIN_MM * 2;
//   const COL_W = (CONTENT_W - GAP_MM) / 2;

//   // ----- fonts (same mapping you had) -----
//   const fontFileMap = {
//     'AlanSans-VariableFont_wght SDF': 'AlanSans-VariableFont_wght SDF.ttf',
//     'ALBA SDF': 'ALBA SDF.TTF',
//     'AlexBrush-Regular SDF': 'AlexBrush-Regular SDF.ttf',
//     'AmaticSC-Regular SDF': 'AmaticSC-Regular SDF.ttf',
//     'Anak Paud SDF': 'Anak Paud SDF.otf',
//     'Antaresia SDF': 'Antaresia SDF.otf',
//     'Anton-Regular SDF': 'Anton-Regular SDF.ttf',
//     'Apple Chancery SDF': 'Apple Chancery SDF.ttf',
//     'Aquatype SDF': 'Aquatype SDF.ttf',
//     'ARCADECLASSIC SDF': 'ARCADECLASSIC SDF.TTF',
//     'Arimo-VariableFont_wght SDF': 'Arimo-VariableFont_wght SDF.ttf',
//     'Autumn in November SDF': 'Autumn in November SDF.ttf',
//     'BareMarker-Light SDF': 'BareMarker-Light SDF.ttf',
//     'blackjack SDF': 'blackjack SDF.TTF',
//     'Canterbury SDF': 'Canterbury SDF.ttf',
//     'Carnevalee Freakshow SDF': 'Carnevalee Freakshow SDF.ttf',
//     'CHLORINR SDF': 'chlorine.TTF',
//     'DancingScript-VariableFont_wght SDF': 'DancingScript-VariableFont_wght SDF.ttf',
//     'Darhouty Frederics SDF': 'Darhouty Frederics SDF.otf',
//     'Emigrate SDF': 'Emigrate SDF.otf',
//     'Facon SDF': 'Facon SDF.ttf',
//     'Fakeblood SDF': 'Fakeblood SDF.otf',
//     'FFF_Tusj SDF': 'FFF-Tusj SDF.ttf',
//     'GrandHotel-Regular SDF': 'GrandHotel-Regular SDF.ttf',
//     'GreatVibes-Regular SDF': 'GreatVibes-Regular SDF.ttf',
//     'Hanged Letters SDF': 'Hanged Letters SDF.ttf',
//     'Happy Birthday SDF': 'happy birthday.ttf',
//     'Howdy Koala SDF': 'Howdy Koala SDF.ttf',
//     'Inter-Regular SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
//     'Inter-VariableFont_opsz,wght SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
//     'KaushanScript-Regular SDF': 'KaushanScript-Regular SDF.ttf',
//     'KingRimba SDF': 'KingRimba SDF.ttf',
//     'Lato-Regular SDF': 'Lato-Regular SDF.ttf',
//     'Lobster_1 SDF': 'Lobster_1.ttf',
//     'MAXIGO SDF': 'MAXIGO SDF.otf',
//     'Mitchell Demo SDF': 'Mitchell Demo.otf',
//     'Montserrat-VariableFont_wght SDF': 'Montserrat-Italic-VariableFont_wght SDF.ttf',
//     'Morally Serif SDF': 'Morally Serif.otf',
//     'NotoSans-VariableFont_wdth,wght SDF': 'NotoSans-VariableFont_wdth,wght.ttf',
//     'OpenSans-VariableFont_wdth,wght SDF': 'OpenSans-VariableFont_wdth,wght SDF.ttf',
//     'Pacifico SDF': 'Pacifico SDF.ttf',
//     'ParryHotter SDF': 'ParryHotter SDF.ttf',
//     'Poppins-Regular SDF': 'Poppins-Regular SDF.ttf',
//     'Pricedown Bl SDF': 'Pricedown Bl SDF.otf',
//     'Raleway-VariableFont_wght SDF': 'Raleway-VariableFont_wght SDF.ttf',
//     'Roboto-VariableFont_wdth,wght SDF': 'Roboto-VariableFont_wdth,wght SDF.ttf',
//     'Sawone SDF': 'Sawone SDF.ttf',
//     'Sofia-Regular SDF': 'Sofia-Regular SDF.ttf',
//     'Super Adorable SDF': 'Super Adorable SDF.ttf',
//     'waltograph42 SDF': 'waltograph42 SDF.otf',
//     'Way Come SDF': 'Way Come SDF.ttf',
//     'YoungMorin-Regular SDF': 'YoungMorin-Regular SDF.ttf',
//     'Zombie_Holocaust SDF': 'Zombie_Holocaust SDF.ttf'
//   };

//   const fontNames = [front?.heading?.fontName, front?.para1?.fontName, front?.para2?.fontName]
//     .filter(Boolean);

//   const generateLocalFontFaces = () => {
//     const unique = [...new Set(fontNames)];
//     return unique.map((fontName) => {
//       const file = fontFileMap[fontName];
//       if (!file) return '';
//       const clean = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//       const format = file.endsWith('.otf') ? 'opentype' : 'truetype';
//       // same path you used (/font/*)
//       return `
// @font-face{
//   font-family:'${clean}';
//   src:url('/font/${file}') format('${format}');
//   font-weight:normal;font-style:normal;font-display:block;
// }`;
//     }).join('\n');
//   };

//   const styles = `
// <style>
//   @page { size: A5 landscape; margin: ${PAGE_MARGIN_MM}mm; }
//   ${generateLocalFontFaces()}
//   *{box-sizing:border-box}
//   html,body{margin:0;padding:0;font-family:Calibri,Arial,sans-serif}
//   .page{
//     width:${CONTENT_W}mm;height:${CONTENT_H}mm;
//     display:grid;grid-template-columns:${COL_W}mm ${COL_W}mm;gap:${GAP_MM}mm;
//     align-items:center;justify-items:center;break-inside:avoid;page-break-after:always;
//   }
//   .page:last-child{page-break-after:auto}
//   .card{
//     position:relative;height:calc(100% - 2mm);aspect-ratio:1/1.4142;width:auto;
//     background:#fff;overflow:hidden;break-inside:avoid;
//     background-size:cover;background-position:center;background-repeat:no-repeat;
//   }
//   .overlay-text{
//     position:absolute;inset:8%;
//     display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none;
//     max-width:84%;max-height:84%;
//   }
//   .overlay-inner{width:100%;max-width:100%;max-height:100%;overflow:hidden;line-height:1.25;}
//   .overlay-inner h2,.overlay-inner p{margin:0 0 3mm;word-wrap:break-word;}
//   .qr{position:absolute;bottom:7%;left:50%;transform:translateX(-50%);display:flex;z-index:3;}
//   .qr>img,.qr>canvas,.qr>svg{width:10mm;height:10mm;}
// </style>`;

//   // helpers (same as yours)
//   const rgbToCss = (c) => {
//     if (!c || typeof c.r === 'undefined') return 'black';
//     return `rgb(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)})`;
//   };
//   const applyTextStyle = (obj, tag='p') => {
//     if (!obj || !obj.text) return '';
//     const color = rgbToCss(obj.color);
//     const fontSize = obj.fontSize ? `${obj.fontSize}px` : (tag==='h2' ? '18px' : '12px');
//     const fw = obj.isBold ? 'bold' : 'normal';
//     const fs = obj.isItalic ? 'italic' : 'normal';
//     const td = obj.isUnderline ? 'underline' : 'none';
//     const clean = (obj.fontName||'').replace(/ SDF$/i,'').replace(/-VariableFont_.+$/i,'').replace(/-Regular$/i,'');
//     let align = obj.alignment || 'center';
//     if (obj.isLeftAligned) align = 'left';
//     else if (obj.isRightAligned) align = 'right';
//     else if (obj.isCenterAligned) align = 'center';
//     const style = `color:${color};font-size:${fontSize};font-weight:${fw};font-style:${fs};text-decoration:${td};text-align:${align};font-family:${clean};margin:0 0 3mm;line-height:1.3;`;
//     return `<${tag} style="${style}">${obj.text}</${tag}>`;
//   };

//   const makeCardHTML = (c, id) => `
//     <div class="card" id="${id}" style="${c.src ? `background-image:url('${c.src}')` : ''}">
//       ${(c.heading || c.para1 || c.para2) ? `
//         <div class="overlay-text">
//           <div class="overlay-inner">
//             ${c.heading ? applyTextStyle(c.heading,'h2') : ''}
//             ${c.para1 ? applyTextStyle(c.para1,'p') : ''}
//             ${c.para2 ? applyTextStyle(c.para2,'p') : ''}
//           </div>
//         </div>` : ''}
//       ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ''}
//     </div>`;

//   const page1 = `<section class="page">${makeCardHTML(front,'card-front')}<div></div></section>`;
//   const page2 = `<section class="page"><div></div>${makeCardHTML(back,'card-back')}</section>`;

//   // inline script to init QR + wait a tick then print
//   const init = `
// <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script>
// <script>
//   try { window.opener = null; } catch(e){}
//   const templateId = ${JSON.stringify(transaction?.cardCustomizationId?._id)};
//   const arLink = ${JSON.stringify(AR_EXPERIENCE_LINK)};
//   function preload(src){ return new Promise(r => { if(!src) return r(); const i=new Image(); i.onload=i.onerror=()=>r(); i.src=src; }); }
//   async function boot(){
//     // ensure card backgrounds are cached before print (helps avoid blank-on-print in some browsers)
//     await Promise.all([preload(${JSON.stringify(front.src)}), preload(${JSON.stringify(back.src)})]);

//     // QR
//     const slot = document.getElementById('qr-slot');
//     if (slot && window.QRCode) {
//       new QRCode(slot, { text: arLink + '/?templateId=' + templateId, width: 100, height: 100, correctLevel: QRCode.CorrectLevel.M });
//     }
//     // wait a moment for fonts + qr + images to render
//     const waitFonts = document.fonts && document.fonts.ready ? document.fonts.ready.catch(()=>{}) : Promise.resolve();
//     Promise.resolve(waitFonts).then(() => setTimeout(() => { try { window.focus(); window.print(); } catch(e){} }, 500));
//   }
//   if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
//   else window.addEventListener('DOMContentLoaded', boot);
// </script>`;

//   return `<!doctype html><html><head><meta charset="utf-8"/><title>Incardible-${transaction?.title||''}</title>${styles}</head><body>${page1}${page2}${init}</body></html>`;
// }


// const handlePrintClick = (transaction) => {
//   try {
//     setPrinting(true);
//     const html = printTransaction(transaction);
//     const blob = new Blob([html], { type: 'text/html' });
//     const url  = URL.createObjectURL(blob);
//     window.open(url, '_blank', 'noopener'); // new tab; opener stays free
//   } catch (e) {
//     console.error(e);
//     toast.error('Could not open print preview.');
//   } finally {
//     setTimeout(() => setPrinting(false), 300);
//   }
// };


function buildPrintHTML_SameStyle(transaction) {
  const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);

  // sirf front/back data
  const arTemplateData = transaction?.cardCustomizationId?.arTemplateData;
  const front = {
    src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
    heading: arTemplateData?.mainHeading,
    para1:   arTemplateData?.paragraph1,
    para2:   arTemplateData?.paragraph2
  };
  const back = {
    src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign),
    qr: true
  };

  const PAGE_MARGIN_MM = 10;
  const GAP_MM = 6;
  const CONTENT_W = 210 - PAGE_MARGIN_MM * 2;
  const CONTENT_H = 148 - PAGE_MARGIN_MM * 2;
  const COL_W = (CONTENT_W - GAP_MM) / 2;

  // --- SAME font collection + mapping as your original ---
  const extractFontNames = () => {
    const s = new Set();
    if (arTemplateData?.mainHeading?.fontName) s.add(arTemplateData.mainHeading.fontName);
    if (arTemplateData?.paragraph1?.fontName) s.add(arTemplateData.paragraph1.fontName);
    if (arTemplateData?.paragraph2?.fontName) s.add(arTemplateData.paragraph2.fontName);
    return Array.from(s);
  };
  const fontNames = extractFontNames();

  const fontFileMap = {
    'AlanSans-VariableFont_wght SDF': 'AlanSans-VariableFont_wght SDF.ttf',
    'ALBA SDF': 'ALBA SDF.TTF',
    'AlexBrush-Regular SDF': 'AlexBrush-Regular SDF.ttf',
    'AmaticSC-Regular SDF': 'AmaticSC-Regular SDF.ttf',
    'Anak Paud SDF': 'Anak Paud SDF.otf',
    'Antaresia SDF': 'Antaresia SDF.otf',
    'Anton-Regular SDF': 'Anton-Regular SDF.ttf',
    'Apple Chancery SDF': 'Apple Chancery SDF.ttf',
    'Aquatype SDF': 'Aquatype SDF.ttf',
    'ARCADECLASSIC SDF': 'ARCADECLASSIC SDF.TTF',
    'Arimo-VariableFont_wght SDF': 'Arimo-VariableFont_wght SDF.ttf',
    'Autumn in November SDF': 'Autumn in November SDF.ttf',
    'BareMarker-Light SDF': 'BareMarker-Light SDF.ttf',
    'blackjack SDF': 'blackjack SDF.TTF',
    'Canterbury SDF': 'Canterbury SDF.ttf',
    'Carnevalee Freakshow SDF': 'Carnevalee Freakshow SDF.ttf',
    'CHLORINR SDF': 'chlorine.TTF',
    'DancingScript-VariableFont_wght SDF': 'DancingScript-VariableFont_wght SDF.ttf',
    'Darhouty Frederics SDF': 'Darhouty Frederics SDF.otf',
    'Emigrate SDF': 'Emigrate SDF.otf',
    'Facon SDF': 'Facon SDF.ttf',
    'Fakeblood SDF': 'Fakeblood SDF.otf',
    'FFF_Tusj SDF': 'FFF-Tusj SDF.ttf',
    'GrandHotel-Regular SDF': 'GrandHotel-Regular SDF.ttf',
    'GreatVibes-Regular SDF': 'GreatVibes-Regular SDF.ttf',
    'Hanged Letters SDF': 'Hanged Letters SDF.ttf',
    'Happy Birthday SDF': 'happy birthday.ttf',
    'Howdy Koala SDF': 'Howdy Koala SDF.ttf',
    'Inter-Regular SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
    'Inter-VariableFont_opsz,wght SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
    'KaushanScript-Regular SDF': 'KaushanScript-Regular SDF.ttf',
    'KingRimba SDF': 'KingRimba SDF.ttf',
    'Lato-Regular SDF': 'Lato-Regular SDF.ttf',
    'Lobster_1 SDF': 'Lobster_1.ttf',
    'MAXIGO SDF': 'MAXIGO SDF.otf',
    'Mitchell Demo SDF': 'Mitchell Demo.otf',
    'Montserrat-VariableFont_wght SDF': 'Montserrat-Italic-VariableFont_wght SDF.ttf',
    'Morally Serif SDF': 'Morally Serif.otf',
    'NotoSans-VariableFont_wdth,wght SDF': 'NotoSans-VariableFont_wdth,wght.ttf',
    'OpenSans-VariableFont_wdth,wght SDF': 'OpenSans-VariableFont_wdth,wght SDF.ttf',
    'Pacifico SDF': 'Pacifico SDF.ttf',
    'ParryHotter SDF': 'ParryHotter SDF.ttf',
    'Poppins-Regular SDF': 'Poppins-Regular SDF.ttf',
    'Pricedown Bl SDF': 'Pricedown Bl SDF.otf',
    'Raleway-VariableFont_wght SDF': 'Raleway-VariableFont_wght SDF.ttf',
    'Roboto-VariableFont_wdth,wght SDF': 'Roboto-VariableFont_wdth,wght SDF.ttf',
    'Sawone SDF': 'Sawone SDF.ttf',
    'Sofia-Regular SDF': 'Sofia-Regular SDF.ttf',
    'Super Adorable SDF': 'Super Adorable SDF.ttf',
    'waltograph42 SDF': 'waltograph42 SDF.otf',
    'Way Come SDF': 'Way Come SDF.ttf',
    'YoungMorin-Regular SDF': 'YoungMorin-Regular SDF.ttf',
    'Zombie_Holocaust SDF': 'Zombie_Holocaust SDF.ttf'
  };

  const generateLocalFontFaces = () => {
    const unique = [...new Set(fontNames)];
    return unique.map(fontName => {
      const file = fontFileMap[fontName];
      if (!file) return '';
      const clean = fontName.replace(/ SDF$/i,'').replace(/-VariableFont_.+$/i,'').replace(/-Regular$/i,'');
      const format = file.endsWith('.otf') ? 'opentype' : 'truetype';
      // NOTE: same /font/* path like your original
      return `
@font-face{
  font-family:'${clean}';
  src:url('/font/${file}') format('${format}');
  font-weight:normal;font-style:normal;font-display:block;
}`; }).join('\n');
  };

  const styles = `
<style>
  @page { size: A5 landscape; margin: ${PAGE_MARGIN_MM}mm; }
  ${generateLocalFontFaces()}

  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; font-family: Calibri, Arial, sans-serif; }
  .page {
    width:${CONTENT_W}mm; height:${CONTENT_H}mm;
    display:grid; grid-template-columns:${COL_W}mm ${COL_W}mm; gap:${GAP_MM}mm;
    align-items:center; justify-items:center; break-inside:avoid; page-break-after:always;
  }
  .page:last-child { page-break-after: auto; }

  .card {
    position: relative;
    height: calc(100% - 2mm);
    aspect-ratio: 1 / 1.4142;
    width: auto;
    background: #fff;
    overflow: hidden;
    break-inside: avoid;
    /* (optional) if you were using bg images earlier, uncomment:
    background-size: cover; background-position: center; background-repeat: no-repeat; */
  }

  .overlay-text{
    position: absolute; inset: 8%;
    display:flex; align-items:center; justify-content:center;
    z-index:2; pointer-events:none;
    max-width:84%; max-height:84%;
  }
  .overlay-inner{
    width:100%; max-width:100%; max-height:100%;
    overflow:hidden; line-height:1.25;
  }
  .overlay-inner h2, .overlay-inner p { margin:0 0 3mm; word-wrap: break-word; }

  .qr {
    position: absolute; bottom: 7%; left: 50%; transform: translateX(-50%);
    display:flex; z-index:3;
  }
  .qr > img, .qr > canvas, .qr > svg { width: 10mm; height: 10mm; }
</style>`;

  // --- SAME helpers & applyTextStyle (no quotes around font-family, same as your working code) ---
  const rgbToCss = (c) => {
    if (!c || typeof c.r === 'undefined') return 'black';
    const r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const applyTextStyle = (textObj, tag='p') => {
    // For h2 and p tags, render box even if no text (with default dimensions)
    const hasText = textObj && textObj.text;
    const shouldRenderEmptyBox = (tag === 'h2' || tag === 'p');
    
    // Handle completely missing textObj
    if (!textObj) {
      if (shouldRenderEmptyBox) {
        const defaultWidth = tag === 'h2' ? '264px' : '234px'; // 264 - 30 for paragraph1
        const defaultHeight = tag === 'h2' ? '81px' : '273px';
        const marginStyle = tag === 'p' ? '0 auto 3mm' : '0 0 3mm'; // Center paragraph horizontally
        return `<${tag} style="width: ${defaultWidth}; height: ${defaultHeight}; border: 1px dashed #ccc; box-sizing: border-box; margin: ${marginStyle}; padding: 5px;"></${tag}>`;
      }
      return '';
    }
    
    if (!hasText && !shouldRenderEmptyBox) {
      return '';
    }
    
    const color = textObj.color ? rgbToCss(textObj.color) : 'black';
    const fontSize = textObj.fontSize ? `${textObj.fontSize}px` : (tag==='h2' ? '18px' : '12px');
    const fontWeight = textObj.isBold ? 'bold' : 'normal';
    const fontStyle  = textObj.isItalic ? 'italic' : 'normal';
    const textDecoration = textObj.isUnderline ? 'underline' : 'none';

    // EXACT same clean name + NO quotes (matches your @font-face family)
    const cleanFontName = (textObj.fontName||'Arial')
      .replace(/ SDF$/i,'')
      .replace(/-VariableFont_.+$/i,'')
      .replace(/-Regular$/i,'');

    let textAlign = textObj.alignment || 'center';
    if (textObj.isLeftAligned) textAlign = 'left';
    else if (textObj.isRightAligned) textAlign = 'right';
    else if (textObj.isCenterAligned) textAlign = 'center';
    
    // Add default dimensions if missing
    let width, height;
    if (tag === 'h2') {
      width = textObj.width != null ? `${textObj.width}px` : '264px';
      height = textObj.height != null ? `${textObj.height}px` : '81px';
    } else if (tag === 'p') {
      // Subtract 30px from width for paragraph1
      if (textObj.width != null) {
        const originalWidth = textObj.width;
        const adjustedWidth = originalWidth - 30;
        width = `${adjustedWidth}px`;
      } else {
        width = '234px'; // 264 - 30
      }
      height = textObj.height != null ? `${textObj.height}px` : '273px';
    }
    
    const dimensionStyles = (width && height) ? `width: ${width}; height: ${height};` : '';
    const borderStyle = !hasText ? 'border: 1px dashed #ccc;' : '';
    const textContent = textObj.text || '';
    const marginStyle = tag === 'p' ? '0 auto 3mm' : '0 0 3mm'; // Center paragraph horizontally

    const style = `${dimensionStyles} ${borderStyle} color:${color}; font-size:${fontSize}; font-weight:${fontWeight}; font-style:${fontStyle}; text-decoration:${textDecoration}; text-align:${textAlign}; font-family:${cleanFontName}; margin:${marginStyle}; padding:5px; box-sizing: border-box; line-height:1.3; overflow-wrap: break-word; word-break: normal; white-space: normal; hyphens: none; display: block; overflow: hidden; text-overflow: ellipsis;`;
    return `<${tag} style="${style}">${textContent}</${tag}>`;
  };

  const makeCardHTML = (c) => `
    <div class="card" ${c.src ? `style="background-image:url('${c.src}');"` : ''}>
      ${!c.qr ? `
      <div class="overlay-text">
        <div class="overlay-inner">
          ${applyTextStyle(c.heading,'h2')}
          ${applyTextStyle(c.para1,'p')}
          ${c.para2 ? applyTextStyle(c.para2,'p') : ''}
        </div>
      </div>` : ''}
      ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ''}
    </div>
  `;

  const pages = [
    `<section class="page">${makeCardHTML(front)}<div></div></section>`,
    `<section class="page"><div></div>${makeCardHTML(back)}</section>`
  ];

  // inline script: QR + font loading wait + print (same logic as your winRef version but using document)
  const init = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script>
<script>
  const templateId = ${JSON.stringify(transaction?.cardCustomizationId?._id)};
  const qrValue = ${JSON.stringify(AR_EXPERIENCE_LINK)} + '/?templateId=' + templateId;
  const fontNames = ${JSON.stringify(fontNames.map(n => n?.replace(/ SDF$/i,'').replace(/-VariableFont_.+$/i,'').replace(/-Regular$/i,'')))};

  function preload(src){
    return new Promise(r => { if(!src) return r(); const i=new Image(); i.onload=i.onerror=()=>r(); i.src=src; });
  }

  async function loadFontsWithFontFaceAPI(){
    if (!('fonts' in document)) return;
    // (your original tried FontFace load programmatically; keeping minimal here
    // because @font-face + document.fonts.ready is enough when using same-origin /font/*)
    try {
      await document.fonts.ready;
    } catch(e){}
  }

  async function boot(){
    // Preload card images to avoid blank on print
    await Promise.all([preload(${JSON.stringify(front.src)}), preload(${JSON.stringify(back.src)})]);

    // Create QR
    const slot = document.getElementById('qr-slot');
    if (slot && window.QRCode) {
      new QRCode(slot, { text: qrValue, width: 100, height: 100, correctLevel: QRCode.CorrectLevel.M });
    }

    // Wait fonts
    await loadFontsWithFontFaceAPI();

    // Safety check (like your code)
    const check = () => fontNames.every(n => document.fonts.check('16px "'+n+'"') || document.fonts.check('16px '+n));
    if (!check() && document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch(e){}
    }

    // Tiny delay then print
    setTimeout(() => { try{ window.focus(); window.print(); } catch(e){} }, 500);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else window.addEventListener('DOMContentLoaded', boot);
</script>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Incardible-${transaction?.title || ''}</title>
  ${styles}
</head>
<body>
  ${pages.join('')}
  ${init}
</body>
</html>`;
}



// const handlePrintClick = (transaction) => {
//   try {
//     setPrinting(true);
//     const html = Transactions(transaction);
//     const blob = new Blob([html], { type: 'text/html' });
//     const url  = URL.createObjectURL(blob);
//     window.open(url, '_blank', 'noopener');
//   } catch (e) {
//     console.error(e);
//     toast.error('Could not open print preview.');
//   } finally {
//     setTimeout(() => setPrinting(false), 300);
//   }
//  };


// const Transactions = (transaction, winRef) => {
//   const docTitle = `Incardible-${transaction?.title}`;
//   const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);

//   // sirf front aur back lena hai
//   const arTemplateData = transaction?.cardCustomizationId?.arTemplateData;
//   const front = {
//     src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
//     heading: arTemplateData?.mainHeading,
//     para1: arTemplateData?.paragraph1,
//     para2: arTemplateData?.paragraph2
//   };
//   const back = {
//     src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign),
//     qr: true
//   };

//   const PAGE_MARGIN_MM = 10;
//   const GAP_MM = 6;
//   const CONTENT_W = 210 - PAGE_MARGIN_MM * 2;
//   const CONTENT_H = 148 - PAGE_MARGIN_MM * 2;
//   const COL_W = (CONTENT_W - GAP_MM) / 2;

//   // Extract unique font names from the data
//   const extractFontNames = () => {
//     const fonts = new Set();
//     if (arTemplateData?.mainHeading?.fontName) {
//       fonts.add(arTemplateData.mainHeading.fontName);
//     }
//     if (arTemplateData?.paragraph1?.fontName) {
//       fonts.add(arTemplateData.paragraph1.fontName);
//     }
//     if (arTemplateData?.paragraph2?.fontName) {
//       fonts.add(arTemplateData.paragraph2.fontName);
//     }
//     return Array.from(fonts);
//   };

//   const fontNames = extractFontNames();
//   console.log('Fonts to load:', fontNames);

//   // Map Unity font names to local font file names (exact match)
//   const mapFontNameToFile = (fontName) => {
//     if (!fontName) return '';
    
//     console.log(`Mapping font: "${fontName}"`);
    
//     // Create exact mapping from Unity font names to actual file names
//     const fontFileMap = {
//       'AlanSans-VariableFont_wght SDF': 'AlanSans-VariableFont_wght SDF.ttf',
//       'ALBA SDF': 'ALBA SDF.TTF',
//       'AlexBrush-Regular SDF': 'AlexBrush-Regular SDF.ttf',
//       'AmaticSC-Regular SDF': 'AmaticSC-Regular SDF.ttf',
//       'Anak Paud SDF': 'Anak Paud SDF.otf',
//       'Antaresia SDF': 'Antaresia SDF.otf',
//       'Anton-Regular SDF': 'Anton-Regular SDF.ttf',
//       'Apple Chancery SDF': 'Apple Chancery SDF.ttf',
//       'Aquatype SDF': 'Aquatype SDF.ttf',
//       'ARCADECLASSIC SDF': 'ARCADECLASSIC SDF.TTF',
//       'Arimo-VariableFont_wght SDF': 'Arimo-VariableFont_wght SDF.ttf',
//       'Autumn in November SDF': 'Autumn in November SDF.ttf',
//       'BareMarker-Light SDF': 'BareMarker-Light SDF.ttf',
//       'blackjack SDF': 'blackjack SDF.TTF',
//       'Canterbury SDF': 'Canterbury SDF.ttf',
//       'Carnevalee Freakshow SDF': 'Carnevalee Freakshow SDF.ttf',
//       'CHLORINR SDF': 'chlorine.TTF',
//       'DancingScript-VariableFont_wght SDF': 'DancingScript-VariableFont_wght SDF.ttf',
//       'Darhouty Frederics SDF': 'Darhouty Frederics SDF.otf',
//       'Emigrate SDF': 'Emigrate SDF.otf',
//       'Facon SDF': 'Facon SDF.ttf',
//       'Fakeblood SDF': 'Fakeblood SDF.otf',
//       'FFF_Tusj SDF': 'FFF-Tusj SDF.ttf',
//       'GrandHotel-Regular SDF': 'GrandHotel-Regular SDF.ttf',
//       'GreatVibes-Regular SDF': 'GreatVibes-Regular SDF.ttf',
//       'Hanged Letters SDF': 'Hanged Letters SDF.ttf',
//       'Happy Birthday SDF': 'happy birthday.ttf',
//       'Howdy Koala SDF': 'Howdy Koala SDF.ttf',
//       'Inter-Regular SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
//       'Inter-VariableFont_opsz,wght SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
//       'KaushanScript-Regular SDF': 'KaushanScript-Regular SDF.ttf',
//       'KingRimba SDF': 'KingRimba SDF.ttf',
//       'Lato-Regular SDF': 'Lato-Regular SDF.ttf',
//       'Lobster_1 SDF': 'Lobster_1.ttf',
//       'MAXIGO SDF': 'MAXIGO SDF.otf',
//       'Mitchell Demo SDF': 'Mitchell Demo.otf',
//       'Montserrat-VariableFont_wght SDF': 'Montserrat-Italic-VariableFont_wght SDF.ttf',
//       'Morally Serif SDF': 'Morally Serif.otf',
//       'NotoSans-VariableFont_wdth,wght SDF': 'NotoSans-VariableFont_wdth,wght.ttf',
//       'OpenSans-VariableFont_wdth,wght SDF': 'OpenSans-VariableFont_wdth,wght SDF.ttf',
//       'Pacifico SDF': 'Pacifico SDF.ttf',
//       'ParryHotter SDF': 'ParryHotter SDF.ttf',
//       'Poppins-Regular SDF': 'Poppins-Regular SDF.ttf',
//       'Pricedown Bl SDF': 'Pricedown Bl SDF.otf',
//       'Raleway-VariableFont_wght SDF': 'Raleway-VariableFont_wght SDF.ttf',
//       'Roboto-VariableFont_wdth,wght SDF': 'Roboto-VariableFont_wdth,wght SDF.ttf',
//       'Sawone SDF': 'Sawone SDF.ttf',
//       'Sofia-Regular SDF': 'Sofia-Regular SDF.ttf',
//       'Super Adorable SDF': 'Super Adorable SDF.ttf',
//       'waltograph42 SDF': 'waltograph42 SDF.otf',
//       'Way Come SDF': 'Way Come SDF.ttf',
//       'YoungMorin-Regular SDF': 'YoungMorin-Regular SDF.ttf',
//       'Zombie_Holocaust SDF': 'Zombie_Holocaust SDF.ttf'
//     };
    
//     const result = fontFileMap[fontName] || null;
//     console.log(`Font file result for "${fontName}": "${result}"`);
//     return result;
//   };

//   // Generate @font-face declarations for local fonts
//   const generateLocalFontFaces = () => {
//     const fontFaces = [];
//     const uniqueFonts = [...new Set(fontNames)];
    
//     uniqueFonts.forEach(fontName => {
//       const fontFile = mapFontNameToFile(fontName);
//       console.log(`Font mapping: "${fontName}" -> "${fontFile}"`);
//       if (fontFile) {
//         const cleanFontName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//         console.log(`Clean font name: "${fontName}" -> "${cleanFontName}"`);
        
//         // Determine font format based on file extension
//         const format = fontFile.endsWith('.otf') ? 'opentype' : 'truetype';
        
//         // Try multiple paths to ensure font loads
//         const fontPaths = [
//           `/font/${fontFile}`,
//           `./font/${fontFile}`,
//           `${window.location.origin}/font/${fontFile}`
//         ];
        
//         fontFaces.push(`
//           @font-face {
//             font-family: '${cleanFontName}';
//             src: url('${fontPaths[0]}') format('${format}');
//             font-weight: normal;
//             font-style: normal;
//             font-display: block;
//           }
//         `);
//       } else {
//         console.log(`No font file found for: "${fontName}"`);
//       }
//     });
    
//     return fontFaces.join('\n');
//   };

//   const localFontFaces = generateLocalFontFaces();
//   console.log('Local font faces generated:', localFontFaces);

//   const styles = `
// <style>
// @page {
//   size: A5 landscape;
//   margin: ${PAGE_MARGIN_MM}mm;
// }

// ${localFontFaces}

// * { box-sizing: border-box; }
// html, body { margin:0; padding:0; font-family: Calibri, Arial, sans-serif; }
// .page {
//   width: ${CONTENT_W}mm;
//   height: ${CONTENT_H}mm;
//   display: grid;
//   grid-template-columns: ${COL_W}mm ${COL_W}mm;
//   gap: ${GAP_MM}mm;
//   align-items: center;
//   justify-items: center;
//   break-inside: avoid;
//   page-break-after: always;
// }
// .page:last-child { page-break-after: auto; }

// .card {
//   position: relative;
//   height: calc(100% - 2mm);
//   aspect-ratio: 1 / 1.4142;
//   width: auto;
//   background: #fff;
//   overflow: hidden;
//   break-inside: avoid;
// }

// .overlay-text{
//   position: absolute;
//   inset: 8%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 2;
//   pointer-events: none;
//   max-width: 84%;
//   max-height: 84%;
// }
// .overlay-inner{
//   width: 100%;
//   max-width: 100%;
//   max-height: 100%;
//   overflow: hidden;
//   line-height: 1.25;
// }
// .overlay-inner h2, .overlay-inner p { margin:0 0 3mm; word-wrap: break-word; }

// .qr {
//   position: absolute;
//   bottom: 7%;
//   left: 50%;
//   transform: translateX(-50%);
//   display: flex;
//   z-index: 3;
// }
// .qr > img, .qr > canvas, .qr > svg {
//   width: 10mm;
//   height: 10mm;
// }
// </style>`;

//   // Helper function to convert RGB values to CSS color
//   const rgbToCss = (colorObj) => {
//     if (!colorObj || typeof colorObj.r === 'undefined') return 'black';
//     const r = Math.round(colorObj.r * 255);
//     const g = Math.round(colorObj.g * 255);
//     const b = Math.round(colorObj.b * 255);
//     return `rgb(${r}, ${g}, ${b})`;
//   };

//   // Map Unity font names to local font names
//   const mapUnityFontToWebFont = (fontName) => {
//     if (!fontName) return 'Calibri, Arial, sans-serif';
    
//     console.log(`mapUnityFontToWebFont input: "${fontName}"`);
    
//     // Use the exact font name as it appears in the @font-face declaration
//     // The @font-face uses the cleaned name (without SDF suffix)
//     let cleaned = fontName.replace(/ SDF$/i, '').trim();
//     console.log(`Final font family name: "${cleaned}"`);
    
//     // Use ONLY the custom font from your public/font folder
//     // No fallback fonts - only your custom fonts
//     const result = `"${cleaned}"`;
//     console.log(`Final font family: "${result}"`);
//     return result;
//   };

//   // Helper function to apply text styling
//   const applyTextStyle = (textObj, elementType = 'p') => {
//     if (!textObj || !textObj.text) return '';
    
//     // Use EXACT styling from data - use font size exactly as provided
//     const color = rgbToCss(textObj.color);
//     const fontSize = textObj.fontSize ? `${textObj.fontSize}px` : `${elementType === 'h2' ? 18 : 12}px`;
//     const fontWeight = textObj.isBold ? 'bold' : 'normal';
//     const fontStyle = textObj.isItalic ? 'italic' : 'normal';
//     const textDecoration = textObj.isUnderline ? 'underline' : 'none';
    
//     // Use EXACT font name from data (without quotes to match @font-face)
//     const cleanFontName = textObj.fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//     const fontFamily = cleanFontName; // No quotes to match @font-face declaration
    
//     // Use EXACT alignment from data
//     let textAlign = textObj.alignment || 'center';
//     if (textObj.isLeftAligned) textAlign = 'left';
//     else if (textObj.isRightAligned) textAlign = 'right';
//     else if (textObj.isCenterAligned) textAlign = 'center';
    
//     console.log('Applying EXACT text style from data:', {
//       originalFont: textObj.fontName,
//       finalFontFamily: fontFamily,
//       fontSize,
//       fontWeight,
//       fontStyle,
//       color,
//       textAlign,
//       isBold: textObj.isBold,
//       isItalic: textObj.isItalic,
//       isUnderline: textObj.isUnderline
//     });
    
//     const style = `color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; text-align: ${textAlign}; font-family: ${fontFamily}; margin: 0 0 3mm; padding: 0; line-height: 1.3;`;
    
//     console.log(`Final CSS style: ${style}`);
    
//     return `<${elementType} style="${style}">${textObj.text}</${elementType}>`;
//   };

//   const makeCardHTML = (c) => `
//   <div class="card">
//     ${(c.heading || c.para1 || c.para2) ? `
//       <div class="overlay-text">
//         <div class="overlay-inner">
//           ${c.heading ? applyTextStyle(c.heading, 'h2') : ''}
//           ${c.para1 ? applyTextStyle(c.para1, 'p') : ''}
//           ${c.para2 ? applyTextStyle(c.para2, 'p') : ''}
//         </div>
//       </div>` : ''}
//     ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ''}
//   </div>
// `;

//   // pages banani hain manually: sirf front aur back
//   const pages = [
//     `<section class="page">
//       ${makeCardHTML(front)}
//       <div></div>
//    </section>`,
//     `<section class="page">
//       <div></div>
//       ${makeCardHTML(back)}
//    </section>`
//   ];

//   // Write document
//   winRef.document.write(
//     `<html><head><title>${docTitle}</title>${styles}</head><body>${pages.join('')}</body></html>`
//   );
//   winRef.document.close();
  
//   // Load fonts using FontFace API as backup
//   const loadFontsWithFontFaceAPI = async () => {
//     if (!winRef.document.fonts) return;
    
//     console.log('Loading fonts with FontFace API...');
//     const fontPromises = [];
    
//     fontNames.forEach(fontName => {
//       const fontFile = mapFontNameToFile(fontName);
//       if (fontFile) {
//         const cleanFontName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//         console.log(`Loading font: ${cleanFontName} from ${fontFile}`);
        
//         // Try multiple font paths
//         const fontPaths = [
//           `/font/${fontFile}`,
//           `./font/${fontFile}`,
//           `${winRef.location.origin}/font/${fontFile}`
//         ];
        
//         const fontFace = new winRef.FontFace(
//           cleanFontName,
//           `url('${fontPaths[0]}')`
//         );
        
//         fontPromises.push(
//           fontFace.load().then(() => {
//             winRef.document.fonts.add(fontFace);
//             console.log(`Font ${cleanFontName} loaded successfully with FontFace API`);
            
//             // Verify font is actually available
//             const isAvailable = winRef.document.fonts.check(`16px "${cleanFontName}"`);
//             console.log(`Font ${cleanFontName} availability check:`, isAvailable);
            
//             // Additional verification - test with different sizes
//             const testSizes = ['12px', '16px', '24px', '37px'];
//             testSizes.forEach(size => {
//               const check = winRef.document.fonts.check(`${size} "${cleanFontName}"`);
//               console.log(`Font ${cleanFontName} at ${size}:`, check);
//             });
//           }).catch(async (err) => {
//             console.error(`Failed to load font ${cleanFontName} with FontFace API:`, err);
            
//             // Try loading as data URL as fallback
//             try {
//               console.log(`Trying to load ${cleanFontName} as data URL...`);
//               const response = await fetch(fontPaths[0]);
//               const fontBuffer = await response.arrayBuffer();
//               const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontBuffer)));
//               const dataUrl = `data:font/truetype;charset=utf-8;base64,${fontBase64}`;
              
//               const dataFontFace = new winRef.FontFace(cleanFontName, dataUrl);
//               await dataFontFace.load();
//               winRef.document.fonts.add(dataFontFace);
//               console.log(`Font ${cleanFontName} loaded successfully as data URL`);
//             } catch (dataErr) {
//               console.error(`Failed to load font ${cleanFontName} as data URL:`, dataErr);
//             }
//           })
//         );
//       }
//     });
    
//     try {
//       await Promise.all(fontPromises);
//       console.log('All fonts loaded with FontFace API');
//     } catch (error) {
//       console.error('Error loading fonts:', error);
//     }
//   };
  
//   // Test font file accessibility
//   const testFontAccessibility = async () => {
//     for (const fontName of fontNames) {
//       const fontFile = mapFontNameToFile(fontName);
//       if (fontFile) {
//         const testUrl = `/font/${fontFile}`;
//         console.log(`Testing font accessibility: ${testUrl}`);
        
//         try {
//           const response = await fetch(testUrl, { method: 'HEAD' });
//           console.log(`Font file ${fontFile} accessible:`, response.ok);
//           if (!response.ok) {
//             console.error(`Font file ${fontFile} not accessible:`, response.status, response.statusText);
//           }
//         } catch (error) {
//           console.error(`Error testing font accessibility for ${fontFile}:`, error);
//         }
//       }
//     }
//   };
  
//   testFontAccessibility();
  
//   // Test direct font loading
//   const testDirectFontLoading = async () => {
//     for (const fontName of fontNames) {
//       const fontFile = mapFontNameToFile(fontName);
//       if (fontFile) {
//         const cleanFontName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//         const fontUrl = `/font/${fontFile}`;
        
//         console.log(`Testing direct font loading: ${cleanFontName} from ${fontUrl}`);
        
//         try {
//           // Create a test element with the font
//           const testElement = winRef.document.createElement('div');
//           testElement.style.fontFamily = `"${cleanFontName}", Arial, sans-serif`;
//           testElement.style.fontSize = '16px';
//           testElement.style.position = 'absolute';
//           testElement.style.left = '-9999px';
//           testElement.textContent = 'Test Font';
//           winRef.document.body.appendChild(testElement);
          
//           // Force font loading
//           await winRef.document.fonts.load(`16px "${cleanFontName}"`);
          
//           // Check if font is actually loaded
//           const isLoaded = winRef.document.fonts.check(`16px "${cleanFontName}"`);
//           console.log(`Font "${cleanFontName}" loaded:`, isLoaded);
          
//           // Clean up test element
//           winRef.document.body.removeChild(testElement);
          
//         } catch (error) {
//           console.error(`Error testing direct font loading for ${cleanFontName}:`, error);
//         }
//       }
//     }
//   };
  
//   // Start loading fonts immediately
//   loadFontsWithFontFaceAPI();
  
//   // Test direct loading after a delay
//   setTimeout(testDirectFontLoading, 1000);

//   // QR load and font loading
//   const script = winRef.document.createElement('script');
//   script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
//   script.onload = () => {
//     const qrValue = `${AR_EXPERIENCE_LINK}/?templateId=${transaction?.cardCustomizationId?._id}`;
//     console.log("qrValue", qrValue)
//     const slot = winRef.document.getElementById('qr-slot');
    
//     // Generate QR code
//     if (slot && winRef.QRCode) {
//       const qr = new winRef.QRCode(slot, {
//         text: qrValue,
//         width: 100,
//         height: 100,
//         correctLevel: winRef.QRCode.CorrectLevel.M
//       });
//     }
    
//     // Wait for fonts to load before printing
//     const waitForFontsAndPrint = () => {
//       // Check if fonts are loaded
//       const checkFontsLoaded = () => {
//         const fontsToCheck = fontNames.map(name => {
//           const cleanName = name.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//           return cleanName;
//         });
        
//         console.log('Checking if fonts are loaded:', fontsToCheck);
        
//         let allLoaded = true;
//         fontsToCheck.forEach(fontName => {
//           const isLoaded = winRef.document.fonts.check(`16px "${fontName}"`);
//           console.log(`Font "${fontName}" loaded:`, isLoaded);
//           if (!isLoaded) allLoaded = false;
//         });
        
//         return allLoaded;
//       };
      
//       const tryPrint = () => {
//         console.log('Attempting to print...');
        
//         // Final font check before printing
//         fontNames.forEach(fontName => {
//           const cleanName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
//           const isLoaded = winRef.document.fonts.check(`16px "${cleanName}"`);
//           console.log(`Final check - Font "${cleanName}" loaded:`, isLoaded);
//         });
        
//         winRef.focus();
//         winRef.print();
//       };
      
//       // Try immediate check
//       if (checkFontsLoaded()) {
//         console.log('All fonts already loaded');
//         setTimeout(tryPrint, 500);
//         return;
//       }
      
//       // Wait for fonts to load
//       if (winRef.document.fonts && winRef.document.fonts.ready) {
//         winRef.document.fonts.ready.then(() => {
//           console.log('Fonts ready event fired');
//           if (checkFontsLoaded()) {
//             console.log('All fonts loaded successfully');
//             setTimeout(tryPrint, 500);
//           } else {
//             console.log('Some fonts still not loaded, printing anyway...');
//             setTimeout(tryPrint, 500);
//           }
//         }).catch(() => {
//           console.log('Font loading failed, printing anyway...');
//           setTimeout(tryPrint, 500);
//         });
//       } else {
//         // Fallback if document.fonts API not available
//         console.log('Font loading API not available, waiting and printing...');
//         setTimeout(tryPrint, 1500);
//       }
//     };
    
//     waitForFontsAndPrint();
//   };
//   script.onerror = () => { 
//     // If QR script fails, still try to print
//     if (winRef.document.fonts && winRef.document.fonts.ready) {
//       winRef.document.fonts.ready.then(() => {
//         setTimeout(() => { winRef.focus(); winRef.print(); }, 800);
//       });
//     } else {
//       setTimeout(() => { winRef.focus(); winRef.print(); }, 1200);
//     }
//   };
//   winRef.document.head.appendChild(script);

//   winRef.onafterprint = () => { try { winRef.close(); } catch {} };
// };
// const handlePrintClick = (transaction) => {
//   try {
//     setPrinting(true);

//     const html = buildPrintHTML_SameStyle(transaction); // must RETURN string
//     const blob = new Blob([html], { type: 'text/html' });
//     const url  = URL.createObjectURL(blob);
//     window.open(url, '_blank', 'noopener');

//   } catch (e) {
//     console.error(e);
//     toast.error('Could not open print preview.');
//   } finally {
//     setTimeout(() => setPrinting(false), 300);
//   }
// };


// function cloneForPrint(rootEl) {
//   const clone = rootEl.cloneNode(true);

//   // Replace any <canvas> (e.g., QR) with an <img> so the drawing survives
//   const canvases = clone.querySelectorAll('canvas');
//   canvases.forEach((c) => {
//     try {
//       const img = document.createElement('img');
//       img.src = c.toDataURL('image/png');
//       img.width = c.width;
//       img.height = c.height;
//       c.replaceWith(img);
//     } catch (_) {}
//   });

//   return clone;
// }

// --- 2) Core: copy current page styles + your Transaction DOM and print ---
// function printTransactionDOM(selectorOrEl, { pageCSS = '' } = {}) {
//   const srcDoc = document;
//   const el = typeof selectorOrEl === 'string'
//     ? srcDoc.querySelector(selectorOrEl)
//     : selectorOrEl;

//   if (!el) {
//     console.error('printTransactionDOM: element not found');
//     return;
//   }

//   // Open same-origin tab (user-initiated)
//   const win = window.open('', '_blank');
//   if (!win) {
//     console.error('Popup blocked. Allow popups for this site.');
//     return;
//   }

//   // Gather all styles from the current document (Next.js/CRA injects <style> tags)
//   const headStyles = Array.from(srcDoc.querySelectorAll('style, link[rel="stylesheet"]'))
//     .map((n) => n.outerHTML)
//     .join('\n');

//   // Absolute base so relative /font/*.ttf and images resolve correctly
//   const baseTag = `<base href="${location.origin}/">`;

//   // Page setup (A5 landscape, margins) – you can keep your exact sizes here
//   const defaultPageCSS = `
//     @page { size: A5 landscape; margin: 10mm; }
//     html, body { margin: 0; padding: 0; }
//   `;

//   const cloned = cloneForPrint(el);

//   const html = `
// <!doctype html>
// <html>
// <head>
// <meta charset="utf-8">
// ${baseTag}
// ${headStyles}
// <style>${defaultPageCSS}${pageCSS || ''}</style>
// </head>
// <body>
// ${cloned.outerHTML}
// <script>
//   // Detach opener so main site stays responsive (equivalent to noopener AFTER load)
//   try { window.opener = null; } catch (e) {}

//   (async function () {
//     try {
//       if (document.fonts && document.fonts.ready) {
//         await document.fonts.ready;
//       }
//     } catch (e) {}
//     setTimeout(function () {
//       try { window.focus(); window.print(); } catch (e) {}
//     }, 300);
//   })();

//   window.onafterprint = function () {
//     try { window.close(); } catch (e) {}
//   };
// </script>
// </body>
// </html>`.trim();

//   // Write and finish
//   win.document.open();
//   win.document.write(html);
//   win.document.close();
// }


// function handlePrintClick() {
//   // Make sure #transaction-print contains the same DOM your "Transactions" renders
//   printTransactionDOM('#transaction-print');
// }



// function handlePrintClick(transaction) {
//   try {
//     setPrinting(true);

//     const html = buildPrintHTML_FromTransaction(transaction); // 👆 same styling
//     const w = window.open('', '_blank');                      // same-origin
//     if (!w) { toast.error('Please allow popups.'); return; }

//     w.document.open();
//     w.document.write(html); // child will detach opener by itself
//     w.document.close();

//   } catch (e) {
//     console.error(e);
//     toast.error('Could not open print preview.');
//   } finally {
//     setTimeout(() => setPrinting(false), 300);
//   }
// }

// function handlePrintExistingDOM() {
//   printTransactionDOM('#card'); // not '#transaction-print'
// }




// function cloneForPrint(rootEl) {
//   const clone = rootEl.cloneNode(true);

//   // Convert any canvases (e.g., QR) to images so they print correctly
//   const canvases = clone.querySelectorAll('canvas');
//   canvases.forEach((c) => {
//     try {
//       const img = document.createElement('img');
//       img.src = c.toDataURL('image/png');
//       img.width = c.width;
//       img.height = c.height;
//       c.replaceWith(img);
//     } catch (_) {}
//   });

//   return clone;
// }

// function printTransactionDOM(selectorOrEl, { pageCSS = '' } = {}) {
//   const srcDoc = document;
//   const el = typeof selectorOrEl === 'string'
//     ? srcDoc.querySelector(selectorOrEl)
//     : selectorOrEl;

//   if (!el) {
//     console.error('printTransactionDOM: element not found');
//     return;
//   }

//   const win = window.open('', '_blank');      // same-origin
//   if (!win) { console.error('Popup blocked'); return; }

//   // copy all current styles (MUI/Next injects many <style> tags)
//   const headStyles = Array.from(srcDoc.querySelectorAll('style, link[rel="stylesheet"]'))
//     .map((n) => n.outerHTML)
//     .join('\n');

//   const baseTag = `<base href="${location.origin}/">`; // so /font/*.ttf and images resolve

//   const defaultPageCSS = `
//     @page { size: A5 landscape; margin: 10mm; }
//     html, body { margin: 0; padding: 0; }
//   `;

//   const cloned = cloneForPrint(el);

//   const html = `
// <!doctype html>
// <html>
// <head>
// <meta charset="utf-8">
// ${baseTag}
// ${headStyles}
// <style>${defaultPageCSS}${pageCSS || ''}</style>
// </head>
// <body>
// ${cloned.outerHTML}
// <script>
//   try { window.opener = null; } catch (e) {} // detach (acts like noopener AFTER load)

//   (async function () {
//     try { if (document.fonts && document.fonts.ready) { await document.fonts.ready; } } catch (e) {}
//     setTimeout(function () { try { window.focus(); window.print(); } catch (e) {} }, 300);
//   })();

//   window.onafterprint = function () { try { window.close(); } catch (e) {} };
// </script>
// </body>
// </html>`.trim();

//   win.document.open();
//   win.document.write(html);
//   win.document.close();
// }



// // click handler
// function handlePrintClick() {
//   if (!printRef.current) return console.error('print root missing');
//   printTransactionDOM(printRef.current);
// }



// const Transactions = (transaction) => {
//   const docTitle = `Incardible-${transaction?.title}`;
//   const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);

//   // same structure you already have
//   const arTemplateData = transaction?.cardCustomizationId?.arTemplateData;
//   const front = {
//     src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
//     heading: arTemplateData?.mainHeading,
//     para1: arTemplateData?.paragraph1,
//     para2: arTemplateData?.paragraph2
//   };
//   const back = {
//     src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign),
//     qr: true
//   };

//   const PAGE_MARGIN_MM = 10;
//   const GAP_MM = 6;
//   const CONTENT_W = 210 - PAGE_MARGIN_MM * 2;
//   const CONTENT_H = 148 - PAGE_MARGIN_MM * 2;
//   const COL_W = (CONTENT_W - GAP_MM) / 2;

//   // font + style logic SAME as your code (no change)
//   // ↓↓↓
//   const extractFontNames = () => {
//     const fonts = new Set();
//     if (arTemplateData?.mainHeading?.fontName)
//       fonts.add(arTemplateData.mainHeading.fontName);
//     if (arTemplateData?.paragraph1?.fontName)
//       fonts.add(arTemplateData.paragraph1.fontName);
//     if (arTemplateData?.paragraph2?.fontName)
//       fonts.add(arTemplateData.paragraph2.fontName);
//     return Array.from(fonts);
//   };

//   const fontNames = extractFontNames();
//   const mapFontNameToFile = (fontName) => {
//     if (!fontName) return '';
//     const fontFileMap = {
//       'AlanSans-VariableFont_wght SDF': 'AlanSans-VariableFont_wght SDF.ttf',
//       'ALBA SDF': 'ALBA SDF.TTF',
//       'AlexBrush-Regular SDF': 'AlexBrush-Regular SDF.ttf',
//       'AmaticSC-Regular SDF': 'AmaticSC-Regular SDF.ttf',
//       'Anak Paud SDF': 'Anak Paud SDF.otf',
//       'Antaresia SDF': 'Antaresia SDF.otf',
//       'Anton-Regular SDF': 'Anton-Regular SDF.ttf',
//       'Apple Chancery SDF': 'Apple Chancery SDF.ttf',
//       'Aquatype SDF': 'Aquatype SDF.ttf',
//       'ARCADECLASSIC SDF': 'ARCADECLASSIC SDF.TTF',
//       'Arimo-VariableFont_wght SDF': 'Arimo-VariableFont_wght SDF.ttf',
//       'Autumn in November SDF': 'Autumn in November SDF.ttf',
//       'BareMarker-Light SDF': 'BareMarker-Light SDF.ttf',
//       'blackjack SDF': 'blackjack SDF.TTF',
//       'Canterbury SDF': 'Canterbury SDF.ttf',
//       'Carnevalee Freakshow SDF': 'Carnevalee Freakshow SDF.ttf',
//       'CHLORINR SDF': 'chlorine.TTF',
//       'DancingScript-VariableFont_wght SDF': 'DancingScript-VariableFont_wght SDF.ttf',
//       'Darhouty Frederics SDF': 'Darhouty Frederics SDF.otf',
//       'Emigrate SDF': 'Emigrate SDF.otf',
//       'Facon SDF': 'Facon SDF.ttf',
//       'Fakeblood SDF': 'Fakeblood SDF.otf',
//       'FFF_Tusj SDF': 'FFF-Tusj SDF.ttf',
//       'GrandHotel-Regular SDF': 'GrandHotel-Regular SDF.ttf',
//       'GreatVibes-Regular SDF': 'GreatVibes-Regular SDF.ttf',
//       'Hanged Letters SDF': 'Hanged Letters SDF.ttf',
//       'Happy Birthday SDF': 'happy birthday.ttf',
//       'Howdy Koala SDF': 'Howdy Koala SDF.ttf',
//       'Inter-Regular SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
//       'Inter-VariableFont_opsz,wght SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
//       'KaushanScript-Regular SDF': 'KaushanScript-Regular SDF.ttf',
//       'KingRimba SDF': 'KingRimba SDF.ttf',
//       'Lato-Regular SDF': 'Lato-Regular SDF.ttf',
//       'Lobster_1 SDF': 'Lobster_1.ttf',
//       'MAXIGO SDF': 'MAXIGO SDF.otf',
//       'Mitchell Demo SDF': 'Mitchell Demo.otf',
//       'Montserrat-VariableFont_wght SDF': 'Montserrat-Italic-VariableFont_wght SDF.ttf',
//       'Morally Serif SDF': 'Morally Serif.otf',
//       'NotoSans-VariableFont_wdth,wght SDF': 'NotoSans-VariableFont_wdth,wght.ttf',
//       'OpenSans-VariableFont_wdth,wght SDF': 'OpenSans-VariableFont_wdth,wght SDF.ttf',
//       'Pacifico SDF': 'Pacifico SDF.ttf',
//       'ParryHotter SDF': 'ParryHotter SDF.ttf',
//       'Poppins-Regular SDF': 'Poppins-Regular SDF.ttf',
//       'Pricedown Bl SDF': 'Pricedown Bl SDF.otf',
//       'Raleway-VariableFont_wght SDF': 'Raleway-VariableFont_wght SDF.ttf',
//       'Roboto-VariableFont_wdth,wght SDF': 'Roboto-VariableFont_wdth,wght SDF.ttf',
//       'Sawone SDF': 'Sawone SDF.ttf',
//       'Sofia-Regular SDF': 'Sofia-Regular SDF.ttf',
//       'Super Adorable SDF': 'Super Adorable SDF.ttf',
//       'waltograph42 SDF': 'waltograph42 SDF.otf',
//       'Way Come SDF': 'Way Come SDF.ttf',
//       'YoungMorin-Regular SDF': 'YoungMorin-Regular SDF.ttf',
//       'Zombie_Holocaust SDF': 'Zombie_Holocaust SDF.ttf'
//     };
//     return fontFileMap[fontName] || null;
//   };

//   const generateLocalFontFaces = () => {
//     const fontFaces = [];
//     [...new Set(fontNames)].forEach((fontName) => {
//       const fontFile = mapFontNameToFile(fontName);
//       if (fontFile) {
//         const clean = fontName
//           .replace(/ SDF$/i, '')
//           .replace(/-VariableFont_.+$/i, '')
//           .replace(/-Regular$/i, '');
//         const format = fontFile.endsWith('.otf') ? 'opentype' : 'truetype';
//         fontFaces.push(`
//           @font-face {
//             font-family: '${clean}';
//             src: url('/font/${fontFile}') format('${format}');
//             font-weight: normal;
//             font-style: normal;
//             font-display: block;
//           }`);
//       }
//     });
//     return fontFaces.join('\n');
//   };

//   const localFontFaces = generateLocalFontFaces();

//   const styles = `
// <style>
//   @page { size: A5 landscape; margin: ${PAGE_MARGIN_MM}mm; }
//   ${localFontFaces}
//   * { box-sizing: border-box; }
//   html, body { margin:0; padding:0; font-family: Calibri, Arial, sans-serif; }
//   .page {
//     width:${CONTENT_W}mm; height:${CONTENT_H}mm;
//     display:grid; grid-template-columns:${COL_W}mm ${COL_W}mm; gap:${GAP_MM}mm;
//     align-items:center; justify-items:center;
//     break-inside:avoid; page-break-after:always;
//   }
//   .page:last-child { page-break-after:auto; }
//   .card {
//     position: relative; height: calc(100% - 2mm);
//     aspect-ratio:1 / 1.4142; width:auto;
//     background:#fff; overflow:hidden; break-inside:avoid;
//   }
//   .overlay-text { position:absolute; inset:8%; display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none; max-width:84%; max-height:84%; }
//   .overlay-inner{ width:100%; max-width:100%; max-height:100%; overflow:hidden; line-height:1.25; }
//   .overlay-inner h2,.overlay-inner p{ margin:0 0 3mm; word-wrap:break-word; }
//   .qr{ position:absolute; bottom:7%; left:50%; transform:translateX(-50%); display:flex; z-index:3;}
//   .qr>img,.qr>canvas,.qr>svg{ width:10mm; height:10mm;}
// </style>`;

//   const rgbToCss = (colorObj) => {
//     if (!colorObj || typeof colorObj.r === 'undefined') return 'black';
//     const r = Math.round(colorObj.r * 255);
//     const g = Math.round(colorObj.g * 255);
//     const b = Math.round(colorObj.b * 255);
//     return `rgb(${r}, ${g}, ${b})`;
//   };

//   const applyTextStyle = (textObj, tag = 'p') => {
//     if (!textObj || !textObj.text) return '';
//     const color = rgbToCss(textObj.color);
//     const fontSize = textObj.fontSize
//       ? `${textObj.fontSize}px`
//       : `${tag === 'h2' ? 18 : 12}px`;
//     const fontWeight = textObj.isBold ? 'bold' : 'normal';
//     const fontStyle = textObj.isItalic ? 'italic' : 'normal';
//     const textDecoration = textObj.isUnderline ? 'underline' : 'none';
//     const cleanFontName = textObj.fontName
//       .replace(/ SDF$/i, '')
//       .replace(/-VariableFont_.+$/i, '')
//       .replace(/-Regular$/i, '');
//     let textAlign = textObj.alignment || 'center';
//     if (textObj.isLeftAligned) textAlign = 'left';
//     else if (textObj.isRightAligned) textAlign = 'right';
//     else if (textObj.isCenterAligned) textAlign = 'center';
//     const style = `color:${color};font-size:${fontSize};font-weight:${fontWeight};font-style:${fontStyle};text-decoration:${textDecoration};text-align:${textAlign};font-family:${cleanFontName};margin:0 0 3mm;padding:0;line-height:1.3;`;
//     return `<${tag} style="${style}">${textObj.text}</${tag}>`;
//   };

//   const makeCardHTML = (c) => `
//   <div class="card">
//     ${
//       c.heading || c.para1 || c.para2
//         ? `<div class="overlay-text"><div class="overlay-inner">${
//             c.heading ? applyTextStyle(c.heading, 'h2') : ''
//           }${c.para1 ? applyTextStyle(c.para1, 'p') : ''}${
//             c.para2 ? applyTextStyle(c.para2, 'p') : ''
//           }</div></div>`
//         : ''
//     }
//     ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ''}
//   </div>`;

//   const pages = [
//     `<section class="page">${makeCardHTML(front)}<div></div></section>`,
//     `<section class="page"><div></div>${makeCardHTML(back)}</section>`,
//   ];

//   // inline QR + print script (same logic)
//   const script = `
// <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
// <script>
//   const qrValue = '${AR_EXPERIENCE_LINK}/?templateId=${transaction?.cardCustomizationId?._id}';
//   window.addEventListener('load', () => {
//     const slot = document.getElementById('qr-slot');
//     if (slot && window.QRCode) {
//       new QRCode(slot, { text: qrValue, width: 100, height: 100, correctLevel: QRCode.CorrectLevel.M });
//     }
//     setTimeout(() => { window.print(); }, 800);
//   });
// </script>`;

//   // return the full HTML content for Blob
//   return `
//   <!DOCTYPE html>
//   <html>
//     <head><meta charset="utf-8"><title>${docTitle}</title>${styles}</head>
//     <body>${pages.join('')}${script}</body>
//   </html>`;
// };

// // ✅ Main print handler (non-blocking new tab)
// const handlePrintClick = (transaction) => {
//   try {
//     setPrinting(true);
//     const html = Transactions(transaction);
//     const blob = new Blob([html], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     window.open(url, '_blank', 'noopener');
//   } catch (e) {
//     console.error(e);
//     toast.error('Could not open print preview.');
//   } finally {
//     setTimeout(() => setPrinting(false), 300);
//   }
// };




// version 3 previous
  const buildPrintHTML = (transaction, iframeDoc) => {
    const docTitle = `Incardible-${transaction?.title}`;
    const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);

    // sirf front aur back lena hai
    const arTemplateData = transaction?.cardCustomizationId?.arTemplateData;
    
    // Log fontWeight, width, and height for mainHeading and paragraph1
    console.log('=== PDF Generation Data Check ===');
    console.log('mainHeading data:', arTemplateData?.mainHeading);
    console.log('mainHeading fontWeight:', arTemplateData?.mainHeading?.fontWeight);
    console.log('mainHeading width:', arTemplateData?.mainHeading?.width);
    console.log('mainHeading height:', arTemplateData?.mainHeading?.height);
    console.log('paragraph1 data:', arTemplateData?.paragraph1);
    console.log('paragraph1 fontWeight:', arTemplateData?.paragraph1?.fontWeight);
    console.log('paragraph1 width:', arTemplateData?.paragraph1?.width);
    console.log('paragraph1 height:', arTemplateData?.paragraph1?.height);
    console.log('================================');
    
    const front = {
      src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
      heading: arTemplateData?.mainHeading,
      para1: arTemplateData?.paragraph1,
      para2: arTemplateData?.paragraph2
    };
    const back = {
      src: makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign),
      qr: true
    };

    const PAGE_MARGIN_MM = 10;
    const GAP_MM = 6;
    const CONTENT_W = 210 - PAGE_MARGIN_MM * 2;
    const CONTENT_H = 148 - PAGE_MARGIN_MM * 2;
    const COL_W = (CONTENT_W - GAP_MM) / 2;

    // Extract unique font names from the data
    const extractFontNames = () => {
      const fonts = new Set();
      if (arTemplateData?.mainHeading?.fontName) {
        fonts.add(arTemplateData.mainHeading.fontName);
      }
      if (arTemplateData?.paragraph1?.fontName) {
        fonts.add(arTemplateData.paragraph1.fontName);
      }
      if (arTemplateData?.paragraph2?.fontName) {
        fonts.add(arTemplateData.paragraph2.fontName);
      }
      return Array.from(fonts);
    };

    const fontNames = extractFontNames();
    console.log('Fonts to load:', fontNames);

    // Map Unity font names to local font file names (exact match)
    const mapFontNameToFile = (fontName) => {
      if (!fontName) return '';
      
      console.log(`Mapping font: "${fontName}"`);
      
      // Create exact mapping from Unity font names to actual file names
      const fontFileMap = {
        'AlanSans-VariableFont_wght SDF': 'AlanSans-VariableFont_wght SDF.ttf',
        'ALBA SDF': 'ALBA SDF.TTF',
        'AlexBrush-Regular SDF': 'AlexBrush-Regular SDF.ttf',
        'AmaticSC-Regular SDF': 'AmaticSC-Regular SDF.ttf',
        'Anak Paud SDF': 'Anak Paud SDF.otf',
        'Antaresia SDF': 'Antaresia SDF.otf',
        'Anton-Regular SDF': 'Anton-Regular SDF.ttf',
        'Apple Chancery SDF': 'Apple Chancery SDF.ttf',
        'Aquatype SDF': 'Aquatype SDF.ttf',
        'ARCADECLASSIC SDF': 'ARCADECLASSIC SDF.TTF',
        'Arimo-VariableFont_wght SDF': 'Arimo-VariableFont_wght SDF.ttf',
        'Autumn in November SDF': 'Autumn in November SDF.ttf',
        'BareMarker-Light SDF': 'BareMarker-Light SDF.ttf',
        'blackjack SDF': 'blackjack SDF.TTF',
        'Canterbury SDF': 'Canterbury SDF.ttf',
        'Carnevalee Freakshow SDF': 'Carnevalee Freakshow SDF.ttf',
        'CHLORINR SDF': 'chlorine.TTF',
        'DancingScript-VariableFont_wght SDF': 'DancingScript-VariableFont_wght SDF.ttf',
        'Darhouty Frederics SDF': 'Darhouty Frederics SDF.otf',
        'Emigrate SDF': 'Emigrate SDF.otf',
        'Facon SDF': 'Facon SDF.ttf',
        'Fakeblood SDF': 'Fakeblood SDF.otf',
        'FFF_Tusj SDF': 'FFF-Tusj SDF.ttf',
        'GrandHotel-Regular SDF': 'GrandHotel-Regular SDF.ttf',
        'GreatVibes-Regular SDF': 'GreatVibes-Regular SDF.ttf',
        'Hanged Letters SDF': 'Hanged Letters SDF.ttf',
        'Happy Birthday SDF': 'happy birthday.ttf',
        'Howdy Koala SDF': 'Howdy Koala SDF.ttf',
        'Inter-Regular SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
        'Inter-VariableFont_opsz,wght SDF': 'Inter-VariableFont_opsz,wght SDF.ttf',
        'KaushanScript-Regular SDF': 'KaushanScript-Regular SDF.ttf',
        'KingRimba SDF': 'KingRimba SDF.ttf',
        'Lato-Regular SDF': 'Lato-Regular SDF.ttf',
        'Lobster_1 SDF': 'Lobster_1.ttf',
        'MAXIGO SDF': 'MAXIGO SDF.otf',
        'Mitchell Demo SDF': 'Mitchell Demo.otf',
        'Montserrat-VariableFont_wght SDF': 'Montserrat-Italic-VariableFont_wght SDF.ttf',
        'Morally Serif SDF': 'Morally Serif.otf',
        'NotoSans-VariableFont_wdth,wght SDF': 'NotoSans-VariableFont_wdth,wght.ttf',
        'OpenSans-VariableFont_wdth,wght SDF': 'OpenSans-VariableFont_wdth,wght SDF.ttf',
        'Pacifico SDF': 'Pacifico SDF.ttf',
        'ParryHotter SDF': 'ParryHotter SDF.ttf',
        'Poppins-Regular SDF': 'Poppins-Regular SDF.ttf',
        'Pricedown Bl SDF': 'Pricedown Bl SDF.otf',
        'Raleway-VariableFont_wght SDF': 'Raleway-VariableFont_wght SDF.ttf',
        'Roboto-VariableFont_wdth,wght SDF': 'Roboto-VariableFont_wdth,wght SDF.ttf',
        'Sawone SDF': 'Sawone SDF.ttf',
        'Sofia-Regular SDF': 'Sofia-Regular SDF.ttf',
        'Super Adorable SDF': 'Super Adorable SDF.ttf',
        'waltograph42 SDF': 'waltograph42 SDF.otf',
        'Way Come SDF': 'Way Come SDF.ttf',
        'YoungMorin-Regular SDF': 'YoungMorin-Regular SDF.ttf',
        'Zombie_Holocaust SDF': 'Zombie_Holocaust SDF.ttf'
      };
      
      const result = fontFileMap[fontName] || null;
      console.log(`Font file result for "${fontName}": "${result}"`);
      return result;
    };

    // Generate @font-face declarations for local fonts
    const generateLocalFontFaces = () => {
      const fontFaces = [];
      const uniqueFonts = [...new Set(fontNames)];
      
      uniqueFonts.forEach(fontName => {
        const fontFile = mapFontNameToFile(fontName);
        console.log(`Font mapping: "${fontName}" -> "${fontFile}"`);
        if (fontFile) {
          const cleanFontName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
          console.log(`Clean font name: "${fontName}" -> "${cleanFontName}"`);
          
          // Determine font format based on file extension
          const format = fontFile.endsWith('.otf') ? 'opentype' : 'truetype';
          
          // Try multiple paths to ensure font loads
          const fontPaths = [
            `/font/${fontFile}`,
            `./font/${fontFile}`,
            `${window.location.origin}/font/${fontFile}`
          ];
          
          fontFaces.push(`
            @font-face {
              font-family: '${cleanFontName}';
              src: url('${fontPaths[0]}') format('${format}');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
          `);
        } else {
          console.log(`No font file found for: "${fontName}"`);
        }
      });
      
      return fontFaces.join('\n');
    };

    const localFontFaces = generateLocalFontFaces();
    console.log('Local font faces generated:', localFontFaces);

    const styles = `
<style>
  @page {
    size: A5 landscape;
    margin: ${PAGE_MARGIN_MM}mm;
  }
  @media print {
    @page {
      size: A5 landscape;
      margin: ${PAGE_MARGIN_MM}mm;
    }
  }
  
  ${localFontFaces}
  
  * { box-sizing: border-box; }
  html, body { 
    margin: 0; 
    padding: 0; 
    font-family: Calibri, Arial, sans-serif;
  }
  @media print {
    html, body {
      width: 210mm;
      height: 148mm;
    }
  }
  .page {
    width: ${CONTENT_W}mm;
    height: ${CONTENT_H}mm;
    display: grid;
    grid-template-columns: ${COL_W}mm ${COL_W}mm;
    gap: ${GAP_MM}mm;
    align-items: center;
    justify-items: center;
    break-inside: avoid;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  .card {
    position: relative;
    height: calc(100% - 2mm);
    aspect-ratio: 1 / 1.4142;
    width: auto;
    background: #fff;
    overflow: hidden;
    break-inside: avoid;
    /* TESTING: Border to verify card dimensions */
    border: 3px solid green;
  }

  .overlay-text{
    position: absolute;
    top: 15mm; /* Margin from top */
    left: 50%;
    transform: translateX(-50%); /* Keep horizontal centering */
    display: flex;
    flex-direction: column;
    z-index: 2;
    pointer-events: none;
  }
  .overlay-inner{
    display: flex;
    flex-direction: column;
    width: 264px;
    height: 354px; /* 81px (heading) + 273px (paragraph) */
    gap: 5mm; /* Added gap between heading and paragraph */
  }
  .overlay-inner h2 { 
    margin: 0; 
    overflow-wrap: break-word; 
    word-break: normal;
    hyphens: none;
    /* Width and height now set dynamically via inline styles from data */
    width: 264px; /* Fallback if not provided in data */
    height: 81px; /* Fallback if not provided in data */
    /* Font-weight will be set via inline styles from data - remove default bold */
    font-weight: normal; /* Default, will be overridden by inline style */
    display: flex;
    align-items: center;
    justify-content: center; /* Will be overridden by data alignment */
    overflow: hidden;
    padding: 5px;
    box-sizing: border-box;
    text-overflow: ellipsis;
    white-space: pre-wrap;
    /* TESTING: Border to verify width and height */
    border: 2px solid red;
  }
  .overlay-inner p { 
    margin: 0; 
    overflow-wrap: break-word; 
    word-break: normal;
    hyphens: none;
    /* Width and height now set dynamically via inline styles from data */
    width: 264px; /* Fallback if not provided in data */
    height: 273px; /* Fallback if not provided in data */
    display: flex;
    align-items: flex-start;
    justify-content: center; /* Will be overridden by data alignment */
    overflow: hidden;
    padding: 5px;
    box-sizing: border-box;
    white-space: pre-wrap;
    line-height: 1.2;
    text-align: center;
    /* TESTING: Border to verify width and height */
    border: 2px solid blue;
  }

  .qr {
    position: absolute;
    bottom: 7%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    z-index: 3;
  }
  .qr > img, .qr > canvas, .qr > svg {
    width: 10mm;
    height: 10mm;
  }
</style>`;

    // Helper function to convert color to CSS color
    // Uses EXACT hex value from data: {hex: "#7BCA69"} -> "#7BCA69"
    const rgbToCss = (colorObj) => {
      if (!colorObj) {
        console.log('Color conversion: No color object provided, using black');
        return 'black';
      }
      
      // Use hex value exactly as provided in data
      if (colorObj.hex) {
        const hexValue = colorObj.hex;
        console.log('Color conversion (using exact hex from data):', {
          colorObject: colorObj,
          hexFromData: hexValue,
          hexType: typeof hexValue,
          finalColorApplied: hexValue
        });
        return hexValue; // Use hex value directly, exactly as received
      }
      
      // Fallback if hex is not present
      console.log('Color conversion: Hex value not found in color object:', colorObj);
      return 'black';
    };

    // Helper function to apply text styling
    const applyTextStyle = (textObj, elementType = 'p') => {
      // For mainHeading (h2) and paragraph1 (p), render box even if no text
      // For other elements, return empty if no text
      const hasText = textObj && textObj.text;
      const shouldRenderEmptyBox = (elementType === 'h2' || elementType === 'p');
      
      if (!textObj) {
        // If textObj doesn't exist at all, only render empty box for h2/p
        if (shouldRenderEmptyBox) {
          const defaultWidth = elementType === 'h2' ? '264px' : '234px'; // 264 - 30 for paragraph1
          const defaultHeight = elementType === 'h2' ? '81px' : '273px';
          return `<${elementType} style="width: ${defaultWidth}; height: ${defaultHeight}; border: 1px dashed #ccc; box-sizing: border-box; margin: 0 auto; padding: 5px;"></${elementType}>`;
        }
        return '';
      }
      
      if (!hasText && !shouldRenderEmptyBox) {
        return '';
      }
      
      // Log complete data object to see all properties
      console.log('Complete textObj data:', JSON.stringify(textObj, null, 2));
      console.log('Element type:', elementType);
      
      // Use EXACT styling from data - only use actual values from data, no defaults
      const color = textObj.color ? rgbToCss(textObj.color) : 'black';
      const fontSize = textObj.fontSize != null ? `${textObj.fontSize}px` : null;
      // Use fontWeight directly from data (for both mainHeading and paragraph1) - use exact value as provided
      const fontWeight = textObj.fontWeight != null ? String(textObj.fontWeight) : null;
      
      console.log(`${elementType === 'h2' ? 'mainHeading' : 'paragraph'} fontWeight processing:`, {
        fontWeightFromData: textObj.fontWeight,
        fontWeightType: typeof textObj.fontWeight,
        fontWeightValue: fontWeight,
        fontWeightTypeAfter: typeof fontWeight
      });
      const fontStyle = textObj.isItalic ? 'italic' : 'normal';
      const textDecoration = textObj.isUnderline ? 'underline' : 'none';
      
      // Use dynamic width and height from data, or default values if not provided
      let width, height;
      
      if (elementType === 'h2') {
        // mainHeading defaults: 264px x 81px
        width = textObj.width != null ? `${textObj.width}px` : '264px';
        height = textObj.height != null ? `${textObj.height}px` : '81px';
      } else if (elementType === 'p') {
        // paragraph1 defaults: 264px x 273px
        // Subtract 30px from width for paragraph1
        if (textObj.width != null) {
          const originalWidth = textObj.width;
          const adjustedWidth = originalWidth - 30;
          width = `${adjustedWidth}px`;
        } else {
          width = '234px'; // 264 - 30
        }
        height = textObj.height != null ? `${textObj.height}px` : '273px';
      } else {
        // For other types, use data values or null
        width = textObj.width != null ? `${textObj.width}px` : null;
        height = textObj.height != null ? `${textObj.height}px` : null;
      }
      
      console.log(`${elementType === 'h2' ? 'mainHeading' : 'paragraph'} dimensions:`, {
        width: width,
        widthFromData: textObj.width,
        height: height,
        heightFromData: textObj.height,
        fontWeight: fontWeight,
        fontWeightFromData: textObj.fontWeight
      });
      
      // Use EXACT font name from data (without quotes to match @font-face)
      const cleanFontName = textObj.fontName ? textObj.fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '') : 'Arial';
      const fontFamily = cleanFontName; // No quotes to match @font-face declaration
      
      // Use EXACT alignment from data
      let textAlign = textObj.alignment || 'center';
      let justifyContent = 'center';
      if (textObj.isLeftAligned) {
        textAlign = 'left';
        justifyContent = 'flex-start';
      } else if (textObj.isRightAligned) {
        textAlign = 'right';
        justifyContent = 'flex-end';
      } else if (textObj.isCenterAligned) {
        textAlign = 'center';
        justifyContent = 'center';
      }
      
      console.log('Applying EXACT text style from data:', {
        elementType: elementType,
        originalFont: textObj.fontName,
        finalFontFamily: fontFamily,
        fontSize,
        fontWeight,
        fontWeightFromData: textObj.fontWeight,
        colorFromData: textObj.color,
        colorApplied: color,
        width,
        widthFromData: textObj.width,
        height,
        heightFromData: textObj.height,
        fontStyle,
        textAlign,
        justifyContent,
        isItalic: textObj.isItalic,
        isUnderline: textObj.isUnderline,
        alignment: textObj.alignment,
        isLeftAligned: textObj.isLeftAligned,
        isRightAligned: textObj.isRightAligned,
        isCenterAligned: textObj.isCenterAligned,
        allProperties: Object.keys(textObj)
      });
      
      // Build style string only with actual values from data
      const styleParts = [
        `color: ${color}`,
        fontSize != null ? `font-size: ${fontSize}` : null,
        fontWeight != null ? `font-weight: ${fontWeight}` : null,
        `font-style: ${fontStyle}`,
        `text-decoration: ${textDecoration}`,
        `text-align: ${textAlign}`,
        `font-family: ${fontFamily}`,
        width ? `width: ${width}` : null,
        height ? `height: ${height}` : null,
        elementType === 'p' ? `margin: 0 auto` : `margin: 0`, // Center paragraph horizontally
        `padding: 5px`,
        `box-sizing: border-box`,
        `line-height: 1.2`,
        `overflow-wrap: break-word`,
        `word-break: normal`,
        `white-space: normal`,
        `hyphens: none`,
        `display: block`,
        `overflow: hidden`,
        `text-overflow: ellipsis`,
        !hasText ? `border: 1px dashed #ccc` : null // Add border for empty boxes
      ].filter(part => part !== null); // Remove null values
      
      const style = styleParts.join('; ');
      
      // Use empty string if no text, but still render the box
      const textContent = textObj.text || '';
      
      // Explicit logging for fontWeight to debug h2 issue
      const htmlElement = `<${elementType} style="${style}">${textContent}</${elementType}>`;
      console.log(`${elementType === 'h2' ? 'mainHeading' : 'paragraph'} style check:`, {
        fontWeightValue: fontWeight,
        fontWeightType: typeof fontWeight,
        fontWeightInStyle: style.includes('font-weight'),
        fullStyle: style,
        htmlElement: htmlElement,
        hasFontWeightInHTML: htmlElement.includes('font-weight'),
        hasText: hasText,
        textContent: textContent
      });
      console.log(`Final CSS style: ${style}`);
      
      return htmlElement;
    };

    const makeCardHTML = (c) => `
    <div class="card">
      ${!c.qr ? `
      <div class="overlay-text">
        <div class="overlay-inner">
          ${applyTextStyle(c.heading, 'h2')}
          ${applyTextStyle(c.para1, 'p')}
          ${c.para2 ? applyTextStyle(c.para2, 'p') : ''}
        </div>
      </div>` : ''}
      ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ''}
    </div>
  `;

    // pages banani hain manually: sirf front aur back
    const pages = [
      `<section class="page">
        ${makeCardHTML(front)}
        <div></div>
     </section>`,
      `<section class="page">
        <div></div>
        ${makeCardHTML(back)}
     </section>`
    ];

    // Write document to iframe
    iframeDoc.open();
    iframeDoc.write(
      `<html><head><title>${docTitle}</title>${styles}</head><body>${pages.join('')}</body></html>`
    );
    iframeDoc.close();
    
    // Load fonts using FontFace API
    const loadFontsWithFontFaceAPI = async () => {
      if (!iframeDoc.fonts) return;
      
      console.log('Loading fonts with FontFace API...');
      const fontPromises = [];
      
      fontNames.forEach(fontName => {
        const fontFile = mapFontNameToFile(fontName);
        if (fontFile) {
          const cleanFontName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
          console.log(`Loading font: ${cleanFontName} from ${fontFile}`);
          
          const fontPath = `${window.location.origin}/font/${fontFile}`;
          
          const fontFace = new FontFace(
            cleanFontName,
            `url('${fontPath}')`
          );
          
          fontPromises.push(
            fontFace.load().then(() => {
              iframeDoc.fonts.add(fontFace);
              console.log(`Font ${cleanFontName} loaded successfully`);
            }).catch((err) => {
              console.error(`Failed to load font ${cleanFontName}:`, err);
            })
          );
        }
      });
      
      try {
        await Promise.all(fontPromises);
        console.log('All fonts loaded');
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };
    
    // Load fonts immediately
    loadFontsWithFontFaceAPI();

    // QR load and font loading
    const script = iframeDoc.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      const qrValue = `${AR_EXPERIENCE_LINK}/?templateId=${transaction?.cardCustomizationId?._id}`;
      console.log('==========================================');
      console.log('🔗 QR CODE LINK FOR PDF:');
      console.log('Template ID:', transaction?.cardCustomizationId?._id);
      console.log('AR Experience Link:', AR_EXPERIENCE_LINK);
      console.log('Complete QR URL:', qrValue);
      console.log('==========================================');
      const slot = iframeDoc.getElementById('qr-slot');
      
      // Generate QR code
      if (slot && iframeDoc.defaultView.QRCode) {
        const qr = new iframeDoc.defaultView.QRCode(slot, {
          text: qrValue,
          width: 140,
          height: 140,
          correctLevel: iframeDoc.defaultView.QRCode.CorrectLevel.M
        });
      }
      
      // Wait for fonts to load before printing
      const waitForFontsAndPrint = () => {
        const checkFontsLoaded = () => {
          const fontsToCheck = fontNames.map(name => {
            const cleanName = name.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
            return cleanName;
          });
          
          console.log('Checking if fonts are loaded:', fontsToCheck);
          
          let allLoaded = true;
          fontsToCheck.forEach(fontName => {
            const isLoaded = iframeDoc.fonts.check(`16px "${fontName}"`);
            console.log(`Font "${fontName}" loaded:`, isLoaded);
            if (!isLoaded) allLoaded = false;
          });
          
          return allLoaded;
        };
        
        const tryPrint = () => {
          console.log('Attempting to print from iframe...');
          console.log('📄 PDF will be generated at A5 landscape size (210mm × 148mm)');
          
          // Final font check before printing
          fontNames.forEach(fontName => {
            const cleanName = fontName.replace(/ SDF$/i, '').replace(/-VariableFont_.+$/i, '').replace(/-Regular$/i, '');
            const isLoaded = iframeDoc.fonts.check(`16px "${cleanName}"`);
            console.log(`Final check - Font "${cleanName}" loaded:`, isLoaded);
          });
          
          iframeDoc.defaultView.focus();
          iframeDoc.defaultView.print();
        };
        
        // Try immediate check
        if (checkFontsLoaded()) {
          console.log('All fonts already loaded');
          setTimeout(tryPrint, 500);
          return;
        }
        
        // Wait for fonts to load
        if (iframeDoc.fonts && iframeDoc.fonts.ready) {
          iframeDoc.fonts.ready.then(() => {
            console.log('Fonts ready event fired');
            setTimeout(tryPrint, 500);
          }).catch(() => {
            console.log('Font loading failed, printing anyway...');
            setTimeout(tryPrint, 500);
          });
        } else {
          console.log('Font loading API not available, waiting and printing...');
          setTimeout(tryPrint, 1500);
        }
      };
      
      waitForFontsAndPrint();
    };
    script.onerror = () => { 
      // If QR script fails, still try to print
      if (iframeDoc.fonts && iframeDoc.fonts.ready) {
        iframeDoc.fonts.ready.then(() => {
          setTimeout(() => { iframeDoc.defaultView.focus(); iframeDoc.defaultView.print(); }, 800);
        });
      } else {
        setTimeout(() => { iframeDoc.defaultView.focus(); iframeDoc.defaultView.print(); }, 1200);
      }
    };
    iframeDoc.head.appendChild(script);
  };

  const handlePrintClick = (transaction) => {
    try {
      setPrinting(true);

      const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);
      const urls = [
        makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
        makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign)
      ].filter(Boolean);

      const proceed = () => {
        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Build the print content in the iframe
        buildPrintHTML(transaction, iframeDoc);

        // Clean up iframe after printing
        const cleanupIframe = () => {
          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
              console.log('Iframe removed');
            } catch (e) {
              console.error('Error removing iframe:', e);
            }
          }, 1000);
        };

        // Listen for afterprint event to clean up
        if (iframe.contentWindow) {
          iframe.contentWindow.onafterprint = cleanupIframe;
          
          // Also add a fallback cleanup in case onafterprint doesn't fire
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              cleanupIframe();
            }
          }, 10000);
        }

        setPrinting(false);
      };

      if (urls.length === 0) { proceed(); return; }

      let loaded = 0;
      urls.forEach(src => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded += 1;
          if (loaded === urls.length) proceed();
        };
        img.src = src;
      });
    } catch (e) {
      console.error(e);
      setPrinting(false);
      toast.error('Failed to print. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Orders | Incardible</title>
      </Head>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto',
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <Container 
          maxWidth="xl"
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            py: 4,
            px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }
          }}
        >
          <Typography variant="h2" sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%'
          }}>Orders</Typography>
           <Paper sx={{ width: '100%', overflow: 'hidden' }}>

          {/* Filter Status Indicator */}
          {/* <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}> */}
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> */}
              {/* <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Showing {totalCount} of {transactions.length} orders
              </Typography> */}
              {/* {shippingFilter !== 'all' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: shippingFilter === 'shipped' ? '#22c55e' : '#f59e0b'
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    Filtered by: {shippingFilter === 'shipping' ? 'In Shipping' : shippingFilter}
                  </Typography>
                </Box>
              )} */}
            {/* </Box> */}
          {/* </Box> */}

<TableContainer
  component={Paper}
  sx={{
    width: '100%',
    maxWidth: '100%',
    mx: 'auto',
    display: 'block',
    overflowX: { xs: 'auto', sm: 'auto', md: 'auto', lg: 'hidden', xl: 'hidden' },
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { height: 6 },
    '&::-webkit-scrollbar-thumb': { borderRadius: 4 }
  }}
>

  <Table
    aria-label="transactions table"
    sx={{
      width: '100%',
      minWidth: { xs: 960, sm: 960, md: '100%' },
      tableLayout: { xs: 'auto', md: 'auto' }
    }}
  >

          {/* <TableContainer component={Paper} sx={{ 
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
        
            <Table aria-label="simple table" sx={{ width: '100%' }}> */}
              <TableHead>
                <TableRow sx={{ width: '100%' }}>
                  <TableCell colSpan={12} sx={{ width: '100%' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: {md:'flex-end', xs:'flex-start'},
                      flexDirection: { md: 'row', xs: 'row' },
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: 2
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
                          maxWidth: '350px',  // reduced max width to accommodate filter
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

                      {/* Shipping Status Filter in Table Header */}
                      <FormControl 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          minWidth: 150,
                          // borderRadius: 1,
                          height: '55px',
                          '& .MuiInputBase-root': {
                            height: '55px',
                            // backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2
                          },
                          '& .MuiInputBase-input': {
                            padding: '16px 12px',
                            color: 'rgba(71, 85, 105, 1)'
                          }
                        }}
                      >
                        <Select
                          value={shippingFilter}
                          onChange={(e) => setShippingFilter(e.target.value)}
                          displayEmpty
                          sx={{
                            '& .MuiSelect-select': {
                              color: 'rgba(71, 85, 105, 1)',
                              fontWeight: 500
                            }
                          }}
                        >
                          <MenuItem value="all">
                            <Typography sx={{ color: 'rgba(71, 85, 105, 1)', fontWeight: 500 }}>
                              All Orders
                            </Typography>
                          </MenuItem>
                          <MenuItem value="processing">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#6b7280'
                              }} />
                              <Typography sx={{ color: 'rgba(71, 85, 105, 1)', fontWeight: 500 }}>
                                Processing
                              </Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="shipping">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#f59e0b'
                              }} />
                              <Typography sx={{ color: 'rgba(71, 85, 105, 1)', fontWeight: 500 }}>
                                In Shipping
                              </Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="shipped">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#22c55e'
                              }} />
                              <Typography sx={{ color: 'rgba(71, 85, 105, 1)', fontWeight: 500 }}>
                                Shipped
                              </Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                    </Box>
                  </TableCell>

                </TableRow>
                <TableRow sx={{ justifyContent: 'space-between', alignItems: 'left' }}>
                  <TableCell >No</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Account</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Order Details</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Card Details</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Address</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Status</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Order Date</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingComplete ? (
                  <TableRow align="center">
                    <TableCell colSpan={9} align="center">
                      <CircularProgress/>
                    </TableCell>
                  </TableRow>
                ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((data, index) => {
                    const serialNumber = page * rowsPerPage + index + 1;
                    return (
                      <TableRow key={data._id}>
                        <TableCell component="th" scope="row" >
                          {serialNumber}
                        </TableCell>
                        <TableCell component="th" scope="row" >
                          {data?.cardCustomizationId?.userId?.firstName}
                          <br/>
                          {data?.cardCustomizationId?.userId?.email}
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ textAlign: 'left', minWidth: '130px' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Tooltip title="View Order Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenTransactionDetails(data)}
                                sx={{
                                  color: 'inherit',
                                  '&:hover': {
                                    backgroundColor: 'transparent'
                                  }
                                }}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Box sx={{ 
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              // color: '#e91e63'
                            }}>
                              #{data?.orderId || 'N/A'}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ textAlign: 'left', minWidth: '190px' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Tooltip title="View Card Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenCardDetails(data)}
                                sx={{
                                  color: 'inherit',
                                  '&:hover': {
                                    backgroundColor: 'transparent'
                                  }
                                }}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Box sx={{ 
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}>
                              {typeof data?.cardCustomizationId?.cardId?.title === 'object' 
                                ? data?.cardCustomizationId?.cardId?.title?.text || 'N/A'
                                : data?.cardCustomizationId?.cardId?.title || 'N/A'}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ textAlign: 'left', minWidth: '180px' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Tooltip title="View Address Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenAddressDetails(data)}
                                sx={{
                                  color: 'inherit',
                                  '&:hover': {
                                    backgroundColor: 'transparent'
                                  }
                                }}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Box sx={{ 
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}>
                              {data?.delivery_address}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell component="th" scope="row" sx={{ textAlign: 'left' }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={data?.shippingStatus || 'processing'}
                              onChange={(e) => handleShippingStatusChange(data, e.target.value)}
                              disabled={data?.shippingStatus === 'shipped'}
                              sx={{
                                '& .MuiSelect-select': {
                                  py: 1,
                                  px: 2,
                                  borderRadius: 1,
                                  backgroundColor: data?.shippingStatus === 'shipped' ? '#f0fdf4' : 
                                                 data?.shippingStatus === 'in_shipping' ? '#fef3c7' : '#f3f4f6',
                                  border: '1px solid',
                                  borderColor: data?.shippingStatus === 'shipped' ? '#22c55e' : 
                                             data?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                                  color: data?.shippingStatus === 'shipped' ? '#22c55e' : 
                                        data?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  border: 'none'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  border: 'none'
                                }
                              }}
                            >
                              <MenuItem value="processing">
                                <Typography sx={{ 
                                  color: '#6b7280',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                }}>
                                  Processing
                                </Typography>
                              </MenuItem>
                              <MenuItem value="in_shipping">
                                <Typography sx={{ 
                                  color: '#f59e0b',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                }}>
                                  In Shipping
                                </Typography>
                              </MenuItem>
                              <MenuItem 
                                value="shipped"
                                disabled={data?.shippingStatus === 'processing'}
                                sx={{
                                  opacity: data?.shippingStatus === 'processing' ? 0.5 : 1,
                                  cursor: data?.shippingStatus === 'processing' ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <Typography sx={{ 
                                  color: data?.shippingStatus === 'processing' ? '#9ca3af' : '#22c55e',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                }}>
                                  Shipped
                                  {/* {data?.shippingStatus === 'processing' && (
                                    <Typography component="span" sx={{ 
                                      fontSize: '0.75rem',
                                      color: '#9ca3af',
                                      ml: 1,
                                      fontStyle: 'italic'
                                    }}>
                                      (Mark as "In Shipping" first)
                                    </Typography>
                                  )} */}
                                </Typography>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {formatDateTime(data?.paid_at)}
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
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                        No orders found. Orders will appear here once customers make purchases.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
              
            </Table>
          </TableContainer>
          <TablePagination
            sx={{ 
              // mb: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
                 borderTop: 1,
                borderColor: 'divider'
            }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
  </Paper>
         
          {/* Card Details Modal */}
          <Dialog
            open={cardDetailsModal}
            onClose={handleCloseCardDetails}
            maxWidth="lg"
            PaperProps={{
              sx: {
                backgroundColor: '#ffffff',
                minHeight: '600px',
                maxHeight: '80vh',
                borderRadius: 3,
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              py: 4,
              px: 4,
              borderBottom: '1px solid #e5e7eb'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}>
                <InfoIcon sx={{ fontSize: 24, color: '#374151' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: '#111827',
                  fontSize: '1.75rem'
                }}>
                  Card Details
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '1rem'
                }}>
                  Complete card information and customization
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ 
              p: 0,
              backgroundColor: '#ffffff',
              mt: 2,
              overflowY: 'auto',
              maxHeight: '50vh',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}>
              {selectedCardDetails && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  p: 3,
                  px: 4
                }}>
                  {/* Card Images Section */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      Cards
                    </Typography>
                    <Grid container spacing={2} sx={{ justifyContent: 'flex-start' }}>
                      {/* Front Design */}
                      {selectedCardDetails?.cardCustomizationId?.cardId?.frontDesign && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ 
                            maxWidth: 300, 
                            mx: 'auto',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                            }
                          }}>
                            <CardMedia
                              component="img"
                              height="300"
                              image={`${BASE_URL}/${selectedCardDetails.cardCustomizationId.cardId.frontDesign.replace(/\\/g, '/')}`}
                              alt="Front Design"
                              sx={{ 
                                objectFit: 'cover',
                                borderRadius: '12px 12px 0 0'
                              }}
                            />
                            <Box sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'primary.main'
                              }}>
                                Front Design
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                      {/* Back Design */}
                      {selectedCardDetails?.cardCustomizationId?.cardId?.backDesign && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ 
                            maxWidth: 300, 
                            mx: 'auto',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                            }
                          }}>
                            <CardMedia
                              component="img"
                              height="300"
                              image={`${BASE_URL}/${selectedCardDetails.cardCustomizationId.cardId.backDesign.replace(/\\/g, '/')}`}
                              alt="Back Design"
                              sx={{ 
                                objectFit: 'cover',
                                borderRadius: '12px 12px 0 0'
                              }}
                            />
                            <Box sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'primary.main'
                              }}>
                                Back Design
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                      {/* Inside Left Design */}
                      {selectedCardDetails?.cardCustomizationId?.cardId?.insideLeftDesign && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ 
                            maxWidth: 300, 
                            mx: 'auto',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                            }
                          }}>
                            <CardMedia
                              component="img"
                              height="300"
                              image={`${BASE_URL}/${selectedCardDetails.cardCustomizationId.cardId.insideLeftDesign.replace(/\\/g, '/')}`}
                              alt="Inside Left Design"
                              sx={{ 
                                objectFit: 'cover',
                                borderRadius: '12px 12px 0 0'
                              }}
                            />
                            <Box sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'primary.main'
                              }}>
                                Inside Left Design
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                      {/* Inside Right Design */}
                      {selectedCardDetails?.cardCustomizationId?.cardId?.insideRightDesign && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ 
                            maxWidth: 300, 
                            mx: 'auto',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                            }
                          }}>
                            <CardMedia
                              component="img"
                              height="300"
                              image={`${BASE_URL}/${selectedCardDetails.cardCustomizationId.cardId.insideRightDesign.replace(/\\/g, '/')}`}
                              alt="Inside Right Design"
                              sx={{ 
                                objectFit: 'cover',
                                borderRadius: '12px 12px 0 0'
                              }}
                            />
                            <Box sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'primary.main'
                              }}>
                                Inside Right Design
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Card Information Section */}
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                       Card Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Card Title
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            {(() => {
                              const title = selectedCardDetails?.cardCustomizationId?.cardId?.title || selectedCardDetails?.title;
                              return typeof title === 'object' ? title?.text || 'N/A' : title || 'N/A';
                            })()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Card Type
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            {selectedCardDetails?.cardCustomizationId?.cardId?.cardType?.join(', ') || 'Standard Card'}
                          </Typography>
                        </Box>
                      </Grid>
                      {selectedCardDetails?.cardCustomizationId?.cardId?.price && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Card Price
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#111827'
                            }}>
                              ${selectedCardDetails.cardCustomizationId.cardId.price}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Quantity Ordered
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            {selectedCardDetails?.quantity}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Promotion Code
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            {selectedCardDetails?.cardCustomizationId?.cardId?.promotionCode || 'No Code'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Card Customization Details */}
                  {selectedCardDetails?.cardCustomizationId?.arTemplateData && (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: '#111827',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        Card Customization
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedCardDetails.cardCustomizationId.arTemplateData.mainHeading && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2,
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              height: '100%'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                mb: 1,
                                color: '#374151',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                Main Heading
                              </Typography>
                              <Typography sx={{ 
                                fontSize: '1.2rem', 
                                fontWeight: 500,
                                color: '#111827'
                              }}>
                                {selectedCardDetails.cardCustomizationId.arTemplateData.mainHeading.text || 
                                 selectedCardDetails.cardCustomizationId.arTemplateData.mainHeading}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {selectedCardDetails.cardCustomizationId.arTemplateData.paragraph1 && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2,
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              height: '100%'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                mb: 1,
                                color: '#374151',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                Custom Paragraph
                              </Typography>
                              <Typography sx={{ 
                                fontSize: '1rem', 
                                fontWeight: 400, 
                                lineHeight: 1.6,
                                color: '#111827'
                              }}>
                                {selectedCardDetails.cardCustomizationId.arTemplateData.paragraph1.text || 
                                 selectedCardDetails.cardCustomizationId.arTemplateData.paragraph1}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {/* {selectedCardDetails.cardCustomizationId.arTemplateData.templateIndex && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                                Template Index
                              </Typography>
                              <Typography sx={{ color: '#111827' }}>
                                Template {selectedCardDetails.cardCustomizationId.arTemplateData.templateIndex}
                              </Typography>
                            </Box>
                          </Grid>
                        )} */}
                      </Grid>
                    </Box>
                  )}

                  {/* Video Content */}
                  {selectedCardDetails?.cardCustomizationId?.templateVideo && (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: '#111827',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                         Video Content
                      </Typography>
                      <Grid container spacing={3} sx={{ justifyContent: 'flex-start' }}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ 
                            maxWidth: 300, 
                            mx: 'auto',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                            }
                          }}>
                            <video 
                              controls 
                              style={{ 
                                width: '100%', 
                                height: '300px', 
                                objectFit: 'cover',
                                borderRadius: '12px 12px 0 0'
                              }}
                              src={selectedCardDetails.cardCustomizationId.templateVideo}
                            >
                              Your browser does not support the video tag.
                            </video>
                            <Box sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'info.main'
                              }}>
                                Custom Video Content
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Card Creation Information */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      Card Creation Details
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedCardDetails?.cardCustomizationId?.cardId?.createdAt && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Card Created
                            </Typography>
                            <Typography sx={{ color: '#111827' }}>
                              {new Date(selectedCardDetails.cardCustomizationId.cardId.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {selectedCardDetails?.cardCustomizationId?.createdAt && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Customization Created
                            </Typography>
                            <Typography sx={{ color: '#111827' }}>
                              {new Date(selectedCardDetails.cardCustomizationId.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {/* {selectedCardDetails?.cardCustomizationId?.cardId?.uuid && (
                        <Grid item xs={12}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Card UUID
                            </Typography>
                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              {selectedCardDetails.cardCustomizationId.cardId.uuid}
                            </Typography>
                          </Box>
                        </Grid>
                      )} */}
                    </Grid>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
              <Button 
                onClick={handleCloseCardDetails} 
                variant="outlined"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  border: '1px solid #d1d5db',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Order Details Modal */}
          <Dialog
            open={transactionDetailsModal}
            onClose={handleCloseTransactionDetails}
            maxWidth="md"
            PaperProps={{
              sx: {
                backgroundColor: '#ffffff',
                minHeight: '600px',
                maxHeight: '80vh',
                borderRadius: 3,
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              py: 4,
              px: 4,
              borderBottom: '1px solid #e5e7eb'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}>
                <InfoIcon sx={{ fontSize: 24, color: '#374151' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: '#111827',
                  fontSize: '1.75rem'
                }}>
                  Order Details
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '1rem'
                }}>
                  Complete  order and payment details
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ 
              p: 0,
              backgroundColor: '#ffffff',
              mt: 2,
              overflowY: 'auto',
              maxHeight: '50vh',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}>
              {selectedTransactionDetails && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  p: 4,
                  px: 4
                }}>
                  {/* Transaction ID & Status */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      mb: 2,
                      fontSize: '1.125rem'
                    }}>
                      Order Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Order ID
                          </Typography>
                          <Box sx={{
                            backgroundColor: '#f9fafb',
                            padding: '8px 12px',
                            borderRadius: 1,
                            border: '1px solid #e5e7eb',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Typography sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 600,
                              color: '#e91e63',
                              fontSize: '1.125rem'
                            }}>
                              #{selectedTransactionDetails?.orderId || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Payment Intent ID
                          </Typography>
                          <Box sx={{
                            backgroundColor: '#f9fafb',
                            padding: '8px 12px',
                            borderRadius: 1,
                            border: '1px solid #e5e7eb',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Typography sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 500,
                              color: '#111827',
                              fontSize: '0.875rem',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedTransactionDetails?.payment_intent || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      {/* <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Stripe Checkout ID
                          </Typography>
                          <Box sx={{
                            backgroundColor: '#f9fafb',
                            padding: '8px 12px',
                            borderRadius: 1,
                            border: '1px solid #e5e7eb',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Typography sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 500,
                              color: '#111827',
                              fontSize: '0.875rem',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedTransactionDetails?.checkout_id || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid> */}
                      {/* <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Status
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: '8px',
                            borderRadius: '6px',
                            backgroundColor: selectedTransactionDetails?.status === 'COMPLETED' ? '#f0f9ff' : 
                                           selectedTransactionDetails?.status === 'PENDING' ? '#fef3c7' : '#fef2f2',
                            border: '1px solid',
                            borderColor: selectedTransactionDetails?.status === 'COMPLETED' ? '#0ea5e9' : 
                                        selectedTransactionDetails?.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                            flex: 1,
                            justifyContent: 'flex-start'
                          }}>
                            <Typography sx={{ 
                              color: selectedTransactionDetails?.status === 'COMPLETED' ? '#0ea5e9' : 
                                     selectedTransactionDetails?.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              fontSize: '0.75rem'
                            }}>
                              {selectedTransactionDetails?.status}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid> */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Shipping Status
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: '8px',
                            borderRadius: '6px',
                            backgroundColor: selectedTransactionDetails?.shippingStatus === 'shipped' ? '#f0fdf4' : 
                                           selectedTransactionDetails?.shippingStatus === 'in_shipping' ? '#fef3c7' : '#f3f4f6',
                            border: '1px solid',
                            borderColor: selectedTransactionDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                        selectedTransactionDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                            flex: 1,
                            justifyContent: 'flex-start'
                          }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: selectedTransactionDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                             selectedTransactionDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                              mr: 1
                            }} />
                            <Typography sx={{ 
                              color: selectedTransactionDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                     selectedTransactionDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              fontSize: '0.75rem'
                            }}>
                              {selectedTransactionDetails?.shippingStatus === 'shipped' ? 'Shipped' : 
                               selectedTransactionDetails?.shippingStatus === 'in_shipping' ? 'In Shipping' : 'Processing'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      {/* Commented out Estimated Shipping Days section - now using detailed shipping days object */}
                      {/* <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1.5,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Estimated Shipping Days
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: '8px',
                            borderRadius: '6px',
                            backgroundColor: selectedTransactionDetails?.expressShipping ? '#f0f9ff' : '#f8fafc',
                            border: '1px solid',
                            borderColor: selectedTransactionDetails?.expressShipping ? '#0ea5e9' : '#e5e7eb',
                            flex: 1,
                            justifyContent: 'flex-start'
                          }}>
                            <Typography sx={{ 
                              color: selectedTransactionDetails?.expressShipping ? '#0ea5e9' : '#374151',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}>
                              {selectedTransactionDetails?.expressShipping ? '1-3 days (Express)' : `${selectedTransactionDetails?.shippingDays || '7-10'} days`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid> */}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Pricing Details */}
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      mb: 2,
                      fontSize: '1.125rem'
                    }}>
                      Pricing Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Base Price
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            ${selectedTransactionDetails?.price || 0} 
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            GST
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            ${selectedTransactionDetails?.gst || 0} 
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Shipping
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: '#111827'
                          }}>
                            ${selectedTransactionDetails?.shipping || 0} 
                          </Typography>
                        </Box>
                      </Grid>
                      {selectedTransactionDetails?.expressShipping && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Express Shipping
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#111827'
                            }}>
                              ${selectedTransactionDetails?.expressShippingRate || 0}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {/* Subtotal Before Discount */}
                      {selectedTransactionDetails?.discount_price > 0 && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#fffbf0',
                            borderRadius: 2,
                            border: '1px solid #ffd966',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#b8860b',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Subtotal Before Discount
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#b8860b'
                            }}>
                              ${selectedTransactionDetails?.total_before_discount ? Number(selectedTransactionDetails.total_before_discount).toFixed(2) : '0.00'} 
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {/* Coupon Code */}
                      {selectedTransactionDetails?.coupon_code && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#e8f5e9',
                            borderRadius: 2,
                            border: '1px solid #4caf50',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#2e7d32',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Coupon Code Applied
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#2e7d32',
                              fontFamily: 'monospace',
                              letterSpacing: '1px'
                            }}>
                              {selectedTransactionDetails?.coupon_code}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {/* Discount Amount */}
                      {selectedTransactionDetails?.discount_price > 0 && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#fff3e0',
                            borderRadius: 2,
                            border: '1px solid #ff9800',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#e65100',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Discount Amount
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: '#e65100'
                            }}>
                              ${Number(selectedTransactionDetails?.discount_price || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 3,
                          backgroundColor: selectedTransactionDetails?.discount_price > 0 ? '#e8f5e9' : '#ffffff',
                          borderRadius: 2,
                          border: selectedTransactionDetails?.discount_price > 0 ? '2px solid #4caf50' : '2px solid #111827',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: selectedTransactionDetails?.discount_price > 0 ? '#2e7d32' : '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {selectedTransactionDetails?.discount_price > 0 ? 'Final Amount Paid' : 'Total Amount'}
                          </Typography>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 800,
                            color: selectedTransactionDetails?.discount_price > 0 ? '#2e7d32' : '#111827'
                          }}>
                            ${Number(selectedTransactionDetails?.total || 0).toFixed(2)} 
                          </Typography>
                          {selectedTransactionDetails?.discount_price > 0 && (
                            <Typography variant="body2" sx={{ 
                              mt: 1,
                              color: '#4caf50',
                              fontWeight: 600
                            }}>
                              💰 You saved ${Number(selectedTransactionDetails?.discount_price || 0).toFixed(2)}!
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Payment Information */}
                  {selectedTransactionDetails?.data && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Payment Information
                      </Typography>
                      <Grid container spacing={2} alignItems="stretch">
                        {selectedTransactionDetails.data.payer && (
                          <>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                                  Payer Name
                                </Typography>
                                <Typography sx={{ color: '#111827', flex: 1 }}>
                                  {selectedTransactionDetails.data.payer.name.given_name} {selectedTransactionDetails.data.payer.name.surname}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                                  Payer Email
                                </Typography>
                                <Typography sx={{ color: '#111827', flex: 1 }}>
                                  {selectedTransactionDetails.data.payer.email_address}
                                </Typography>
                              </Box>
                            </Grid>
                          </>
                        )}
                        {selectedTransactionDetails.data.purchase_units?.[0]?.payments?.captures?.[0] && (
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 2,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                                Payment Capture ID
                              </Typography>
                              <Typography sx={{ fontFamily: 'monospace' }}>
                                {selectedTransactionDetails.data.purchase_units[0].payments.captures[0].id}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Order Information */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      Order Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}>
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                            Quantity
                          </Typography>
                          <Typography>{selectedTransactionDetails?.quantity}</Typography>
                        </Box>
                      </Grid>
                      {selectedTransactionDetails?.paid_at && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Payment Date
                            </Typography>
                            <Typography sx={{ color: '#111827' }}>
                              {new Date(selectedTransactionDetails.paid_at).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
              <Button 
                onClick={handleCloseTransactionDetails} 
                variant="outlined"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  border: '1px solid #d1d5db',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Address Details Modal */}
          <Dialog
            open={addressDetailsModal}
            onClose={handleCloseAddressDetails}
            maxWidth="md"
            PaperProps={{
              sx: {
                backgroundColor: '#ffffff',
                minHeight: '600px',
                maxHeight: '80vh',
                borderRadius: 3,
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              py: 4,
              px: 4,
              borderBottom: '1px solid #e5e7eb'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}>
                <InfoIcon sx={{ fontSize: 24, color: '#374151' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: '#111827',
                  fontSize: '1.75rem'
                }}>
                  Address Details
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '1rem'
                }}>
                  Complete delivery and customer information
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ 
              p: 0,
              backgroundColor: '#ffffff',
              mt: 2,
              overflowY: 'auto',
              maxHeight: '50vh',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}>
              {selectedAddressDetails && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  p: 3,
                  px: 4
                }}>
                  {/* Delivery Address */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📍 Delivery Address
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}  >
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Complete Address
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            lineHeight: 1.6,
                            color: '#111827'
                          }}>
                            {selectedAddressDetails?.delivery_address}<br/>
                            {selectedAddressDetails?.suburb}<br/>
                            {selectedAddressDetails?.state} {selectedAddressDetails?.postal_code}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Contact Information */}
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#111827',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📞 Contact Information
                    </Typography>
                    <Grid container spacing={2} alignItems="stretch">
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Phone Number
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '1.1rem',
                            color: '#111827',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {selectedAddressDetails?.phone_number}
                          </Typography>
                        </Box>
                      </Grid>
                      {selectedAddressDetails?.cardCustomizationId?.userId?.email && (
                        <Grid item xs={12}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Customer Email
                            </Typography>
                            <Typography sx={{ 
                              color: '#111827',
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {selectedAddressDetails.cardCustomizationId.userId.email}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Customer Information */}
                  {selectedAddressDetails?.cardCustomizationId?.userId && (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: '#111827',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        Customer Information
                      </Typography>
                      <Grid container spacing={2} alignItems="stretch">
                        <Grid item xs={12}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Customer Name
                            </Typography>
                            <Typography sx={{ 
                              color: '#111827',
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {selectedAddressDetails.cardCustomizationId.userId.firstName} {selectedAddressDetails.cardCustomizationId.userId.lastName}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Divider />

                  {/* Shipping Information */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📦 Shipping Information
                    </Typography>
                    
                    {/* Current Status Row - Upper */}
                    <Grid container spacing={2} alignItems="stretch" sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          minHeight: '120px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Current Status
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: '8px',
                            borderRadius: '6px',
                            backgroundColor: selectedAddressDetails?.shippingStatus === 'shipped' ? '#f0fdf4' : 
                                           selectedAddressDetails?.shippingStatus === 'in_shipping' ? '#fef3c7' : '#f3f4f6',
                            border: '1px solid',
                            borderColor: selectedAddressDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                        selectedAddressDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                            flex: 1
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: selectedAddressDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                               selectedAddressDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                                mr: 1
                              }} />
                              <Typography sx={{ 
                                color: selectedAddressDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                       selectedAddressDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.9rem'
                              }}>
                                {selectedAddressDetails?.shippingStatus === 'shipped' ? 'Shipped' : 
                                 selectedAddressDetails?.shippingStatus === 'in_shipping' ? 'In Shipping' : 'Processing'}
                              </Typography>
                            </Box>
                            <Typography sx={{ 
                              color: selectedAddressDetails?.shippingStatus === 'shipped' ? '#22c55e' : 
                                     selectedAddressDetails?.shippingStatus === 'in_shipping' ? '#f59e0b' : '#6b7280',
                              fontWeight: 500,
                              fontSize: '0.8rem'
                            }}>
                              {selectedAddressDetails?.shippingStatus === 'shipped' && selectedAddressDetails?.shippedDate ? 
                                `Shipped on ${new Date(selectedAddressDetails.shippedDate).toLocaleDateString()}` :
                               selectedAddressDetails?.shippingStatus === 'in_shipping' && selectedAddressDetails?.inShippingDate ? 
                                `In shipping since ${new Date(selectedAddressDetails.inShippingDate).toLocaleDateString()}` :
                               `Processing since ${new Date(selectedAddressDetails.createdAt).toLocaleDateString()}`
                              }
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Dates Row - Bottom - 2 dates per row */}
                    <Grid container spacing={2} alignItems="stretch">
                      {/* Processing Date - Always show */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          
                          p: 2,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          minHeight: '120px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Processing Date
                          </Typography>
                          <Typography sx={{ 
                            color: '#111827',
                            fontWeight: 500,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {new Date(selectedAddressDetails.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {selectedAddressDetails?.inShippingDate && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            minHeight: '120px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              In Shipping Date
                            </Typography>
                            <Typography sx={{ 
                              color: '#111827',
                              fontWeight: 500,
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {new Date(selectedAddressDetails.inShippingDate).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {selectedAddressDetails?.shippedDate && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            minHeight: '120px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Shipped Date
                            </Typography>
                            <Typography sx={{ 
                              color: '#111827',
                              fontWeight: 500,
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {new Date(selectedAddressDetails.shippedDate).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    {/* Tracking ID Section - Displayed at the end */}
                    {selectedAddressDetails?.trackingId && (
                      <Grid container spacing={2} alignItems="stretch" sx={{ mt: 2 }}>
                        {selectedAddressDetails?.shippingCompany && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              p: 2,
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                mb: 1.5,
                                color: '#374151',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                🚚 Shipping Company
                              </Typography>
                              <Typography sx={{ 
                                color: '#111827',
                                fontWeight: 600,
                                fontSize: '1rem',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {selectedAddressDetails.shippingCompany}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={selectedAddressDetails?.shippingCompany ? 6 : 12}>
                          <Box sx={{ 
                            p: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 1.5,
                              color: '#374151',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              📦 Tracking ID
                            </Typography>
                            <Box sx={{
                              backgroundColor: '#f0f4ff',
                              padding: '12px 16px',
                              borderRadius: 1,
                              border: '1px solid #667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Typography sx={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 600,
                                color: '#667eea',
                                fontSize: '1.125rem',
                                letterSpacing: '1px'
                              }}>
                                {selectedAddressDetails.trackingId}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    )}

              
                    
                    {/* {selectedAddressDetails?.shippingDays && (
                        <Grid container spacing={2} alignItems="stretch" sx={{ mt: 2 }}>
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 2,
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              minHeight: '120px',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                mb: 2,
                                color: '#374151',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                📅 Shipping Days
                              </Typography>
                              
                        
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                mb: 2
                              }}>
                                <Box sx={{
                                  px: 2,
                                  py: 0.5,
                                  backgroundColor: selectedAddressDetails?.expressShipping ? '#f0f9ff' : '#f8fafc',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: selectedAddressDetails?.expressShipping ? '#0ea5e9' : '#e2e8f0'
                                }}>
                                  <Typography sx={{ 
                                    color: selectedAddressDetails?.expressShipping ? '#0ea5e9' : '#475569',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    {selectedAddressDetails?.expressShipping ? '🚀 Express Shipping' : '📦 Standard Shipping'}
                                  </Typography>
                                </Box>
                              </Box>

                      
                              <Box sx={{
                                p: 2,
                                backgroundColor: '#f8fafc',
                                borderRadius: 1,
                                border: '1px solid #e2e8f0'
                              }}>
                         
                                <Box sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  py: 1.5,
                                  borderBottom: '1px solid #e2e8f0',
                                  mb: 1.5
                                }}>
                                  <Typography variant="subtitle2" sx={{ 
                                    fontWeight: 600, 
                                    color: '#475569',
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    In Victoria
                                  </Typography>
                                  <Typography sx={{ 
                                    color: '#1e293b',
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                  }}>
                                    {selectedAddressDetails.shippingDays.inVictoria || 'N/A'}
                                  </Typography>
                                </Box>
                                
                             
                                <Box sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  py: 1.5
                                }}>
                                  <Typography variant="subtitle2" sx={{ 
                                    fontWeight: 600, 
                                    color: '#475569',
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    Interstate
                                  </Typography>
                                  <Typography sx={{ 
                                    color: '#1e293b',
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                  }}>
                                    {selectedAddressDetails.shippingDays.interstate || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                    )} */}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                onClick={handlePrintAddressDetails} 
                variant="contained"
                startIcon={<PrintIcon />}
                sx={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#059669',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Print
              </Button>
              <Button 
                onClick={handleCloseAddressDetails} 
                variant="outlined"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  border: '1px solid #d1d5db',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Shipping Confirmation Dialog */}
          <Dialog
            open={shippingConfirmationDialog}
            onClose={handleCancelShipping}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              backgroundColor: '#f8fafc', 
              borderBottom: '1px solid #e5e7eb',
              fontWeight: 600,
              color: '#1f2937'
            }}>
              Confirm Shipping Status
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, color: '#374151', mt:3 }}>
                Are you sure you want to mark this order as {shippingAction === 'in_shipping' ? 'In Shipping' : 'Shipped'}?
              </Typography>
              
              {/* Show tracking ID input only when shipping action is 'shipped' */}
              
              {selectedTransactionForShipping && (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f9fafb', 
                  borderRadius: 1,
                  border: '1px solid #e5e7eb'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Order Details:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Payment Intent: {selectedTransactionForShipping.payment_intent || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Card Title: {typeof selectedTransactionForShipping.title === 'object' 
                      ? selectedTransactionForShipping.title?.text || 'N/A'
                      : selectedTransactionForShipping.title || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Delivery Address: {selectedTransactionForShipping.delivery_address}
                  </Typography>
                </Box>
              )}
              
              {/* Show tracking ID and shipping company fields when action is 'in_shipping' */}
              {shippingAction === 'in_shipping' && (
                <>
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      label="Enter Tracking ID"
                      required
                      helperText="Tracking ID is required to proceed"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter tracking ID"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                        style: { backgroundColor: '#fff', paddingLeft: 4, paddingRight: 4 }
                      }}
                      sx={{
                        // '& .MuiOutlinedInput-root': {
                        //   '&:hover fieldset': {
                        //     borderColor: '#667eea',
                        //   },
                        //   '&.Mui-focused fieldset': {
                        //     borderColor: '#667eea',
                        //   },
                        // },
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      label="Shipping Company (Optional)"
                      value={shippingCompany}
                      onChange={(e) => setShippingCompany(e.target.value)}
                      placeholder="e.g., Australia Post, DHL, FedEx"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                        style: { backgroundColor: '#fff', paddingLeft: 4, paddingRight: 4 }
                      }}
                      sx={{
                        // '& .MuiOutlinedInput-root': {
                        //   '&:hover fieldset': {
                        //     borderColor: '#667eea',
                        //   },
                        //   '&.Mui-focused fieldset': {
                        //     borderColor: '#667eea',
                        //   },
                        // },
                      }}
                    />
                  </Box>
                </>
              )}
              
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
              <Button
                onClick={handleCancelShipping}
                variant="outlined"
                disabled={isProcessingShipping}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmShipping}
                variant="contained"
                disabled={isProcessingShipping}
                sx={{
                  backgroundColor: '#c165a0',
                  color:'white',
                  '&:hover': {
                    backgroundColor: '#c165a0',
                    color:'white'
                  },
                  '&:disabled': {
                    backgroundColor: '#d1a8c6',
                    color: 'white'
                  }
                }}
              >
                {isProcessingShipping ? (
                  <>
                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                    
                  </>
                ) : (
                  'Confirm Shipped'
                )}
              </Button>
            </DialogActions>
          </Dialog>

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
          {/*workung code*/}

          <div id="card" ref={printRef}  className="print-card" style={{ width: '100%' }}>
            {selectedTransaction && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>

           
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
                      position: 'relative'
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
                            alignItems: 'center'

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
  );
};

Transaction.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default Transaction;
