const fs = require('fs');
const path = require('path');

// Config - Set your production server address here
const PRODUCTION_SERVER = '149.56.12.157';

// Files to process
const filesToProcess = ['background.js', 'content.js', 'manifest.json'];

// Helper to remove console.logs
function removeConsoleLogs(content) {
    return content.replace(/^\s*console\.log.*$/gm, '');
}

// Helper to replace 'localhost' with production IP
function replaceServerAddress(content) {
    return content.replace(/localhost/g, PRODUCTION_SERVER);
}

// Process files
filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    content = removeConsoleLogs(content);
    content = replaceServerAddress(content);

    const outputDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    fs.writeFileSync(path.join(outputDir, file), content);
    console.log(`✅ Processed ${file}`);
});

// Copy all other files (icons, etc.)
const assets = ['icons', 'popup.html'];

assets.forEach(asset => {
    const assetPath = path.join(__dirname, 'src', asset);
    const destPath = path.join(__dirname, 'dist', asset);

    if (fs.existsSync(assetPath)) {
        if (fs.statSync(assetPath).isDirectory()) {
            fs.cpSync(assetPath, destPath, { recursive: true });
        } else {
            fs.copyFileSync(assetPath, destPath);
        }
        console.log(`✅ Copied ${asset}`);
    }
});

console.log('🚀 Build complete!');
