const winston = require('winston');
const path = require('path');

const logDir = 'logs';
const logFileName = 'error.log';

module.exports = app => {
    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: path.join(logDir, logFileName) })
      ]
    });

    return { logger }
}
