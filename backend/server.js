const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');

// Ensure the downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

app.use(cors()); 
app.use(express.json()); 

// API endpoint to download the video
app.post('/download', async (req, res) => {
    const { tweetUrl } = req.body;
    if (!tweetUrl) {
        return res.status(400).json({ error: 'Tweet URL is required' });
    }

    // Generate a unique filename
    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_FOLDER, fileName);

    console.log(`Downloading video from: ${tweetUrl}`);

    // Run yt-dlp to download the video
    const command = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${filePath}" "${tweetUrl}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`yt-dlp error: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download video' });
        }

        console.log(`Download complete: ${filePath}`);

        // Send the video to the user
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error(`Error sending file: ${err}`);
            } else {
                console.log(`File sent: ${fileName}`);

                // Delete the file after sending
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${err}`);
                    } else {
                        console.log(`File deleted: ${fileName}`);
                    }
                });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
