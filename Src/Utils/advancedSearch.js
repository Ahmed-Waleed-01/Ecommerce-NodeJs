export class AdvancedSearch {
  constructor(dbModel, queryData) {
    this.dbModel = dbModel;
    this.queryData = queryData;
    this.orignalModel = dbModel; //this is the original model so we can reuse the dbmodel attribute after it's edited.
  }

  pagination() {
    let { page, size } = this.queryData;
    //if there was an error in the sent parameters.
    if (size <= 0 || size == undefined) size = 5;
    if (page <= 0 || page == undefined) page = 1;

    //calculating the skip
    const skip = size * (page - 1);
    this.dbModel = this.dbModel.find().skip(skip).limit(size);
  }

  sort() {
    if (this.queryData.sort) {
      const sortQuery = this.queryData.sort?.replace(/,/g, " ");
      this.dbModel = this.dbModel.sort(sortQuery);
    }
  }

  select() {
    if (this.queryData.fields) {
      const selectQuery = this.queryData.fields?.replaceAll(",", " ");
      this.dbModel = this.dbModel.select(selectQuery);
    }
  }

  filter() {
    //we are fitering the query parameters to match the filter fields.
    const exclude_for_filter = [
      "sort",
      "page",
      "size",
      "fields",
      "name",
      "desc",
      "searchKey"
    ];
    //deep copying request query.
    let filterQuery = { ...this.queryData };
    //deleteing any excess query params so it can match the filter.
    exclude_for_filter.forEach((element) => {
      delete filterQuery[element];
    });

    if (filterQuery) {
      //replacing the space before the keywords to be suitable to search with.
      filterQuery = JSON.stringify(filterQuery).replace(
        /lte|lt|gte|gt/g,
        (match) => {
          return `$${match}`;
        }
      );

      //returning the filtered query to a json object.
      filterQuery = JSON.parse(filterQuery);
      this.dbModel = this.dbModel.find(filterQuery);
    }
  }

  search() {
    //checking to see if the search keys exist or not.
    if (this.queryData.name || this.queryData.desc) {
      this.dbModel = this.dbModel.find({
        $or: [
          { name: { $regex: `${this.queryData.name}` } },
          { description: { $regex: `${this.queryData.desc}` } },
        ],
      });
    }
  }

  populate(fields=[])
  {
    fields.forEach(element => {
        this.dbModel.populate(element);
    });
  }

  getItemsCount() {
    const result = this.dbModel.count();
    this.dbModel = this.orignalModel;

    return result;
  }

  getPagesCount(numberOfItems) {
    let { size } = this.queryData;
    //if there was an error in the sent parameters.
    if (size <= 0 || size == undefined) size = 5;

    const numberOfPages = Math.ceil(
      parseFloat(numberOfItems) / parseFloat(size)
    );
    return numberOfPages;
  }

   getSearchResult() {
    //calling the functions.
    this.pagination();
    this.filter();
    this.search();
    this.select();
    this.sort();

    const result = this.dbModel;
    this.dbModel = this.orignalModel;

    return result;
  }

  getSearchResultAndPopulate(fields=[]) {
    //calling the functions.
    this.pagination();
    this.filter();
    this.search();
    this.select();
    this.sort();
    this.populate(fields)

    const result = this.dbModel;
    this.dbModel = this.orignalModel;

    return result;
  }
}
