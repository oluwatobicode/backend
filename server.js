// note our server.js is our entry point
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION! Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);

  // 0 - success
  // 1- uncalled
});

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
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
  // 0 - success
  // 1- uncalled
});
