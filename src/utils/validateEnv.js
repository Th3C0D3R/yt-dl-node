import logger from '../utils/logger.js';

function validateEnv() {
    const requiredVars = ['OUTPUT_DIRECTORY', 'FFMPEG_DIRECTORY', 'PORT'];
    requiredVars.forEach((key) => {
        if (!process.env[key]) {
            logger.error(`Missing required environment variable: ${key}`);
            process.exit(1);
        }
    });
}

export default validateEnv;