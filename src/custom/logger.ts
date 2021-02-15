// Creating a logger file that will be available for the rest of the
// project to use.
const winston = require("winston");
export const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        // winston.format.colorize(),
        // winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
});

export function format(prefix: string, message: string) {
    return prefix.toUpperCase() + ": " + message;
}
