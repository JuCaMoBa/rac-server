const express = require('express')
const logger =require('./config/logger')
const api = require('./api/v1')

const app = express()

// Middlewares
app.use(express.json());


app.use('/api', api);

// catch all
app.use((req, res, next) => {
  const message = 'Error. Route Not Found';
  const statusCode = 404;

  logger.warn(message);

  next({
    statusCode,
    message,
  });
});

// error
app.use((error, req, res, next) => {
  const { message = '', name = '' } = error;
  let { statusCode = 500 } = error;

  if (name === 'ValidationError') {
    statusCode = 422;
    logger.warn(message);
  } else {
    logger.error(message);
  }

  res.status(statusCode);
  res.json({
    message,
    error,
  });
});



module.exports = app;