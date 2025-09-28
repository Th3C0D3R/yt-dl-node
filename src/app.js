
import '@dotenvx/dotenvx/config';
import express from 'express';
import bodyParser from 'body-parser';
import validateEnv from './utils/validateEnv.js';
import setupRoutes from './routes/index.js';
import logger from './utils/logger.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { PORT } from './utils/constants.js';
import { processQueue } from './routes/download.js';

validateEnv();

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(express.static(path.join(projectRoot, 'public')));

setupRoutes(app);

app.listen(PORT, () => logger.info(`Server running at http://localhost:${PORT}`));

processQueue();