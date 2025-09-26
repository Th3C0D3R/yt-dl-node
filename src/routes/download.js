import express from 'express';
import youtubedl from 'youtube-dl-exec';
import { saveQueue, readQueue } from '../services/queueService.js';
import { download, setCurrentItem } from '../services/downloadService.js';
import logger from '../utils/logger.js';

const router = express.Router();

let isDownloading = false;
let queue = await readQueue();

if (queue.length > 0) {
    for (; queue.length;) {
        try {
            const { url, format, info } = queue.shift();
            await download(url, format, info, );
        } catch (error) {
            logger.error(error);
        }
    }
}

router.post('/download', async (req, res) => {
    try {
        const { url, format } = req.body;
        if (!url) {
            logger.error('No URL provided');
            return res.status(400).json({ error: 'No URL provided' });
        }
        const info = await youtubedl(url, { dumpSingleJson: true });
        queue.push({ url, format, info });
        saveQueue();

        if (isDownloading) {
            return res.status(202).json({ response: 'Download already running!\nAdded to queue' });
        }

        setCurrentItem(queue.find(item => item.url === url));
        var ret = await download(url, format, info);
        res.json(ret);
    } catch (error) {
        logger.error(`Download failed: ${error.message}`);
        res.status(500).json({ error: error.message || 'Download failed' }); 
    }
});

router.post('/remove', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'No ID provided' });

    queue = queue.filter(item => item.id !== id);
    saveQueue();
    res.json({ success: true });
});

export default router;