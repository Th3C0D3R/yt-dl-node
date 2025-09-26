import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let queue = [];

export async function readQueue() {
    const queueFilePath = path.join(__dirname, '..', '..', '.queue');
    if (!fs.existsSync(queueFilePath)) return [];

    const queueData = await fs.promises.readFile(queueFilePath, { encoding: "utf-8" });
    return queueData.split(";").map(item => {
        const [url, format] = item.split("#");
        return { url, format };
    });
}

export function saveQueue() {
    const queueData = queue.map(item => `${item.url}#${item.format}#${item.info.title || 'Unknown_Title'}#${item.info.uploader || 'Unknown_Channel'}`).join(";");
    fs.writeFileSync(path.join(__dirname, '..', '..', '.queue'), queueData, { encoding: "utf-8", flag: "w" });
}

export function getQueue() {
    return queue;
}