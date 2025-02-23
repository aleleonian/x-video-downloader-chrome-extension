chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download_video") {
    fetch("http://localhost:3000/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweetUrl: message.url }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.downloadUrl) {
          console.log("Starting download:", data.downloadUrl);
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
          console.error("No download URL in response.");
          sendResponse({ status: "error" });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ status: "error" });
      });

    return true; // Keep the response channel open for async sendResponse
  }
});
