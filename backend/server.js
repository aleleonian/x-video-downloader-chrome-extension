require("dotenv").config();

const rateLimit = require("express-rate-limit");
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST_ADDRESS;
const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");

// Queue for managing tasks
const downloadQueue = [];
let isProcessing = false;

// Ensure the downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

checkEnvVars(["HOST_ADDRESS"]);

app.use(cors());
app.use(express.json());

const downloadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 downloads per hour
    message: "Too many requests from this IP, please try again later (only 10 per hour).",
});

// this would only work for an extension downloaded from the store but not if i keep
// uploading the extension in dev mode.
// app.use((req, res, next) => {
//     const allowedOrigins = [`chrome-extension://${process.env.CHROME_EXTENSION_ID}`];
//     const requestOrigin = req.headers.origin;

//     if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
//         console.warn(`Blocked request from origin: ${requestOrigin}`);
//         return res.status(403).json({ error: "Forbidden" });
//     }

//     next();
// });

// API to queue a download
app.post("/download", downloadLimiter, async (req, res) => {
    const { tweetUrl, cookies } = req.body;

    if (!tweetUrl) {
        return res.status(400).json({ error: "Tweet URL is required" });
    }
    if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
        return res.status(400).json({ error: "Cookies are required" });
    }

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_FOLDER, fileName);
    const cookiesFilePath = path.join(DOWNLOAD_FOLDER, `cookies_${Date.now()}.txt`);

    // Create a task object and add it to the queue
    const task = {
        tweetUrl,
        cookies,
        fileName,
        filePath,
        cookiesFilePath,
        res,
    };
    downloadQueue.push(task);

    console.log(`📥 Task added to queue. Queue length: ${downloadQueue.length}`);

    // If no task is being processed, start processing
    if (!isProcessing) {
        processQueue();
    }
});

// Function to process the queue
async function processQueue() {
    if (downloadQueue.length === 0) {
        isProcessing = false;
        console.log("✅ Queue is empty. Waiting for new tasks...");
        return;
    }

    isProcessing = true;
    const task = downloadQueue.shift(); // Get the next task
    console.log(`🚀 Processing download task. Queue length: ${downloadQueue.length}`);

    try {
        // Write cookies to a file
        fs.writeFileSync(task.cookiesFilePath, formatCookiesForYtDlp(task.cookies));

        const command = `yt-dlp --cookies "${task.cookiesFilePath}" -f bestvideo+bestaudio --merge-output-format mp4 -o "${task.filePath}" "${task.tweetUrl}"`;

        exec(command, (error, stdout, stderr) => {
            // Delete the temporary cookies file after processing
            fs.unlink(task.cookiesFilePath, () => { });

            if (error) {
                console.error(`yt-dlp error: ${stderr}`);
                task.res.status(500).json({ error: "Failed to download video" });
            } else {
                console.log(`✅ Download complete: ${task.filePath}`);

                const downloadUrl = `http://${HOST}:${PORT}/files/${task.fileName}`;
                task.res.json({ downloadUrl });

                // Delete the file after 10 minutes
                setTimeout(() => {
                    fs.unlink(task.filePath, (err) => {
                        if (err) {
                            console.error(`❌ Error deleting file: ${err}`);
                        } else {
                            console.log(`🗑️ File deleted: ${task.fileName}`);
                        }
                    });
                }, 10 * 60 * 1000);
            }

            // Process the next task in the queue
            processQueue();
        });
    } catch (err) {
        console.error("❌ Error preparing download:", err);
        task.res.status(500).json({ error: "Internal server error" });
        processQueue(); // Continue processing next task
    }
}

// Serve static files for direct download
app.use("/files", express.static(DOWNLOAD_FOLDER));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

function checkEnvVars(requiredVars) {
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
        process.exit(1);
    }

    console.log("✅ All required environment variables are set.");
}

function formatCookiesForYtDlp(cookies) {
    const lines = ["# Netscape HTTP Cookie File"];

    cookies.forEach((cookie) => {
        const { domain, path, secure, name, value, expirationDate, httpOnly } = cookie;

        // Strip leading dot
        const cleanDomain = domain.startsWith(".") ? domain.substring(1) : domain;

        const isHttpOnly = httpOnly ? "#HttpOnly_" : "";
        const secureFlag = secure ? "TRUE" : "FALSE";
        const expiry = expirationDate ? Math.floor(expirationDate) : 0;

        // Force domain_specified to FALSE (host-only mode)
        const domainSpecified = "FALSE";

        // Assemble the line
        lines.push(
            `${isHttpOnly}${cleanDomain}\t${domainSpecified}\t${path}\t${secureFlag}\t${expiry}\t${name}\t${value}`
        );
    });

    return lines.join("\n");
}
