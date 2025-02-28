const LOGIN_URL = "http://149.56.12.157:3000/views/login.html";  // Your VPS login page

// Open the login page in a new window when popup opens
window.onload = function () {
    const popup = window.open(LOGIN_URL, "_blank", "width=500,height=600");

    if (!popup) {
        alert("Please allow popups for this extension.");
        return;
    }

    // Poll until the popup closes, then check for stored sessionToken
    const pollTimer = setInterval(() => {
        if (popup.closed) {
            clearInterval(pollTimer);
            chrome.storage.local.get('sessionToken', (result) => {
                if (result.sessionToken) {
                    console.log("Session token retrieved:", result.sessionToken);
                    alert("Login successful! You may now close this tab.");
                } else {
                    console.error("No session token found. Login failed.");
                    alert("Login failed. Please try again.");
                }
            });
        }
    }, 1000);
};
