export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator(a, b, orderBy) {
  if (a[orderBy] === null) {
    return 1;
  }
  if (b[orderBy] === null) {
    return -1;
  }
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// export function applyFilter({inputData, comparator, filterName}) {
//     const stabilizedThis = inputData.map((el, index) => [el, index]);
//
//     stabilizedThis.sort((a, b) => {
//         const order = comparator(a[0], b[0]);
//         if (order !== 0) return order;
//         return a[1] - b[1];
//     });
//
//     inputData = stabilizedThis.map((el) => el[0]);
//
//
//     if (filterName) {
//         inputData = inputData.filter((user) => {
//             const userName = user?.transactionData?.name ? user.transactionData.name.toLowerCase() : '';
//             const userEmail = user?.transactionData?.user_id?.email ? user.transactionData.user_id.email.toLowerCase() : '';
//             const transactionId = user?.transactionData?.transaction_id ? user.transactionData.transaction_id.toLowerCase() : '';
//             return userName.indexOf(filterName.toLowerCase()) !== -1 ||
//                 userEmail.indexOf(filterName.toLowerCase()) !== -1 ||
//                 transactionId.indexOf(filterName.toLowerCase()) !== -1;
//         });
//     }
//
//     return inputData;
// }

export function applyFilter({ inputData, comparator, filterName }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);


  if (filterName) {
    // Split the filterName by commas and trim any whitespace
    const filterIds = filterName.split(',').map(id => id.trim().toLowerCase());

    inputData = inputData.filter((user) => {
      const userName = user?.transactionData?.name ? user.transactionData.name.toLowerCase() : '';
      const userEmail = user?.transactionData?.user_id?.email ? user.transactionData.user_id.email.toLowerCase() : '';
      const transactionId = user?.transactionData?.transaction_id ? user.transactionData.transaction_id.toLowerCase() : '';
      // Check if any filterId matches the userName or userEmail
      return filterIds.some(id => userName.indexOf(id) !== -1 || userEmail.indexOf(id) !== -1) ||
        filterIds.includes(transactionId); // Check if transactionId is in the filterIds array
    });
  }

  return inputData;
}

