# Twitter Video Downloader - Chrome Extension

## 🚀 About the Project
This Chrome extension adds a **Download Video** button to tweets containing videos on X (formerly Twitter). When clicked, it sends the tweet URL and user authentication cookies to a backend server, which downloads the video using `yt-dlp` and provides a direct download link. Users can configure the backend server, either using the default one or setting up their own.

## 🎯 Features
✅ Adds a **Download Video** button to tweets with videos.  
✅ Automatically fetches X cookies for authentication.  
✅ Sends tweet URL and cookies to a backend for processing.  
✅ Users can configure their own backend or use the default one.  
✅ Uses `yt-dlp` on the server to fetch and serve the video.  
✅ Deletes temporary files after download to keep things clean.

---

## 📦 Installation

### 1️⃣ **Load the Extension in Chrome**
1. Download the latest release ZIP from [GitHub Releases](#) _(or build manually - see below)_.
2. Extract the ZIP.
3. Open **Chrome** and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load Unpacked** and select the extracted folder.
6. The extension should now be installed!

### 2️⃣ **Backend Setup (Node.js Server)**
The backend server is responsible for downloading the videos.

#### **Prerequisites:**
- Node.js installed.
- `yt-dlp` installed (`pip install yt-dlp`).

#### **Run the Server:**
```sh
cd backend
npm install
node server.js
```
_(Make sure you update `.env` with your public IP address!)_

---

## ⚙️ Development & Build Process
If you want to modify the extension, follow these steps:

### 🛠 Development Setup
1. Edit files inside the `src/` directory.
2. Use `console.log()` freely for debugging.
3. Run `npm run build` to create a production-ready extension.

### 🏗 Production Build
Before publishing, remove debugging logs and update server addresses.
```sh
npm run build
```
This will:
✅ Remove `console.log()` statements.  
✅ Replace `localhost` with the production server IP.  
✅ Copy files into a `dist/` folder.  
✅ Generate a `.zip` ready for upload.

---

## 🔒 Security & Privacy
🔹 This extension **does not collect or store personal data**.  
🔹 The cookies are only used for authentication **during the download request** and are not stored anywhere.  
🔹 The backend **deletes temporary cookies and video files** after processing.  

For more details, check our [Privacy Policy](#).

---

## 🚀 Configuring a Custom Backend
By default, the extension uses `149.56.12.157:3000` as the backend. Users can configure their own backend via the extension’s popup:
1. Click the extension icon in Chrome.
2. Enter your backend URL (e.g., `http://your-server.com:3000`).
3. Click **Save**.
4. The extension will now use your backend instead.

To reset to the default backend, clear the input field and save again.

---

## 🚀 Publishing to Chrome Web Store
To publish this extension:
1. Log in to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole).
2. Click **New Item**.
3. Upload `extension-ready.zip`.
4. Fill in the required details (title, description, privacy policy, screenshots).
5. Submit for review!

---

## 🛠 Technologies Used
- **Chrome Extensions API** (Manifest v3)
- **JavaScript (ES6)**
- **Node.js & Express**
- **yt-dlp** (for video downloads)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss.

---

## 📝 Credits
Developed by **[Alejandro Leonian]**. If you have any questions, feel free to reach out! 🚀

