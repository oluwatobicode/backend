// start here
const express = require('express');
const morgan = require('morgan');

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
app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

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

module.exports = app;
