const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

// for param middleware incase we ever need it
// router.param('id', tourController.checkId);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/top-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// we do not need need the distance paramter as we had it right here,
/* 
because we are not going to be searching for a certain radius ,
we are really going to calucate the distance from all a certain point to all the tours
that we have in our collection.
*/
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistance);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// it would look like this when calling:
// /tours-distance/233/center/-40,45/unit/mi

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//

module.exports = router;
