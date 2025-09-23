const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  if (!newReview) {
    return next(new AppError('Please fill in your review', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find();

  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review,
    },
  });
});
