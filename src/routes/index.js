import router from './download.js';
import { setupSSE } from '../utils/notifications.js'

export default function setupRoutes(app) {
    app.get('/', (req, res) => {
        res.render('index');
    });
    app.use('/api', router);
    setupSSE(app);
}