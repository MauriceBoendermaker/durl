const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const LOG_FILE = path.join(__dirname, 'logs.json');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/track', (req, res) => {
    const { shortId, timestamp, referrer, userAgent } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const entry = {
        shortId,
        timestamp: timestamp || Date.now(),
        referrer,
        userAgent,
        ip
    };

    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        let logs = [];
        if (!err && data) {
            try {
                logs = JSON.parse(data);
            } catch { }
        }

        logs.push(entry);

        fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), (err) => {
            if (err) {
                console.error('Failed to write to log:', err);
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    });
});

app.get('/stats', (req, res) => {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Failed to read logs');

        let logs = [];
        try {
            logs = JSON.parse(data);
        } catch (e) {
            return res.status(500).send('Invalid log data');
        }

        const counts = logs.reduce((acc, entry) => {
            acc[entry.shortId] = (acc[entry.shortId] || 0) + 1;
            return acc;
        }, {});

        res.json(counts);
    });
});

app.listen(PORT, () => console.log(`Analytics server running on port ${PORT}`));
