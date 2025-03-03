chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const HOST = "localhost";
    // const HOST = "149.56.12.157";
    const PORT = "3000";
    if (message.action === "download_video") {
        chrome.storage.local.get('xCookies', (result) => {
            if (!result.xCookies || result.xCookies.length === 0) {
                console.error("No cookies available.");
                sendResponse({ status: "error", message: "You must be logged into X." });
                return;
            }
            // Send cookies to the backend
            fetch(`http://${HOST}:${PORT}/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tweetUrl: message.url, cookies: result.xCookies })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.downloadUrl) {
                        chrome.downloads.download({ url: data.downloadUrl }, (downloadId) => {
                            if (chrome.runtime.lastError) {
                                console.error("Download failed:", chrome.runtime.lastError);
                                sendResponse({ status: "error" });
                            } else {
                                console.log("Download started:", downloadId);
                                sendResponse({ status: "success" });
                            }
                        });
                    } else {
                        console.error("No valid download URL in response.");
                        sendResponse({ status: "error" });
                    }
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                    sendResponse({ status: "error" });
                });
        });

    }
});
function fetchXCookies() {
    chrome.cookies.getAll({ domain: "x.com" }, (cookies) => {
        if (cookies.length > 0) {
            // Store the cookies in extension storage
            chrome.storage.local.set({ xCookies: cookies }, () => {
                console.log("✅ X Cookies saved successfully.");
            });
        } else {
            console.warn("⚠️ No X cookies found. User may not be logged in.");
        }
    });
}

// Run this when the extension loads
chrome.runtime.onStartup.addListener(fetchXCookies);
chrome.runtime.onInstalled.addListener(fetchXCookies);
