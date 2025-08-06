// note our server.js is our entry point

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // this is a way of getting the path of our env file
const app = require('./app');

// this is our database setup
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

// we are trying to connect to the DB
mongoose
  .connect(DB)
  .then(() => console.log('connection to the DB is successful!'));

// we defined a port in our env file we are either using it or we are running on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
