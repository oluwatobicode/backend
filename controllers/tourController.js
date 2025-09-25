const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/* 
-> router.route('/tours-within/:distance/center/:latlng/unit/:unit');

// /tours-distance/233/center/34.111745,-118.113491/unit/mi
*/

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  // remeber we want to query for the start location field because the
  // start location field is what holds the geospatial point where each tour starts

  // /we would use the geoWithin as it helps in finding a location within a specific sphere
  // the centerSphere takes in an array of cordinates and radius
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        // in here we have to pass the lng, first
        // the radius what happens is that mongodb expects us to pass it as a radians
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  /* 
  NB: ONE VERY IMPORTANT THING IS THAT 
  WE ACTUALLY IN ORDER TO BE ABLE TO 
  DO JUST BASIC QUERIES, WE NEED TO 
  FIRST ATTRIBUTE AN INDEX TO 
  THE FIELD WHERE THE GEOSPATIAL DATA
  THAT WE ARE SEARCHING FOR IS STORED.
  SO IN THIS CASE WE ARE ADDING AN INDEX TO THE TOUR MODEL
  */

  /* 
  BUT WHAT IF WE WANTED TO KNOW THE 
  EXACT DISTANCE OF ALL THE TOURS TO THE
  STARTING POINT.
  */

  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });

  next();
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  // to do caculations we use the aggreagtion pipeline
  // for this there is only single stage
  const distances = await Tour.aggregate([
    {
      // it must always be first and it requires that one of our
      // fields contain a geoSpace index
      /* 
      our start location already has this 2dsphere geospatial index on it.
      since we are using this startLocation in order to caculate the distances.

      if there is only one field with a geospatial index then this geoNear stage here will automatgically use 
      that index in order to perform the calculation, But if you have multiple fields with geospatail indexes then you need to use
      the keys paramter in order to define the field that you want to use for calculation.
      */

      // we got an error of geoNear must be first the reason why is because of the aggregation middlware we did initially in the tours model
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        // we can specify the distance multiplier
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },

      // we also just want to get the distance and the name of the tours
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });

  next();
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// sample of our aggregation Pipeline,
exports.getTourStats = catchAsync(async (req, res) => {
  // aggregation stages
  // first stage is $match: if we want to select / filter different documents
  // group allows us  to group documents together by using an accumulator
  // in the group object we use the _id because it will help us in knowing what
  // we want to group by
  // we can also repeat stages, WHEN WE ARE REPEATING STAGES
  // WE ARE TO USE THE NAME OF THE DOCUMENT WE MAY
  // HAVE DEFINED IN THE $group
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, //the _id will not show because we put to 0
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
