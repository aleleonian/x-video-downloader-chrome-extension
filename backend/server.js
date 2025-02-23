const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");

// Ensure the downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER);
}

app.use(cors());
app.use(express.json());

// API to process video download
app.post("/download", async (req, res) => {
  const { tweetUrl } = req.body;
  if (!tweetUrl) {
    return res.status(400).json({ error: "Tweet URL is required" });
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
      return res.status(500).json({ error: "Failed to download video" });
    }

    console.log(`Download complete: ${filePath}`);

    // Return a direct URL to the file
    const downloadUrl = `http://localhost:${PORT}/files/${fileName}`;
    res.json({ downloadUrl });

    // Optional: Delete after some time
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`File deleted: ${fileName}`);
        }
      });
    }, 5 * 60 * 1000); // 5 minutes
  });
});

// Serve files for direct download
app.use("/files", express.static(DOWNLOAD_FOLDER));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
