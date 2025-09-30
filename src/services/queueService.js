import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendQueueUpdate } from '../utils/notifications.js'; // Assuming you have a notifications utility for sending updates
import { getCurrentItem } from '../services/downloadService.js';
import { STATUS } from '../utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let queue = [];

export async function readQueue() {
    const queueFilePath = path.join(__dirname, '..', '..', '.queue');
    if (!fs.existsSync(queueFilePath)) return [];

    const queueData = await fs.promises.readFile(queueFilePath, { encoding: "utf-8" });
    if(queueData.length <= 0) return queue = [];
    const items = queueData.split(";");
    if(items.length <= 0) return queue = [];
    queue = items.map(item => {
        const [url, format, id, title, uploader] = item.split("#");
        return { url, format, id, title, uploader };
    })
    return queue;
}

export function saveQueue() {
    const queueData = queue.map(item => `${item.url}#${item.format}#${item.id}#${item.title || 'Unknown_Title'}#${item.uploader || 'Unknown_Channel'}`).join(";");
    fs.writeFileSync(path.join(__dirname, '..', '..', '.queue'), queueData, { encoding: "utf-8", flag: "w" });
}

export function getQueue() {
    return queue;
}

export function addToQueue(item) {
    queue.push(item);
}

export function removeQueueIndex(idx) {
    queue = queue.splice(idx, 1);
}

export function removeQueueItem(item) {
    removeQueueId(item.id);
}

export function removeQueueId(id) {
    queue = queue.filter(item => item.id !== id);
    sendQueueUpdate(queue, getCurrentItem(), STATUS);
}