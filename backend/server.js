const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;
const HOST = "localhost";
const PUBLIC_HOST = "149.56.12.157";
const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

app.use(cors());
app.use(express.json());

// ✅ Helper Function - Verify Google OAuth Token
async function verifyGoogleToken(token) {
    try {
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        return response.status === 200 && response.data.email_verified === 'true';
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return false;
    }
}

// ✅ Secured Download Endpoint
app.post('/download', async (req, res) => {
    const { tweetUrl } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];

    console.log('Received Token:', token);

    const isValid = await verifyGoogleToken(token);
    if (!isValid) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    if (!tweetUrl) {
        return res.status(400).json({ error: 'Tweet URL is required' });
    }

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_FOLDER, fileName);

    console.log(`Downloading video from: ${tweetUrl}`);

    const command = `yt-dlp --cookies twitter_cookies.txt -f bestvideo+bestaudio --merge-output-format mp4 -o "${filePath}" "${tweetUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`yt-dlp error: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download video' });
        }

        console.log(`Download complete: ${filePath}`);
        const downloadUrl = `http://${PUBLIC_HOST}:${PORT}/files/${fileName}`;
        res.json({ downloadUrl });

        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Error deleting file: ${err}`);
            });
        }, 10 * 60 * 1000);
    });
});

app.use('/files', express.static(DOWNLOAD_FOLDER));

app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
