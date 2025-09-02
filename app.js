import express from 'express';
import youtubedl from 'youtube-dl-exec';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import '@dotenvx/dotenvx/config'


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = process.env.OUTPUT_DIRECTORY;
const FFMPEG_DIR = process.env.FFMPEG_DIRECTORY;
const COOKIES_FILE = process.env.COOKIES_FILE;
const PORT = process.env.PORT;

const bestFormat = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let clients = [];
let queue = getExistingQueue();

if (queue.length > 0) {

}

// SSE route for progress updates
app.get('/progress', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(c => c !== res);
    });
});

function sendProgress(data) {
    clients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/download', async (req, res) => {
    const { url, format } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });
    try {
        var ret = await download(url, format);
        res.json(ret);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Download failed' });
    }
});

async function download(url, format) {
    const info = await youtubedl(url, { dumpSingleJson: true, cookies: COOKIES_FILE });
    const channel = info.uploader || 'Unknown_Channel';
    const outputDir = path.join(DOWNLOAD_DIR, channel);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const options = {
        format: format || bestFormat,
        output: path.join(outputDir, '%(title)s.%(ext)s'),
        ffmpegLocation: FFMPEG_DIR,
        progress: true,
        cookies: COOKIES_FILE
    };

    const process = youtubedl.exec(url, options);

    process.stdout.on('data', (chunk) => {
        const msg = chunk.toString();
        const match = msg.match(/(\d+\.\d)%/);
        if (match) {
            const percent = parseFloat(match[1]);
            sendProgress({ percent, title: info.title });
        }
    });

    process.on('close', () => {
        sendProgress({ percent: 100, title: info.title, done: true });
    });

    return { success: true }

}

function getExistingQueue() {
    var queue = [];
    if (fs.existsSync(path.join(__dirname, ".queue"))) {
        var queueData = fs.readFileSync(utils.QUEUEFILE, { encoding: "utf-8" });
        var queueItems = queueData.split(";");
        for (let i = 0; i < queueItems.length; i++) {
            let item = queueItems[i];
            let data = item.split("#");
            queue.push({ "url": data[0], "format": data[1] });
        }
    }
    return queue;
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));