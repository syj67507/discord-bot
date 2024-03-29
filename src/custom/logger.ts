// Creating a logger file that will be available for the rest of the
// project to use.
import winston from "winston";
export const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        // winston.format.colorize(),
        // winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
});

export function format(prefix: string, message: string): string {
    return prefix.toUpperCase() + ": " + message;
}
