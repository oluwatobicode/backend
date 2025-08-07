class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1b) advanced filtering
    const mongoQuery = {};
    // loops through each key-value pairs in the query object
    Object.entries(queryObj).forEach(([key, value]) => {
      // tries to match keys on the format of 'field[operator]' e.g 'duration[gte]'
      const match = key.match(/(\w+)\[(gte|gt|lte|lt)\]/);
      // conditional to check if there is a match
      if (match) {
        // extracts the field name e.g duartion
        const field = match[1]; // e.g., 'duration'

        // this will then build the mongodb operatoe by adding the '$' prefix e,g gte becomes $gte
        const operator = `$${match[2]}`; // e.g., '$gte'

        // If the field is not already in mongoQuery, initialize it as an empty object
        if (!mongoQuery[field]) mongoQuery[field] = {};

        // Assign the operator and value to the nested field, converting value to a number
        mongoQuery[field][operator] = Number(value);
      } else {
        // If the key does not match the '[operator]' pattern, add it as-is
        mongoQuery[key] = value;
      }
    });

    this.query = this.query.find(mongoQuery);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // sort('price ratingsAverage')
      // we will add it to the url like this sort=price,ratingsAverage
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // a default one
      this.query = this.query.sort('-createdAt _id');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // this is called projecting
    } else {
      this.query = this.query.select('-__v'); //this will not include the __v that mongodb gives us
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1; // converting a string to number abd by default we wannt it to be 1
    const limit = Number(this.queryString.limit) || 10;

    const skip = (page - 1) * limit;

    // - define default values cause we need to have pagination be default (page=1, limit=100)
    // page=2&limit=10 1-10, 1-10, page 1, 11-20, page 2, 21-30, page 3
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
