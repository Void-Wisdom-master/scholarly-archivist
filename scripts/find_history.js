const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
if (!fs.existsSync(historyDir)) {
  console.log('History dir not found');
  process.exit(1);
}

const entries = fs.readdirSync(historyDir);
for (const entry of entries) {
  const entryPath = path.join(historyDir, entry);
  if (fs.statSync(entryPath).isDirectory()) {
    const jsonPath = path.join(entryPath, 'entries.json');
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      // Decode the resource path safely if it's URL encoded
      try {
        const decoded = decodeURIComponent(data);
        if (decoded.includes('App.tsx') && decoded.includes('稽古研史')) {
            console.log(jsonPath);
            console.log(data);
        }
      } catch (e) {
        if (data.includes('App.tsx')) {
            console.log(jsonPath);
            console.log(data);
        }
      }
    }
  }
}
