import router from './download.js';

export default function setupRoutes(app) {
    app.get('/', (req, res) => {
        res.render('index');
    });
    app.use('/api', router);
}