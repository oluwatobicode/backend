const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // 1A) filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1b) advanced filtering
    const mongoQuery = {};
    // loops through each key-value pairs in the query object
    Object.entries(queryObj).forEach(([key, value]) => {
      // tries to match keys on the format of 'field[operator]' e.g 'duration[gte]'
      const match = key.match(/(\w+)\[(gte|gt|lte|lt)\]/);
      // coditional to check if there is a match
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

    console.log(mongoQuery);

    let query = Tour.find(mongoQuery);

    // 2) SORTING
    if (req.query.sort) {
      // sort('price ratingsAverage')
      // we will add it to the url like this sort=price,ratingsAverage
      const sortBy = req.query.sort.split(', ').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      // a default one
      query = query.sort('-createdAt');
    }
    // execute the query here
    const tours = await query;

    // const query =  Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.requestTime,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  // same as Tour.findOne({_id: req.params.id})

  try {
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // a way of creating a new document
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
