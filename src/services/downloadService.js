import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import { sendProgress, sendQueueUpdate } from '../utils/notifications.js'; // Assuming you have a notifications utility for sending updates
import { STATUS, COOKIES_FILE, DOWNLOAD_DIR, FFMPEG_DIR } from '../utils/constants.js';
import { getQueue,removeQueueId } from '../services/queueService.js';
import logger from '../utils/logger.js';

const bestFormat = "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]";
let isDownloading = false;
let currentItem = null;

export async function download(url, format, info) {
    if(info == null || url == null || format == null || url.length == 0 || format.length == 0) {
        return;
    }
    isDownloading = true; 
    setCurrentItem(getQueue().find(item => item.url === url));
    sendQueueUpdate(getQueue(), currentItem, STATUS);
    const channel = info?.uploader || 'Unknown_Channel';
    const title = info?.title || 'Unknown_Title';
    logger.info(`Starting download: ${title} from ${channel}`);
    const outputDir = path.join(DOWNLOAD_DIR, channel);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const options = {
        format: format || bestFormat,
        output: path.join(outputDir, '%(title)s.%(ext)s'),
        ffmpegLocation: FFMPEG_DIR,
        progress: true,
        cookies: COOKIES_FILE
    };
    sendProgress({ percent, title: `Starting download: ${title} from ${channel}` });
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
        logger.info(`Download complete: ${info.title}`);
        sendProgress({ percent: 100, title: info.title, done: true });
        currentItem = null;
        isDownloading = false;
        // Additional logic to remove the item from the queue can be added here
        removeQueueId(info.id);
        // Notify all clients about the updated queue
        sendQueueUpdate(getQueue(), currentItem, STATUS);
    });

    return { success: true };
}

export function isCurrentlyDownloading() {
    return isDownloading;
}

export function getCurrentItem() {
    return currentItem;
}

export function setCurrentItem(item) {
    currentItem = item;
    sendQueueUpdate(getQueue(), currentItem, STATUS);
}