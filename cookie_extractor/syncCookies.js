const { exec } = require("child_process");
const puppeteer = require("puppeteer");
const fs = require("fs");

// Your remote server details
const REMOTE_SERVER = "your-user@your-server-ip";
const REMOTE_PATH = "/home/your-user/twitter_cookies.txt";

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // Set to true for full automation
        userDataDir: "./chrome_data", // Persist login session
    });

    const page = await browser.newPage();
    await page.goto("https://x.com/", { waitUntil: "networkidle2" });

    console.log("Waiting for login...");
    await page.waitForTimeout(10000); // Give time to manually log in (adjust as needed)

    const cookies = await page.cookies();
    const cookieString = cookies
        .map(
            (c) =>
                `${c.name}\t${c.domain}\t${c.path}\t${c.secure ? "TRUE" : "FALSE"}\t0\t${c.name}\t${c.value}`
        )
        .join("\n");

    fs.writeFileSync("twitter_cookies.txt", cookieString);
    console.log("✅ Cookies saved to twitter_cookies.txt");

    // Sync cookies to the remote server
    console.log("📡 Uploading cookies to remote server...");
    exec(`scp twitter_cookies.txt ${REMOTE_SERVER}:${REMOTE_PATH}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error uploading cookies: ${stderr}`);
        } else {
            console.log("✅ Cookies successfully uploaded to remote server!");
        }
    });

    await browser.close();
})();
