import express from 'express';
import youtubedl from 'youtube-dl-exec';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = 'N:\\Youtube';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let clients = [];

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
        const info = await youtubedl(url, { dumpSingleJson: true });
        const channel = info.uploader || 'Unknown_Channel';
        const outputDir = path.join(DOWNLOAD_DIR, channel);

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const options = {
            format: format || 'bestvideo+bestaudio/best',
            output: path.join(outputDir, '%(title)s.%(ext)s'),
            ffmpegLocation: "C:\\bin\\",
            progress: true
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

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Download failed' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));