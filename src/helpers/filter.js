const FilterHelper = (dataArr = [], query = '', properties = []) => dataArr.filter(data => {
  if (query) {
    let queryMatched = false;

    properties.forEach(property => {
      if (data[property] && (data[property]).toLowerCase().includes(query.toLowerCase())) {
        queryMatched = true;
      }
    });

    if (!queryMatched) {
      return false;
    }
  }

  return true;
});

const PaginationHelper = (dataArr, page, rowsPerPage) => dataArr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const UpdateState =(dataArr, id)=> dataArr.filter((data) => data._id !== id);

module.exports = {FilterHelper, PaginationHelper , UpdateState};

export default FilterHelper;
