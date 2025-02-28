chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const HOST = "149.56.12.157";
    const PORT = "3000";
    if (message.action === "download_video") {
        fetch(`http://${HOST}:${PORT}/download`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tweetUrl: message.url })
        })
            .then(response => response.json())
            .then(data => {
                if (data.downloadUrl) {
                    console.log("Download URL received:", data.downloadUrl);

                    // Now trigger the download in Chrome
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

        return true; // Keep response channel open for async sendResponse
    }
});
