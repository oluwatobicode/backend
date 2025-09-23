const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({
  mergeParams: true,
});

router
  .route('/')
  .post(reviewController.createReview)
  .get(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.getAllReviews
  );

module.exports = router;
