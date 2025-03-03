const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = "localhost";
const PUBLIC_HOST = process.env.PUBLIC_HOST_ADDRESS;
const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');


// Ensure the downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

checkEnvVars(["CHROME_EXTENSION_ID", "PUBLIC_HOST_ADDRESS"]);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const allowedOrigins = [
        `chrome-extension://${process.env.CHROME_EXTENSION_ID}`
    ];

    if (!allowedOrigins.includes(req.headers.origin)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
});

// API to download video
app.post('/download', async (req, res) => {
    const { tweetUrl } = req.body;
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

        // Return a direct link to the file
        const downloadUrl = `http://${PUBLIC_HOST}:${PORT}/files/${fileName}`;
        res.json({ downloadUrl });

        // Delete the file 10 minutes after creation (to avoid issues)
        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                } else {
                    console.log(`File deleted: ${fileName}`);
                }
            });
        }, 10 * 60 * 1000); // 10 minutes
    });
});

// Serve static files for direct download
app.use('/files', express.static(DOWNLOAD_FOLDER));

app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});


function checkEnvVars(requiredVars) {
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
        process.exit(1);
    }

    console.log("✅ All required environment variables are set.");
}

