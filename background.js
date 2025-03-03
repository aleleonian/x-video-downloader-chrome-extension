chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const HOST = "localhost";
    // const HOST = "149.56.12.157";
    const PORT = "3000";

    if (message.action === "download_video") {
        chrome.storage.local.get('xCookies', (result) => {
            if (!result.xCookies || result.xCookies.length === 0) {
                console.error("❌ No cookies available. User might not be logged into X.");
                sendResponse({ status: "error", message: "You must be logged into X." });
                return;
            }

            console.log("✅ Sending cookies and URL to backend...");

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
                        console.log("✅ Download URL received from server:", data.downloadUrl);

                        chrome.downloads.download({ url: data.downloadUrl }, (downloadId) => {
                            if (chrome.runtime.lastError) {
                                console.error("❌ Download failed:", chrome.runtime.lastError);
                                sendResponse({ status: "error" });
                            } else {
                                console.log("✅ Download started with ID:", downloadId);
                                sendResponse({ status: "success" });
                            }
                        });
                    } else {
                        console.error("❌ No valid download URL in response from server.");
                        sendResponse({ status: "error" });
                    }
                })
                .catch(error => {
                    console.error("❌ Fetch error:", error);
                    sendResponse({ status: "error" });
                });

        });

        return true; // Important to keep sendResponse open for async response
    }
});

// Automatically fetch X cookies and store them in storage
function fetchXCookies() {
    chrome.cookies.getAll({ domain: "x.com" }, (cookies) => {
        if (cookies.length > 0) {
            chrome.storage.local.set({ xCookies: cookies }, () => {
                console.log(`✅ ${cookies.length} X cookies saved successfully.`);
            });
        } else {
            console.warn("⚠️ No X cookies found. User might not be logged into X.");
        }
    });
}

// Refresh cookies on extension startup or install
chrome.runtime.onStartup.addListener(fetchXCookies);
chrome.runtime.onInstalled.addListener(fetchXCookies);
