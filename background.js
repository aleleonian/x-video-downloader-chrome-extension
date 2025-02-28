
let cachedSessionToken = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const HOST = "149.56.12.157";
    const PORT = "3000";

    if (message.action === "download_video") {
        chrome.storage.local.get('sessionToken', (result) => {
            cachedSessionToken = result.sessionToken || null;

            if (!cachedSessionToken) {
                console.error("No valid session token found. Please log in.");
                alert("Please log in to Google first by clicking the extension icon.");
                sendResponse({ status: "error" });
                return;
            }

            fetch(`http://${HOST}:${PORT}/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cachedSessionToken}`
                },
                body: JSON.stringify({ tweetUrl: message.url })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.downloadUrl) {
                        chrome.downloads.download({ url: data.downloadUrl }, (downloadId) => {
                            if (chrome.runtime.lastError) {
                                sendResponse({ status: "error" });
                            } else {
                                sendResponse({ status: "success" });
                            }
                        });
                    } else {
                        sendResponse({ status: "error" });
                    }
                })
                .catch(() => sendResponse({ status: "error" }));

            return true; // Keep sendResponse alive
        });

        return true; // Allow async handling
    }
});
