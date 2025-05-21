const FilterHelper = (dataArr = [], query = '', properties = []) => dataArr.filter(data => {
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

export default FilterHelper;