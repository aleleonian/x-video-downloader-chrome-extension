const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const sessions = {}; // In-memory session store (for simplicity)

const app = express();
const PORT = 3000;
const HOST = "localhost";
const PUBLIC_HOST = "149.56.12.157";
const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');

// Ensure the downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', async (req, res) => {
    const { tweetUrl } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing session token' });
    }

    const sessionToken = authHeader.split('Bearer ')[1];
    const session = sessions[sessionToken];

    if (!session) {
        return res.status(403).json({ error: 'Unauthorized - Invalid session token' });
    }

    if (!tweetUrl) {
        return res.status(400).json({ error: 'Tweet URL is required' });
    }

    console.log(`User ${session.email} requested video download`);

    // (yt-dlp download logic here - unchanged)
});

// app.post('/api/verify-login', async (req, res) => {
//     const { idToken } = req.body;

//     try {
//         const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
//         const payload = response.data;

//         if (payload.email_verified === 'true') {
//             // Create a random session token
//             const sessionToken = crypto.randomBytes(32).toString('hex');
//             sessions[sessionToken] = { email: payload.email, createdAt: Date.now() };

//             res.json({ success: true, sessionToken });
//         } else {
//             res.status(401).json({ success: false, message: 'Email not verified' });
//         }
//     } catch (error) {
//         console.error('Failed to verify login:', error.message);
//         res.status(401).json({ success: false, message: 'Invalid ID Token' });
//     }
// });

// ✅ Helper Function - Verify Google OAuth Token
async function verifyGoogleToken(token) {
    try {
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        console.log('Google TokenInfo response:', response.data); // Show full token info for debugging
        return response.status === 200 && response.data.email_verified === 'true';
    } catch (error) {
        if (error.response) {
            console.error("Token verification failed:", error.response.data);
        } else {
            console.error("Token verification failed:", error.message);
        }
        return false;
    }
}

// ✅ Secured Download Endpoint
app.post('/download', async (req, res) => {
    const { tweetUrl } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Missing or malformed authorization header');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];

    console.log('Received Authorization Header:', authHeader);
    console.log('Extracted Token:', token);
    console.log('Verifying token with Google...');

    const isValid = await verifyGoogleToken(token);
    if (!isValid) {
        console.warn('Token verification failed');
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    if (!tweetUrl) {
        console.warn('Missing tweet URL in request');
        return res.status(400).json({ error: 'Tweet URL is required' });
    }

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_FOLDER, fileName);

    console.log(`✅ Token verified successfully`);
    console.log(`📥 Starting download for tweet: ${tweetUrl}`);

    const command = `yt-dlp --cookies twitter_cookies.txt -f bestvideo+bestaudio --merge-output-format mp4 -o "${filePath}" "${tweetUrl}"`;

    exec(command, (error, stdout, stderr) => {
        console.log('yt-dlp stdout:', stdout);
        console.error('yt-dlp stderr:', stderr);

        if (error) {
            console.error(`❌ yt-dlp error: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download video' });
        }

        console.log(`✅ Download complete: ${filePath}`);

        const downloadUrl = `http://${PUBLIC_HOST}:${PORT}/files/${fileName}`;
        res.json({ downloadUrl });

        // Schedule file deletion in 10 minutes
        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`❌ Error deleting file: ${err}`);
                } else {
                    console.log(`🗑️ File deleted: ${fileName}`);
                }
            });
        }, 10 * 60 * 1000); // 10 minutes
    });
});

// ✅ Serve static files (for downloading videos)
app.use('/files', express.static(DOWNLOAD_FOLDER));

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
