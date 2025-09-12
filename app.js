// start here
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1 ) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// this is used for json parsing for the body based on the body-parser: Parse incoming request bodies
// in a middleware before your handlers, available under the req.body property.
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// this is used to parse url encoded form data making it accessible as a
// JavaScript object in req.body. It's essential for handling form submissions in
// application/x-www-form-urlencoded format.
app.use(express.urlencoded({ extended: true }));

// this is a way of using app.use() to add a specific middleware function like the request time of each api request below
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// This enables you to define routes in separate files or modules and then attach them to the main application.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// router handlers for when we hit an unkwnow or wrong route
// this runs for all the http methods
// the star will handle it for all routes
app.all('/{*any}', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Failed',
  //   message: `cant find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`cant find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`cant find ${req.originalUrl} on this server!`, 404)); // whatever we pass express will assume it as an error and  it will skip other middlewares in the stack and go to the centralized middlware
});

// express will know this is an error handling
// 1) create an error handling middleware
app.use(globalErrorHandler);

module.exports = app;
