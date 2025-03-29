chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "download_video") {
        chrome.storage.local.get(['backendURL', 'xCookies'], (result) => {
            const backendURL = result.backendURL || "https://ale.ar:3003"; // Default backend
            const cookies = result.xCookies;

            if (!cookies || cookies.length === 0) {
                console.error("❌ No cookies available. User might not be logged into X.");
                showErrorNotification("You must be logged into X.");
                sendResponse({ status: "error", message: "You must be logged into X." });
                return;
            }

            console.log(`✅ Sending cookies and URL to backend: ${backendURL}`);

            fetch(`${backendURL}/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tweetUrl: message.url, cookies })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.downloadUrl) {
                        console.log("✅ Download URL received:", data.downloadUrl);

                        chrome.downloads.download({ url: data.downloadUrl }, (downloadId) => {
                            if (chrome.runtime.lastError) {
                                console.error("❌ Download failed:", chrome.runtime.lastError);
                                showErrorNotification("Download failed: " + chrome.runtime.lastError.message);
                                sendResponse({ status: "error" });
                            } else {
                                console.log("✅ Download started:", downloadId);
                                sendResponse({ status: "success" });
                            }
                        });
                    } else {
                        console.error("❌ No valid download URL in response.");
                        showErrorNotification("No valid download URL received from the server.");
                        sendResponse({ status: "error" });
                    }
                })
                .catch(error => {
                    console.error("❌ Fetch error:", error);
                    showErrorNotification("Network error: Unable to contact the backend.");
                    sendResponse({ status: "error" });
                });
        });

        return true; // Keep sendResponse open for async response
    }

    // ✅ Handle opening the README in a new tab
    if (message.action === "open_readme") {
        console.log("Opening README...");
        chrome.tabs.create({ url: "https://github.com/aleleonian/x-video-downloader-chrome-extension/blob/main/README.md" });
    }
});

// ✅ Fetch X cookies and store them
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

// ✅ Function to Show an Error Notification
function showErrorNotification(message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon.128.png",
        title: "Download Failed",
        message: message,
        priority: 2
    });

    console.log("⚠️ Notification displayed:", message);
}

// ✅ Run on extension startup or install
chrome.runtime.onStartup.addListener(fetchXCookies);
chrome.runtime.onInstalled.addListener(fetchXCookies);
