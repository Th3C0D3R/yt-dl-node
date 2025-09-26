import express from 'express';
import youtubedl from 'youtube-dl-exec';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import '@dotenvx/dotenvx/config'

function validateEnv() {
    const requiredVars = ['OUTPUT_DIRECTORY', 'FFMPEG_DIRECTORY', 'PORT'];
    requiredVars.forEach((key) => {
        if (!process.env[key]) {
            console.error(`Missing required environment variable: ${key}`);
            process.exit(1);
        }
    });
}

validateEnv();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = process.env.OUTPUT_DIRECTORY;
const FFMPEG_DIR = process.env.FFMPEG_DIRECTORY;
const COOKIES_FILE = process.env.COOKIES_FILE;
const PORT = process.env.PORT;
const ISDEBUG = process.env.DEBUG === 'true';

const STATUS = {
    QUEUED: 'queued',
    DOWNLOADING: 'downloading',
    ERROR: 'error'
}

const bestFormat = "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv*+ba/b";
var isDownloading = ISDEBUG;
var currentItem = null;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let progressClients = [];
let queueClients = [];
let queue = await readQueue();
let errored = [];

if (queue.length > 0) {
    for (; queue.length;) {
        try {
            const { url, format, info } = queue.shift();
            await download(url, format, info);
        } catch (error) {
            console.error(error);
            errored.push({ url, format });
        }
    }
}


function sendProgress(data) {
    progressClients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}
function sendQueueUpdate() {
    queueClients.forEach(client => client.write(`data: ${JSON.stringify(queue.map(item => ({ title: item.info.title || 'Unknown_Title', id: item.info.id, currentStatus: currentItem == item.info.id ? STATUS.DOWNLOADING : STATUS.QUEUED })))}\n\n`));
}

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/download', async (req, res) => {
    try {
        const { url, format } = req.body;
        if (!url) return res.status(400).json({ error: 'No URL provided' });
        const info = await youtubedl(url, { dumpSingleJson: true, cookies: COOKIES_FILE });
        queue.push({ url, format, info });
        saveQueue();
        sendQueueUpdate();

        if (isDownloading) {
            return res.status(202).json({ response: 'Download already running!\nAdded to queue' });
        }

        currentItem = queue.find(item => item.url === url);
        var ret = await download(url, format, info);
        res.json(ret);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Download failed' }); 
    }
});

app.post('/remove', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'No ID provided' });

    // Remove the item from the queue
    queue = queue.filter(item => item.id !== id);
    saveQueue();
    sendQueueUpdate();
    res.json({ success: true });
});

async function download(url, format, info) {
    isDownloading = true;
    const channel = info.uploader || 'Unknown_Channel';
    const title = info.title || 'Unknown_Title';
    console.log(`Starting download: ${title} from ${channel}`);
    const outputDir = path.join(DOWNLOAD_DIR, channel);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const options = {
        format: format || bestFormat,
        output: path.join(outputDir, '%(title)s.%(ext)s'),
        ffmpegLocation: FFMPEG_DIR,
        progress: true,
        cookies: COOKIES_FILE
    };

    //console.log(options.ffmpegLocation);
    //console.log(options.format);

    const process = youtubedl.exec(url, options);

    process.stdout.on('data', (chunk) => {
        const msg = chunk.toString();
        const match = msg.match(/(\d+\.\d)%/);
        if (match) {
            const percent = parseFloat(match[1]);
            sendProgress({ percent, title: info.title });
        }
        const mergeMatch = msg.match(/Merging/);
        if (mergeMatch) {
            sendProgress({ percent: 100, title: `Merging ${info.title} into one file...` });
        }
    });

    process.on('close', () => {
        sendProgress({ percent: 100, title: info.title, done: true });
        currentItem = null;
        isDownloading = false;
        queue = queue.filter(item => item.url !== url);
        saveQueue();
        sendQueueUpdate();
    });

    return { success: true }

}

async function readQueue() {
    const queueFilePath = path.join(__dirname, ".queue");
    if (!fs.existsSync(queueFilePath)) return [];

    const queueData = await fs.promises.readFile(queueFilePath, { encoding: "utf-8" });
    return queueData.split(";").map(item => {
        const [url, format] = item.split("#");
        return { url, format };
    });
}

function saveQueue() {
    var queueData = queue.map(item => `${item.url}#${item.format}#${item.info.title || 'Unknown_Title'}#${item.info.uploader || 'Unknown_Channel'}`).join(";");
    fs.writeFileSync(path.join(__dirname, ".queue"), queueData, { encoding: "utf-8", flag: "w" });
}

process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));