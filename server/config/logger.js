const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: './logs/info.log', level: 'info' }),
      new winston.transports.File({ filename: './logs/error.log', level: 'error'  }),
    ],
  });

  module.exports = logger;