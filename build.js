const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = ['background.js', 'content.js', 'manifest.json'];

// Helper to remove console.logs
function removeConsoleLogs(content) {
    return content.replace(/^\s*console\.log.*$/gm, '');
}

// Process files
filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    content = removeConsoleLogs(content);

    const outputDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    fs.writeFileSync(path.join(outputDir, file), content);
    console.log(`✅ Processed ${file}`);
});

// Copy all other files (icons, etc.)
const assets = ['icons', 'popup.html', 'popup.js', 'readme.md'];

assets.forEach(asset => {
    const assetPath = path.join(__dirname, asset);
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
