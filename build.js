const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Files to process
const filesToProcess = ['background.js', 'content.js', 'manifest.json'];

// Helper to remove console.logs
function removeConsoleLogs(content) {
    return content.replace(/^\s*console\\.log.*$/gm, '');
}

// Ensure the /dist directory exists
const outputDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Process JavaScript and Manifest Files
filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    content = removeConsoleLogs(content);

    fs.writeFileSync(path.join(outputDir, file), content);
    console.log(`✅ Processed ${file}`);
});

// Copy all other files (icons, popup, etc.)
const assets = ['icons', 'popup.html', 'popup.js', 'readme.md'];

assets.forEach(asset => {
    const assetPath = path.join(__dirname, asset);
    const destPath = path.join(outputDir, asset);

    if (fs.existsSync(assetPath)) {
        if (fs.statSync(assetPath).isDirectory()) {
            fs.cpSync(assetPath, destPath, { recursive: true });
        } else {
            fs.copyFileSync(assetPath, destPath);
        }
        console.log(`✅ Copied ${asset}`);
    }
});

console.log('🚀 Files processed. Now creating ZIP...');

// ✅ **Step: Create a ZIP File**
const zipFilePath = path.join(__dirname, 'dist/', 'extension-ready.zip');
const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`✅ ZIP created: ${zipFilePath} (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);
archive.directory(outputDir, false); // Add all contents of /dist to the ZIP
archive.finalize();
