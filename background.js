let cachedSessionToken = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const HOST = "149.56.12.157";  // Your VPS IP
    const PORT = "3000";

    if (message.action === "download_video") {
        // Check for sessionToken in storage
        chrome.storage.local.get('sessionToken', (result) => {
            cachedSessionToken = result.sessionToken || null;

            if (!cachedSessionToken) {
                console.warn("No valid session token found - triggering login popup.");

                // Open login popup and retry download after successful login
                openLoginPopup(() => {
                    chrome.storage.local.get('sessionToken', (result) => {
                        if (result.sessionToken) {
                            cachedSessionToken = result.sessionToken;
                            console.log("Session token obtained after login:", cachedSessionToken);

                            // After login, proceed with download
                            downloadVideo(message.url, sendResponse);
                        } else {
                            console.error("User did not log in, no session token found.");
                            sendResponse({ status: "error", message: "Login required" });
                        }
                    });
                });

            } else {
                // Token already exists, proceed with download
                downloadVideo(message.url, sendResponse);
            }
        });

        return true; // Allow async sendResponse
    }
});

function downloadVideo(tweetUrl, sendResponse) {
    const HOST = "149.56.12.157";  // Your VPS IP
    const PORT = "3000";

    fetch(`http://${HOST}:${PORT}/download`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cachedSessionToken}`
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
                console.error("No valid download URL received from backend.");
                sendResponse({ status: "error" });
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            sendResponse({ status: "error" });
        });
}

// Open the login page on your VPS in a popup window
function openLoginPopup(callback) {
    chrome.windows.create({
        url: "http://149.56.12.157:3000/views/login.html",
        type: "popup",
        width: 500,
        height: 600
    }, (newWindow) => {
        const pollInterval = setInterval(() => {
            chrome.windows.get(newWindow.id, (win) => {
                if (!win) {
                    clearInterval(pollInterval);

                    // Check if sessionToken got saved during login
                    chrome.storage.local.get('sessionToken', (result) => {
                        if (result.sessionToken) {
                            console.log("Session token retrieved after login:", result.sessionToken);
                            if (callback) callback(result.sessionToken);
                        } else {
                            console.error("No session token found after login.");
                            if (callback) callback(null);
                        }
                    });
                }
            });
        }, 1000);
    });
}
