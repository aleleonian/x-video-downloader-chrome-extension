
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const HOST = "localhost";
const PUBLIC_HOST = "149.56.12.157";
const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');

const sessions = {};

// Ensure downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

app.use(cors());
app.use(express.json());

app.use('/views', express.static(path.join(__dirname, 'views')));

app.post('/api/verify-login', async (req, res) => {
    const { idToken } = req.body;

    try {
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const payload = response.data;

        if (payload.email_verified === 'true') {
            const sessionToken = crypto.randomBytes(32).toString('hex');
            sessions[sessionToken] = { email: payload.email, createdAt: Date.now() };
            res.json({ success: true, sessionToken });
        } else {
            res.status(401).json({ success: false, message: 'Email not verified' });
        }
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid ID Token' });
    }
});

app.post('/download', (req, res) => {
    const { tweetUrl } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing session token' });
    }

    const sessionToken = authHeader.split('Bearer ')[1];
    if (!sessions[sessionToken]) {
        return res.status(403).json({ error: 'Unauthorized - Invalid session token' });
    }

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_FOLDER, fileName);
    const command = `yt-dlp --cookies twitter_cookies.txt -f bestvideo+bestaudio --merge-output-format mp4 -o "${filePath}" "${tweetUrl}"`;

    exec(command, (error) => {
        if (error) return res.status(500).json({ error: 'Failed to download video' });
        res.json({ downloadUrl: `http://${PUBLIC_HOST}:${PORT}/files/${fileName}` });
        setTimeout(() => fs.unlink(filePath, () => { }), 10 * 60 * 1000);
    });
});

app.use('/files', express.static(DOWNLOAD_FOLDER));
app.listen(PORT, () => console.log(`Server running on http://${HOST}:${PORT}`));
