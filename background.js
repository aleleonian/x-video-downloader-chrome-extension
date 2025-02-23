chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download_video") {
    // fetch("https://your-backend.com/download", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ tweetUrl: message.url })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.downloadUrl) {
    //         chrome.downloads.download({ url: data.downloadUrl });
    //     } else {
    //         console.error("Download URL missing from API response.");
    //     }
    // })
    // .catch(error => console.error("Error sending download request:", error));
    console.log("we should post this to the backend->", message.url);
  }
});
