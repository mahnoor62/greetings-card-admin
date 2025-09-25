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

  const handleShippingStatusChange = (transaction, newStatus) => {
    if (newStatus === 'shipped' && !transaction.isShipped) {
      setSelectedTransactionForShipping(transaction);
      setShippingConfirmationDialog(true);
    }
  };

  const handleConfirmShipping = async () => {
    if (!selectedTransactionForShipping) return;

    const token = window.localStorage.getItem('token');
    try {
      const response = await axios.put(
        `${BASE_URL}/api/transactions/update-shipping-status/${selectedTransactionForShipping._id}`,
        { isShipped: true },
        {
          headers: {
            'x-access-token': token
          }
        }
      );

      if (response.data.success) {
        // Update the transaction in the local state
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction._id === selectedTransactionForShipping._id
              ? { ...transaction, isShipped: true }
              : transaction
          )
        );
        toast.success('Order marked as shipped successfully!');
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
      toast.error('Failed to update shipping status');
    } finally {
      setShippingConfirmationDialog(false);
      setSelectedTransactionForShipping(null);
    }
  };

  const handleCancelShipping = () => {
    setShippingConfirmationDialog(false);
    setSelectedTransactionForShipping(null);
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
    'paypal_order_id',
    'cardCustomizationId.userId.firstName',
    'cardCustomizationId.userId.email',
    'status',
    'title'
  ]);

  // Apply shipping status filter
  if (shippingFilter !== 'all') {
    filtered = filtered.filter(transaction => {
      if (shippingFilter === 'shipped') {
        return transaction.isShipped === true;
      } else if (shippingFilter === 'shipping') {
        return transaction.isShipped === false;
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

// version 3
  const printTransaction = (transaction, winRef) => {
    const docTitle = `Incardible-${transaction?.transaction_id}`;
    const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);

    // sirf front aur back lena hai
    const arTemplateData = transaction?.cardCustomizationId?.arTemplateData;
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

    const styles = `
<style>
  @page {
    size: A5 landscape;
    margin: ${PAGE_MARGIN_MM}mm;
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; font-family: Calibri, sans-serif; }
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
    /*border: 2px solid #bbb;   !* sirf border *!*/
    background: #fff;         /* sirf white bg */
    overflow: hidden;
    break-inside: avoid;
  }

  .overlay-text{
    position: absolute;
    inset: 8%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 2;
    pointer-events: none;
    max-width: 84%;
    max-height: 84%;
  }
  .overlay-inner{
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    line-height: 1.25;
    color: black;
  }
  .overlay-inner h2{ font-weight:700; font-size:18pt; margin:0 0 4mm; }
  .overlay-inner p{ font-size:12pt; margin:0 0 3mm; }
  .overlay-inner .stroke{ -webkit-text-stroke:0.6pt #000; }

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

    // Helper function to convert RGB values to CSS color
    const rgbToCss = (colorObj) => {
      if (!colorObj || typeof colorObj.r === 'undefined') return 'black';
      const r = Math.round(colorObj.r * 255);
      const g = Math.round(colorObj.g * 255);
      const b = Math.round(colorObj.b * 255);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Helper function to apply text styling
    const applyTextStyle = (textObj, elementType = 'p') => {
      if (!textObj || !textObj.text) return '';
      
      const color = rgbToCss(textObj.color);
      const fontSize = textObj.fontSize ? `${textObj.fontSize}pt` : '12pt';
      const fontWeight = textObj.isBold ? 'bold' : 'normal';
      const fontStyle = textObj.isItalic ? 'italic' : 'normal';
      const textDecoration = textObj.isUnderline ? 'underline' : 'none';
      
      // Use only the exact font name from the data
      const fontFamily = textObj.fontName ? `"${textObj.fontName}"` : '';
      
      // Determine text alignment
      let textAlign = 'left';
      if (textObj.isCenterAligned) textAlign = 'center';
      else if (textObj.isRightAligned) textAlign = 'right';
      
      const style = `
        color: ${color};
        font-size: ${fontSize};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        text-decoration: ${textDecoration};
        text-align: ${textAlign};
        font-family: ${fontFamily};
      `;
      
      return `<${elementType} style="${style}">${textObj.text}</${elementType}>`;
    };

    const makeCardHTML = (c) => `
    <div class="card">
      ${(c.heading || c.para1 || c.para2) ? `
        <div class="overlay-text">
          <div class="overlay-inner">
            ${c.heading ? applyTextStyle(c.heading, 'h2') : ''}
            ${c.para1 ? applyTextStyle(c.para1, 'p') : ''}
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

    // Write document
    winRef.document.write(
      `<html><head><title>${docTitle}</title>${styles}</head><body>${pages.join('')}</body></html>`
    );
    winRef.document.close();

    // QR load
    const script = winRef.document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      const qrValue = `${AR_EXPERIENCE_LINK}/?templateId=${transaction?.cardCustomizationId?._id}`;
      console.log("qrValue", qrValue)
      const slot = winRef.document.getElementById('qr-slot');
      if (slot && winRef.QRCode) {
        const qr = new winRef.QRCode(slot, {
          text: qrValue,
          width: 100,
          height: 100,
          correctLevel: winRef.QRCode.CorrectLevel.M
        });
        setTimeout(() => { winRef.focus(); winRef.print(); }, 500);
      } else {
        winRef.focus(); winRef.print();
      }
    };
    script.onerror = () => { winRef.focus(); winRef.print(); };
    winRef.document.head.appendChild(script);

    winRef.onafterprint = () => { try { winRef.close(); } catch {} };
  };

  const handlePrintClick = (transaction) => {
    try {
      const newWindow = window.open('', '_blank'); // must be user-initiated
      if (!newWindow) {
        toast.error('Please allow popups to print/download.');
        return;
      }
      setPrinting(true);

      const makeUrl = (p) => (p ? `${BASE_URL}/${p.replace(/\\/g, '/')}` : null);
      const urls = [
        makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
        makeUrl(transaction?.cardCustomizationId?.cardId?.backDesign)
      ].filter(Boolean);

      const proceed = () => {
        printTransaction(transaction, newWindow);
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
    }
  };

  // 1st wokring version in portrate
  // const handlePrintClick = (transaction) => {
  //   // Open window here — inside the click event to avoid popup blocking
  //   const newWindow = window.open('', '_blank');
  //   if (!newWindow) {
  //     console.log('Please allow popups for this site.');
  //     return;
  //   }
  //
  //   setPrinting(true);
  //   setImagesLoaded(0);
  //   setSelectedTransaction(transaction);
  //   setPrintingWindow(newWindow); // store window reference
  // };
  //
  // useEffect(() => {
  //   if (!selectedTransaction) {
  //     return;
  //   }
  //
  //   const imageUrls = [
  //     selectedTransaction?.cardCustomizationId?.cardId?.frontDesign,
  //     selectedTransaction?.cardCustomizationId?.cardId?.insideLeftDesign,
  //     selectedTransaction?.cardCustomizationId?.cardId?.insideRightDesign,
  //     selectedTransaction?.cardCustomizationId?.cardId?.backDesign
  //   ]
  //     .filter(Boolean)
  //     .map(url => `${BASE_URL}/${url.replace(/\\/g, '/')}`);
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
  //   if (!printingWindow) {
  //     setPrinting(false);
  //     return;
  //   }
  //
  //   const printContents = document.getElementById('card').outerHTML;
  //   const styles = `
  //   <style>
  //
  //    body {
  //    margin:0; padding:0;
  //    /*background-color: pink;*/
  //    /*display:flex; justify-content: center; align-items: center; height: 100%;*/
  //    font-family: 'Calibri', sans-serif !important;
  //         zoom: 100%;
  //       }
  //      @page {
  //      size: A5 portrait !important;
  //     /*display:flex;*/
  //     /*justify-content:center;*/
  //     /*align-items:center;*/
  //     /*marginTop: 20px;*/
  //   }
  //     img { max-width: 100%;}
  //     .print-card { display: block !important; }
  //   </style>
  // `;
  //   // ✅ use transaction id as window title
  //   const docTitle = `Incardible-${selectedTransaction?.transaction_id}`;
  //   console.log(":docTitle", docTitle);
  //   printingWindow.document.write(
  //     `<html><head><title>${docTitle}</title>${styles}</head><body>`
  //   );
  //   printingWindow.document.write(printContents);
  //   printingWindow.document.write('</body></html>');
  //   printingWindow.document.close();
  //   printingWindow.focus();
  //   printingWindow.print();
  //   printingWindow.close();
  //
  //   setPrinting(false);
  //   setPrintingWindow(null);
  // };

  console.log('transactions', transactions);
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
          maxWidth="lg"
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            py: 4
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
    overflowX: {xs: 'auto', md:'auto' },                // ← horizontal scroll
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
      minWidth: { xs: 960, sm: 960, md: 'auto' },
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
                  <TableCell sx={{ textAlign: 'left' }}>Card Title</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Address</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>Shipping Status</TableCell>
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
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}>
                              {data?.paypal_order_id}
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
                              {data?.cardCustomizationId?.cardId?.title}
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
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={data?.isShipped ? 'shipped' : 'shipping'}
                              onChange={(e) => handleShippingStatusChange(data, e.target.value)}
                              disabled={data?.isShipped}
                              sx={{
                                '& .MuiSelect-select': {
                                  py: 1,
                                  px: 2,
                                  borderRadius: 1,
                                  backgroundColor: data?.isShipped ? '#f0fdf4' : '#fef3c7',
                                  border: '1px solid',
                                  borderColor: data?.isShipped ? '#22c55e' : '#f59e0b',
                                  color: data?.isShipped ? '#22c55e' : '#f59e0b',
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
                              <MenuItem value="shipping" disabled>
                                <Typography sx={{ 
                                  color: '#f59e0b',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                }}>
                                  In Shipping
                                </Typography>
                              </MenuItem>
                              <MenuItem value="shipped">
                                <Typography sx={{ 
                                  color: '#22c55e',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                }}>
                                  Shipped
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
                            {selectedCardDetails?.cardCustomizationId?.cardId?.title || selectedCardDetails?.title}
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
                              ${selectedCardDetails.cardCustomizationId.cardId.price} AUD
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
                              fontWeight: 500,
                              color: '#111827',
                              fontSize: '0.875rem'
                            }}>
                              {selectedTransactionDetails?.paypal_order_id}
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
                            backgroundColor: selectedTransactionDetails?.isShipped ? '#f0fdf4' : '#fef3c7',
                            border: '1px solid',
                            borderColor: selectedTransactionDetails?.isShipped ? '#22c55e' : '#f59e0b',
                            flex: 1,
                            justifyContent: 'flex-start'
                          }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: selectedTransactionDetails?.isShipped ? '#22c55e' : '#f59e0b',
                              mr: 1
                            }} />
                            <Typography sx={{ 
                              color: selectedTransactionDetails?.isShipped ? '#22c55e' : '#f59e0b',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              fontSize: '0.75rem'
                            }}>
                              {selectedTransactionDetails?.isShipped ? 'Shipped' : 'In Shipping'}
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
                      </Grid>
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
                            ${selectedTransactionDetails?.price || 0} AUD
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
                            ${selectedTransactionDetails?.gst || 0} AUD
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
                            ${selectedTransactionDetails?.shipping || 0} AUD
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
                              ${selectedTransactionDetails?.expressShippingRate || 0} AUD
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 3,
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          border: '2px solid #111827',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Total Amount
                          </Typography>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 800,
                            color: '#111827'
                          }}>
                            ${selectedTransactionDetails?.total || 0} AUD
                          </Typography>
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
                      <Grid container spacing={2}>
                        {selectedTransactionDetails.data.payer && (
                          <>
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
                                  Payer Name
                                </Typography>
                                <Typography sx={{ color: '#111827' }}>
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
                                  Payer Email
                                </Typography>
                                <Typography sx={{ color: '#111827' }}>
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
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}>
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                            Express Shipping
                          </Typography>
                          <Typography sx={{ 
                            color: selectedTransactionDetails?.expressShipping ? 'success.main' : 'error.main',
                            fontWeight: 500
                          }}>
                            {selectedTransactionDetails?.expressShipping ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}>
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                            News & Offers
                          </Typography>
                          <Typography sx={{ 
                            color: selectedTransactionDetails?.newsAndOffers ? 'success.main' : 'error.main',
                            fontWeight: 500
                          }}>
                            {selectedTransactionDetails?.newsAndOffers ? 'Subscribed' : 'Not Subscribed'}
                          </Typography>
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

                  {/* Shipping Preferences */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      Shipping Preferences
                    </Typography>
                    <Grid container spacing={2} alignItems="stretch">
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
                            mb: 1,
                            color: '#374151',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Shipping Type
                          </Typography>
                          <Typography sx={{ 
                            color: selectedAddressDetails?.expressShipping ? '#22c55e' : '#0ea5e9',
                            fontWeight: 500,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {selectedAddressDetails?.expressShipping ? 'Express Shipping' : 'Standard Shipping'}
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
                            Marketing Preferences
                          </Typography>
                          <Typography sx={{ 
                            color: selectedAddressDetails?.newsAndOffers ? '#22c55e' : '#ef4444',
                            fontWeight: 500,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {selectedAddressDetails?.newsAndOffers ? 'Subscribed to News & Offers' : 'Not Subscribed'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
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
                Are you sure you want to mark this order as shipped?
              </Typography>
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
                    Transaction ID: {selectedTransactionForShipping._id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Card Title: {selectedTransactionForShipping.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Delivery Address: {selectedTransactionForShipping.delivery_address}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
              <Button
                onClick={handleCancelShipping}
                variant="outlined"
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
                sx={{
                  backgroundColor: '#c165a0',
                  color:'white',
                  '&:hover': {
                    backgroundColor: '#c165a0',
                    color:'white'
                  }
                }}
              >
                Confirm Shipped
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
          <div id="card" className="print-card" style={{ width: '100%' }}>
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
