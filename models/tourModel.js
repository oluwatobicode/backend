const mongoose = require('mongoose');

// in here we are defining the schema of how our tour schema would look like
// note our tour is a collection, the individual data we have there is a document
const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a validation'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size!'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty!'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    required: [true, 'A tour must have a price!'],
  },
  priceDiscount: Number,
  summary: {
    type: 'String',
    trim: true,
    required: [true, 'A tour must have a summary!'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image!'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

// then we define our tour model, which helps
// us to interact with our database collections
// this model also gives us the ability to execute mongoose commands
const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
