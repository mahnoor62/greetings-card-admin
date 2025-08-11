export const FilterHelper = (dataArr = [], query = '', properties = []) => dataArr.filter(data => {
  if (query) {
    let queryMatched = false;

    properties.forEach(property => {

      const splitted = property.split('.');
      let checkData = data[splitted[0]];

      if (splitted.length > 1) {
        checkData = data[splitted[0]][splitted[1]];
      }

      if (checkData && checkData.toLowerCase().includes(query.toLowerCase())) {
        queryMatched = true;
      }
    });

    if (!queryMatched) {
      return false;
    }
  }

  return true;
});

export const applyPagination = (list, page, rowsPerPage) => list.slice(page * rowsPerPage,
  page * rowsPerPage + rowsPerPage);



export const applyFilter = (dataArr = [], query = '', properties = []) => {
  return dataArr.filter(data => {
    if (!query) {
      return true;
    }

    return properties.some(property => {
      const pathParts = property.split('.');
      let value = data;

      for (const part of pathParts) {
        if (!value || typeof value !== 'object') {
          return false;
        }
        value = value[part];
      }

      return typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase());
    });
  });
};

// export default { FilterHelper, applyFilter };

// export function applyFilter({ inputData, comparator, filterName }) {
//   const stabilizedThis = inputData.map((el, index) => [el, index]);
//
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//
//   inputData = stabilizedThis.map((el) => el[0]);
//
//
//   if (filterName) {
//     // Split the filterName by commas and trim any whitespace
//     const filterIds = filterName.split(',').map(id => id.trim().toLowerCase());
//
//     inputData = inputData.filter((user) => {
//       const userName = user?.transactionData?.name ? user.transactionData.name.toLowerCase() : '';
//       const userEmail = user?.transactionData?.user_id?.email ? user.transactionData.user_id.email.toLowerCase() : '';
//       const transactionId = user?.transactionData?.transaction_id ? user.transactionData.transaction_id.toLowerCase() : '';
//       // Check if any filterId matches the userName or userEmail
//       return filterIds.some(id => userName.indexOf(id) !== -1 || userEmail.indexOf(id) !== -1) ||
//         filterIds.includes(transactionId); // Check if transactionId is in the filterIds array
//     });
//   }
//
//   return inputData;
// }
