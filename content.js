// 1️⃣ Inject the CSS animation into the page
const style = document.createElement("style");
style.innerHTML = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// 2️⃣ Function to create the spinner
function createSpinner() {
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.cssText = `
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid #4CAF50; /* Green color */
        border-right: 2px solid #4CAF50;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        margin-left: 5px;
    `;
  return spinner;
}


// 3️⃣ Function to add the download button to tweets
function addDownloadButton() {
  const buttonInnerText = "⬇️";

  document.querySelectorAll("article").forEach((article) => {
    if (article.querySelector(".download-video-btn")) return; // Avoid duplicates

    const video = article.querySelector("video");
    if (!video) return; // Only add button if video exists

    const tweetLink = article.querySelector('a[href*="/status/"]');
    const tweetUrl = tweetLink ? `https://x.com${tweetLink.getAttribute('href')}` : null;

    if (!tweetUrl) {
      console.warn("Could not find tweet URL");
      return;
    }
    const btn = document.createElement("button");

    btn.innerText = buttonInnerText;
    btn.className = "download-video-btn";
    btn.style.cssText =
      "color:#fff; border:none; padding:5px 10px; cursor:pointer; font-size:21px; border-radius:5px; margin-left:10px; transition: background 0.3s ease, color 0.3s ease;";
    // "background:#1DA1F2; color:#fff; border:none; padding:5px 10px; cursor:pointer; font-size:12px; border-radius:5px; margin-left:10px; transition: background 0.3s ease, color 0.3s ease;";

    btn.addEventListener("click", () => {
      btn.innerText = "";
      const spinner = createSpinner();
      btn.appendChild(spinner);
      btn.disabled = true;

      chrome.runtime.sendMessage(
        { action: "download_video", url: tweetUrl },
        (response) => {
          if (chrome.runtime.lastError || response?.status !== "success") {
            console.error("Download failed!");

            // Show error visually
            btn.innerText = "👎🏻";
            btn.style.background = "red";
            btn.style.color = "white";

            // Revert back to normal after 5 seconds
            setTimeout(() => {
              btn.innerText = buttonInnerText;
              btn.style.background = "#1DA1F2";
              btn.style.color = "#fff";
              btn.disabled = false;
            }, 5000);
            return;
          }

          console.log("Download started!");

          // Revert back to normal after download starts
          setTimeout(() => {
            btn.innerText = buttonInnerText;
            btn.disabled = false;
          }, 3000);
        }
      );
    });

    // Insert the button into the tweet's action buttons
    const controls = article.querySelector('div[role="group"]');
    if (controls) {
      controls.appendChild(btn);
    }
  });
}

// 4️⃣ Run function immediately and observe for new tweets
addDownloadButton();

const observer = new MutationObserver(addDownloadButton);
observer.observe(document.body, { childList: true, subtree: true });
