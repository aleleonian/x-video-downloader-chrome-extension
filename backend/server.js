require("dotenv").config();

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

    const requestOrigin = req.headers.origin;

    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
        console.warn(`Blocked request from origin: ${requestOrigin}`);
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
});

// API to download video
app.post('/download', async (req, res) => {
    const { tweetUrl, cookies } = req.body;

    if (!tweetUrl) {
        return res.status(400).json({ error: 'Tweet URL is required' });
    }

    if (!cookies) {
        return res.status(400).json({ error: 'Cookies are required' });
    }

    if (!Array.isArray(cookies) || cookies.length === 0) {
        return res.status(400).json({ error: 'Cookies are required' });
    }

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_FOLDER, fileName);
    const cookiesFilePath = path.join(DOWNLOAD_FOLDER, `cookies_${Date.now()}.txt`);

    try {
        console.log(`Downloading video from: ${tweetUrl}`);

        // Write user-provided cookies to a temporary file
        fs.writeFileSync(cookiesFilePath, formatCookiesForYtDlp(cookies));

        const command = `yt-dlp --cookies "${cookiesFilePath}" -f bestvideo+bestaudio --merge-output-format mp4 -o "${filePath}" "${tweetUrl}"`;

        exec(command, (error, stdout, stderr) => {
            // Delete the temporary cookies file after the download
            fs.unlink(cookiesFilePath, () => { });

            if (error) {
                console.error(`yt-dlp error: ${stderr}`);
                return res.status(500).json({ error: 'Failed to download video' });
            }

            console.log(`Download complete: ${filePath}`);

            // Return a direct link to the file
            const downloadUrl = `http://${PUBLIC_HOST}:${PORT}/files/${fileName}`;
            res.json({ downloadUrl });

            // Delete the file 10 minutes after creation
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

    } catch (err) {
        console.error("Error preparing download:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
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

function formatCookiesForYtDlp(cookies) {
    const lines = ["# Netscape HTTP Cookie File"];

    cookies.forEach(cookie => {
        const {
            domain, path, secure, name, value, expirationDate, httpOnly
        } = cookie;

        // Strip leading dot
        const cleanDomain = domain.startsWith(".") ? domain.substring(1) : domain;

        const isHttpOnly = httpOnly ? "#HttpOnly_" : "";
        const secureFlag = secure ? "TRUE" : "FALSE";
        const expiry = expirationDate ? Math.floor(expirationDate) : 0;

        // The real trick — force domain_specified to FALSE (host-only mode)
        const domainSpecified = "FALSE";

        // Assemble the line
        lines.push(`${isHttpOnly}${cleanDomain}\t${domainSpecified}\t${path}\t${secureFlag}\t${expiry}\t${name}\t${value}`);
    });

    return lines.join("\n");
}




