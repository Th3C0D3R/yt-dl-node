import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info', // Set the default logging level
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: 'logs/app.log' }) // Log to a file
    ]
});

export default logger;