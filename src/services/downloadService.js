import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import { sendProgress, sendQueueUpdate } from '../utils/notifications.js'; // Assuming you have a notifications utility for sending updates
import { STATUS, COOKIES_FILE, DOWNLOAD_DIR, FFMPEG_DIR } from '../utils/constants.js';
import { getQueue, removeQueueId, saveQueue } from '../services/queueService.js';
import logger from '../utils/logger.js';
import { processQueue } from '../routes/download.js';

const bestFormat = "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]";
let isDownloading = false;
let currentItem = null;
let ytdlProcess = null;

export async function download(url, format, info) {
    if (info == null || url == null || format == null || url.length == 0 || format.length == 0) {
        return;
    }
    ytdlProcess = null;
    isDownloading = true;
    setCurrentItem(getQueue().find(item => item.url === url));
    sendQueueUpdate(getQueue(), currentItem, STATUS);
    const channel = info?.uploader || 'Unknown_Channel';
    const title = info?.title || 'Unknown_Title';
    logger.info(`Starting download: ${title} from ${channel}`);
    var dir = channel.replaceAll(":"," ").replaceAll("\\"," ").replaceAll("*"," ").replaceAll("'"," ").replaceAll(">"," ").replaceAll("/"," ").replaceAll("?"," ").replaceAll("!"," ").replaceAll("\""," ").replaceAll("<"," ");
    const outputDir = path.join(DOWNLOAD_DIR, dir);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const options = {
        format: format || bestFormat,
        output: path.join(outputDir, '%(title)s.%(ext)s'),
        ffmpegLocation: FFMPEG_DIR,
        progress: true,
        cookies: COOKIES_FILE
    };
    sendProgress({ percent: 0, title: `Starting download: ${title} from ${channel}`, done: false });
    ytdlProcess = youtubedl.exec(url, options);

    ytdlProcess.stdout.on('data', (chunk) => {
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

    ytdlProcess.on('close', async () => {
        logger.info(`Download complete: ${info.title}`);
        sendProgress({ percent: 100, title: info.title, done: true });
        removeQueueId(info.id);
        saveQueue();
        isDownloading = false;
        await processQueue();
    });

    return { success: true };
}

export function isCurrentlyDownloading() {
    return isDownloading;
}

export function setDownloading(state) {
    isDownloading = state;
}

export function getCurrentItem() {
    return currentItem;
}

export function cancelDownload() {
    if (ytdlProcess) {
        ytdlProcess.kill('SIGINT');
        logger.info('Download cancelled by user');
        isDownloading = false;
        currentItem = null;
        sendProgress({ percent: 0, title: 'Download cancelled', done: true });
        sendQueueUpdate(getQueue(), currentItem, STATUS);
    }
}

export function setCurrentItem(item) {
    currentItem = item;
    sendQueueUpdate(getQueue(), currentItem, STATUS);
}