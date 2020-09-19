// Creating a logger file that will be available for the rest of the
// project to use.
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console(),
    ],
});
module.exports = logger;