const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // converting string to number
  // finding the tour with the given id
  // tours.find() returns the first element that satisfies the condition
  const tour = tours.find((el) => el.id === id);

  // if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1; //getting the last id and incrementing it
  //Object.assign() creates a new object by merging two existing  object togther
  // here we are merging the newId with the request body
  // so that we can add the new tour with a unique id
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  // This is a placeholder function for updating a tour
  // In a real application, you would implement the logic to update the tour here
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour Data>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  // 204 MEANS 'NO CONTENT', SO WE DON'T SEND ANY DATA BACK
  // We just send a success status
  res.status(204).json({
    status: 'success',
    data: null, // No content to send back
  });
};

// // IT HANDLES ALL GET REQUESTS TO /api/v1/tours, NOTE THAT 200 IS THE STATUS CODE FOR 'OK'
// // app.get('/api/v1/tours', getAllTours);
// // getting a single tour by id
// app.get('/api/v1/tours/:id', getTour);
// // IT HANDLES ALL POST REQUESTS TO /api/v1/tours , NOTE THAT 201 IS THE STATUS CODE FOR 'CREATED'
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// Defining routes using app.route for better organization
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
