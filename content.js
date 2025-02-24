function addDownloadButton() {
  document.querySelectorAll("article").forEach((article) => {
    if (article.querySelector(".download-video-btn")) return; // Avoid duplicates

    const video = article.querySelector("video");
    if (!video) return; // Only add button if video exists

    const tweetUrl = window.location.href;
    const btn = document.createElement("button");

    btn.innerText = "⬇️";
    btn.className = "download-video-btn";
    btn.style.cssText =
      "background:#1DA1F2; color:#fff; border:none; padding:5px 10px; cursor:pointer; font-size:12px; border-radius:5px; margin-left:10px;";

    btn.addEventListener("click", () => {
      // Change to loading state (GIF or spinner)
      btn.innerHTML = `<img src="${chrome.runtime.getURL(
        "assets/spinner.gif"
      )}" style="width:20px; height:20px;">`;
      btn.disabled = true;

      chrome.runtime.sendMessage(
        { action: "download_video", url: tweetUrl },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            btn.innerText = "⬇️";
            btn.disabled = false;
            return;
          }

          if (response?.status === "success") {
            console.log("Download started!");
          } else {
            console.error("Download failed!");
          }

          // Revert back to normal after download starts
          setTimeout(() => {
            btn.innerText = "⬇️";
            btn.disabled = false;
          }, 3000); // Simulating completion after 3 seconds
        }
      );
    });

    // Find the best place to insert the button
    const controls = article.querySelector('div[role="group"]'); // Like/Retweet section
    const videoContainer = video.parentElement; // Video container
    const tweetBody = article.querySelector('div[data-testid="tweetText"]'); // Tweet text

    if (controls) {
      controls.appendChild(btn); // Button next to Like/Retweet
    } else if (videoContainer) {
      videoContainer.appendChild(btn); // Button inside video container
    } else if (tweetBody) {
      tweetBody.parentElement.appendChild(btn); // Button below tweet text
    }
  });
}

// Run function immediately to add buttons on page load
addDownloadButton();

// Keep watching for new tweets (since Twitter loads dynamically)
const observer = new MutationObserver(() => {
  addDownloadButton();
});
observer.observe(document.body, { childList: true, subtree: true });
