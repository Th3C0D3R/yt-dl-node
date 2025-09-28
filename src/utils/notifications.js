import { getQueue } from '../services/queueService.js';
import { getCurrentItem } from '../services/downloadService.js';
import { STATUS } from './constants.js';

let progressClients = [];
let queueClients = [];


export function setupSSE(app) {
    // SSE route for progress updates
    app.get('/progress', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        progressClients.push(res);

        req.on('close', () => {
            progressClients = progressClients.filter(c => c !== res);
        });
    });

    // SSE route for queue updates
    app.get('/queue', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        queueClients.push(res);
        var queue = getQueue();
        if (queue.length > 0)
            res.write(`data: ${JSON.stringify(queue.map(item => ({ title: item?.title || 'Unknown_Title', id: item.id, currentStatus: getCurrentItem().id == item.id ? STATUS.DOWNLOADING : STATUS.QUEUED })))}\n\n`);
        else
            res.write(`data: ${JSON.stringify([])}\n\n`);

        req.on('close', () => {
            queueClients = queueClients.filter(c => c !== res);
        });
    });
}

/**
 * Sends progress updates to all registered clients.
 * @param {object} data - The progress data to send.
 */
export function sendProgress(data) {
    progressClients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}

/**
 * Sends queue updates to all registered clients.
 * @param {Array} queue - The current queue to send.
 * @param {string} currentItemId - The ID of the current item being downloaded.
 * @param {object} STATUS - The status constants.
 */
export function sendQueueUpdate(queue, currentItemId, STATUS) {
    const queueData = queue.map(item => ({
        title: item?.title || 'Unknown_Title',
        id: item.id,
        currentStatus: currentItemId.id === item.id ? STATUS.DOWNLOADING : STATUS.QUEUED
    }));
    queueClients.forEach(client => client.write(`data: ${JSON.stringify(queueData)}\n\n`));
}