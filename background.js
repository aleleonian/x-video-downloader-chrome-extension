let cachedIdToken = null;
const HOST = "149.56.12.157";
const PORT = "3000";
// Function to open the popup and trigger login
function openLoginPopup(callback) {
    chrome.windows.create({
        url: `http://${HOST}:${PORT}/views/login.html`,
        type: "popup",
        width: 500,
        height: 600
    }, (window) => {
        const pollInterval = setInterval(() => {
            chrome.windows.get(window.id, (win) => {
                if (!win) {
                    clearInterval(pollInterval);
                    chrome.storage.local.get('sessionToken', (result) => {
                        cachedSessionToken = result.sessionToken || null;
                        if (callback) callback();
                    });
                }
            });
        }, 1000);
    });
}


// Core download function (reuse it after login too)
function downloadVideo(tweetUrl, sendResponse) {

    fetch(`http://${HOST}:${PORT}/download`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cachedIdToken}`
        },
        body: JSON.stringify({ tweetUrl })
    })
        .then(response => response.json())
        .then(data => {
            if (data.downloadUrl) {
                console.log("Download URL received:", data.downloadUrl);

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
}

// Main message listener (handles all messages)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "download_video") {
        if (!cachedIdToken) {
            console.log("No cached ID token found, prompting login...");

            // Auto-prompt login, then retry download
            openLoginPopup(() => {
                // After login, retry the download
                downloadVideo(message.url, sendResponse);
            });

            return true; // Keep sendResponse open until after login & download
        }

        // Already logged in, proceed directly
        downloadVideo(message.url, sendResponse);
        return true; // Keep sendResponse open
    }
});
