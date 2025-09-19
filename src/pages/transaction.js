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

  console.log("transactions", transactions)

//filter function
  const filtered = applyFilter(transactions, searchQuery, [
    'paypal_order_id',
    'cardCustomizationId.userId.firstName',
    'cardCustomizationId.userId.email',
    'status',
    'title'
  ]);
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
    const front = {
      src: makeUrl(transaction?.cardCustomizationId?.cardId?.frontDesign),
      heading: transaction?.cardCustomizationId?.arTemplateData?.mainHeadingText,
      para1: transaction?.cardCustomizationId?.arTemplateData?.paragraph1Text,
      para2: transaction?.cardCustomizationId?.arTemplateData?.paragraph2Text
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

    const makeCardHTML = (c) => `
    <div class="card">
      ${(c.heading || c.para1 || c.para2) ? `
        <div class="overlay-text">
          <div class="overlay-inner">
            ${c.heading ? `<h2 class="stroke">${c.heading}</h2>` : ``}
            ${c.para1 ? `<p class="stroke">${c.para1}</p>` : ``}
            ${c.para2 ? `<p class="stroke">${c.para2}</p>` : ``}
          </div>
        </div>` : ``}
      ${c.qr ? `<div class="qr"><div id="qr-slot"></div></div>` : ``}
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
      const qrValue = `${AR_EXPERIENCE_LINK}/${transaction?.cardCustomizationId?._id}`;
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
        <title>Transactions | Incardible</title>
      </Head>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
          }}>Transactions</Typography>

<TableContainer
  component={Paper}
  sx={{
    width: '100%',
    maxWidth: '100%',
    mx: 'auto',
    display: 'block',
    overflowX: {xs: 'auto', md:'hidden' },                // ← horizontal scroll
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
                  <TableCell colSpan={11} sx={{ width: '100%' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: {md:'flex-end', xs:'flex-start'},
                      flexDirection: { md: 'row', xs: 'column' },
                      // justifyContent: 'center',
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
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Transaction Id</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Card Title</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Amount</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Quantity</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Express Shipping</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>News & Offers</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Status</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '20%' }}>Order Date</TableCell>
                  <TableCell sx={{ textAlign: 'left', width: '10%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingComplete ? (
                  <TableRow align="center">
                    <TableCell colSpan={10} align="center">
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
                        <TableCell component="th" scope="row">
                          {data?.paypal_order_id}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.cardCustomizationId?.cardId?.title}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {`${data?.total} AUD`}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.quantity}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.expressShipping? 'Yes':'No'}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.newsAndOffers? 'Yes':'No'}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data?.status}
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
                    <TableCell colSpan={8} align="center">
                      No Transaction Found
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            sx={{ 
              mb: 5,
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%'
            }}
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
  )
    ;
};

Transaction.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);
export default Transaction;
