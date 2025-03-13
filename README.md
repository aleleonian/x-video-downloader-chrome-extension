# Twitter Video Downloader - Chrome Extension

## 🚀 About the Project
This Chrome extension adds a **⬇️** button to tweets containing videos on X (formerly Twitter). When clicked, it sends the tweet URL and user authentication cookies to a backend server, which downloads the video using `yt-dlp` and provides a direct download link. Users can configure the backend server, either using the default one or setting up their own.

## 🎯 Features
✅ Adds a **⬇️** button to tweets with videos.  
✅ Automatically fetches X cookies for authentication.  
✅ Sends tweet URL and cookies to a backend for processing.  
✅ Users can configure their own backend or use the default one.  
✅ Uses `yt-dlp` on the server to fetch and serve the video.  
✅ Deletes temporary files after download to keep things clean.

---

## 📦 Installation

### 1️⃣ **Load the Extension in Chrome**
1. Download the latest release ZIP from [https://github.com/aleleonian/x-video-downloader-chrome-extension/releases/](#) _(or build manually - see below)_.
2. Extract the ZIP.
3. Open **Chrome** and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load Unpacked** and select the extracted folder.
6. The extension should now be installed!

### 2️⃣ **Backend Setup (Node.js Server)**
The backend server is responsible for downloading the videos.
This extension requires a **backend server** to fetch and serve videos.

#### ✅ **Option 1: Use the Default Backend**
By default, the extension uses:

http://149.56.12.157:3000

No setup required! Just install the extension and start downloading.

---

#### 🔧 **Option 2: Run Your Own Backend**
If you prefer to use your own server, you can set it up in **a few minutes**.

1. **Download the backend from GitHub**  

https://github.com/aleleonian/x-video-downloader-chrome-extension.git

#### **Prerequisites:**
- Node.js installed.
- `yt-dlp` installed (`pip install yt-dlp`).

#### 2. **Run the Server:**
```sh
cd backend
npm install
node server.js
```
_(Make sure you update `.env` including data for these variables: CHROME_EXTENSION_ID, PUBLIC_HOST_ADDRESS)_


3. **Set the backend in the extension settings**:  
- Click the extension icon in Chrome.
- Enter `http://localhost:3000`.
- Click **Save**.

---

## 🚀 **Final Thoughts**
- You can always **switch back to the default backend** by clearing the input field in the settings.
- Running your own backend **gives you full control over your downloads**.

---

## ⚙️ Development & Build Process
If you want to modify the extension, follow these steps:

### 🛠 Development Setup
1. Edit files inside the `src/` directory.
2. Use `console.log()` freely for debugging.
3. Run `node build.js` to create a production-ready extension.

### 🏗 Production Build
Before publishing, remove debugging logs and update server addresses.
```sh
node build.js
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

