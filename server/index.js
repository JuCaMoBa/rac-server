const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { logger, requestId, requestLog } = require('./config/logger');
const api = require('./api/v1');
const { cors: corsConfig } = require('./config');

const app = express();

// Middlewares
app.use(
  cors({
    origin: corsConfig.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  }),
);

app.use(requestId);
app.use(requestLog);
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    debug: true,
  }),
);

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
