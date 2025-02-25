const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,  // Keep visible for debugging (set to true once tested)
        userDataDir: './chrome_data',  // 🔥 Persist login across runs!
    });

    const page = await browser.newPage();
    await page.goto('https://x.com/', { waitUntil: 'networkidle2' });

    console.log("Checking if logged in...");

    try {
        // ✅ New method: Wait for the "Home" button in the sidebar (only visible when logged in)
        await page.waitForSelector('a[href="/home"]', { timeout: 10000 });
        console.log("✅ Already logged in!");
    } catch (error) {
        console.warn("⚠️ Not logged in! Please log in manually...");
        await wait(30000); // Give 30 seconds to log in manually
    }

    console.log("✅ Extracting cookies...");
    const cookies = await page.cookies();
    const cookieString = cookies
        .map(c => `${c.name}\t${c.domain}\t${c.path}\t${c.secure ? "TRUE" : "FALSE"}\t0\t${c.name}\t${c.value}`)
        .join("\n");

    fs.writeFileSync('twitter_cookies.txt', cookieString);
    console.log("✅ Cookies saved to twitter_cookies.txt");

    await browser.close();
})();

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}