import express from 'express';
import youtubedl from 'youtube-dl-exec';
import { saveQueue, readQueue, addToQueue, getQueue, removeQueueId } from '../services/queueService.js';
import { download, setCurrentItem } from '../services/downloadService.js';
import { sleep } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const router = express.Router();

let isDownloading = false;
await readQueue();

router.post('/download', async (req, res) => {
    try {
        const { url, format } = req.body;
        if (!url) {
            logger.error('No URL provided');
            return res.status(400).json({ error: 'No URL provided' });
        }
        const info = await youtubedl(url, { dumpSingleJson: true });
        addToQueue({ url, format, id: info?.id, title: info?.title || 'Unknown_Title', uploader: info?.uploader || 'Unknown_Channel' });
        saveQueue();

        if (isDownloading) {
            return res.status(202).json({ response: 'Download already running!\nAdded to queue' });
        }

        setCurrentItem(getQueue().find(item => item.url === url));
        var ret = { success: true }; //await download(url, format, info);
        res.json(ret);
    } catch (error) {
        logger.error(`Download failed: ${error.message}`);
        res.status(500).json({ error: error.message || 'Download failed' });
    }
});

router.post('/remove', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'No ID provided' });
    removeQueueId(id);
    res.json({ success: true });
});

export const processQueue = async () => {
    if (isDownloading) return;
    isDownloading = true;
    while (getQueue().length > 0) {
        const item = getQueue()[0];
        setCurrentItem(item);
        //await download(item.url, item.format, item);
        await sleep(20000); // delay for testing
        removeQueueId(item.id);
    }   
    setCurrentItem(null);
    isDownloading = false;
    logger.info('Queue processing complete');
    //saveQueue();
};

export default router;