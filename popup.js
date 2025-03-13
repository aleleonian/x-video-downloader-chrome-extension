document.addEventListener("DOMContentLoaded", () => {
    const backendInput = document.getElementById("backendURL");
    const saveButton = document.getElementById("save");
    const status = document.getElementById("status");
    const showCookiesButton = document.getElementById("showCookies");
    const helpButton = document.getElementById("helpBtn");

    // Load stored backend URL
    chrome.storage.local.get("backendURL", (result) => {
        backendInput.value = result.backendURL || "http://149.56.12.157:3000"; // Default backend
    });

    // Save backend URL
    saveButton.addEventListener("click", () => {
        const newBackend = backendInput.value.trim();
        if (!newBackend.startsWith("http")) {
            status.textContent = "❌ Invalid URL format";
            status.style.color = "red";
            return;
        }

        chrome.storage.local.set({ backendURL: newBackend }, () => {
            status.textContent = "✅ Backend URL saved!";
            status.style.color = "green";
            setTimeout(() => { status.textContent = ""; }, 3000); // Clear message after 3 seconds
        });
    });

    // Show stored cookies
    showCookiesButton.addEventListener("click", () => {
        chrome.storage.local.get("xCookies", (data) => {
            const output = document.getElementById("output");
            output.textContent = data.xCookies && data.xCookies.length
                ? JSON.stringify(data.xCookies, null, 2)
                : "No stored cookies found.";
        });
    });

    // ✅ Open README in a new tab
    helpButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "open_readme" });
    });
});
