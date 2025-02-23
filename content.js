// Function to add the download button
function addDownloadButton() {
    document.querySelectorAll('article').forEach(article => {
        if (article.querySelector('.download-video-btn')) return;

        const video = article.querySelector('video');
        if (!video) return;

        const tweetUrl = article.closest('a')?.href || window.location.href;
        const btn = document.createElement('button');
        
        btn.innerText = "⬇️ Download Video";
        btn.className = "download-video-btn";
        btn.style.cssText = "position:absolute; bottom:10px; right:10px; background:#1DA1F2; color:#fff; border:none; padding:5px 10px; cursor:pointer; font-size:12px; border-radius:5px;";
        
        btn.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: "download_video", url: tweetUrl });
        });

        const controls = article.querySelector('div[role="group"]');
        if (controls) {
            controls.appendChild(btn);
        }
    });
}

// Run script whenever DOM updates
const observer = new MutationObserver(addDownloadButton);
observer.observe(document.body, { childList: true, subtree: true });

addDownloadButton();  // Run on page load
