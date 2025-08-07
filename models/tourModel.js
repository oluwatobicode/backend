const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// in here we are defining the schema of how our tour schema would look like
// note our tour is a collection, the individual data we have there is a document
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less or equal than 40 characters!',
      ],
      minLength: [10, 'A tour name must have more or equal characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficulty',
      }, //restricts to only the values here to be passed
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
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
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },

        message: 'Discount prince ({VALUE}) should be below regular price',
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual property
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware: runs before .save() and .create() but on .insertMany()
// the this will point to the currenltly saved document , we are going to create a slug for each of the document
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// toursSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// // in here we have finished doc and not the this keyword
// toursSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// then we define our tour model, which helps
// us to interact with our database collections
// this model also gives us the ability to execute mongoose commands

// QUERY MIDDLEWARE
// the this keyword will be pointing at the current query and not at the current documeny
// use case lets say we can have seceret tours in our database
// like tours that are for like only a very small like, VIP group of people
// and the public should not know about

// And so what we're gonna do is to create a secret tour field
// and then query only for tours that are not secret.
//toursSchema.pre('find', function (next) {
toursSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: { $ne: true },
  });

  this.start = Date.now();
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});

// aggregation middleware
// the this will point to the current aggregation
toursSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
