// Creating a logger file that will be available for the rest of the
// project to use.
const winston = require("winston");
const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize(),
        // winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
});

function format(prefix, message) {
    return prefix.toUpperCase() + ": " + message;
}

module.exports = {
    logger,
    format,
};
