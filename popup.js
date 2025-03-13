document.addEventListener("DOMContentLoaded", () => {
    const backendInput = document.getElementById("backendURL");
    const saveButton = document.getElementById("save");
    const status = document.getElementById("status");

    // Load stored backend URL
    chrome.storage.local.get("backendURL", (result) => {
        backendInput.value = result.backendURL || "http://149.56.12.157:3000"; // Default backend
    });

    // Save backend URL
    saveButton.addEventListener("click", () => {
        const newBackend = backendInput.value.trim();
        if (!newBackend.startsWith("http")) {
            status.textContent = "❌ Invalid URL";
            status.style.color = "red";
            return;
        }

        chrome.storage.local.set({ backendURL: newBackend }, () => {
            status.textContent = "✅ Saved!";
            status.style.color = "green";
        });
    });
});

document.getElementById("showCookies").addEventListener("click", () => {
    chrome.storage.local.get("xCookies", (data) => {
        document.getElementById("output").textContent = JSON.stringify(data.xCookies, null, 2);
    });
});
