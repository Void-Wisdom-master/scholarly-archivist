const fs = require('fs');
const path = require('path');

for (const ide of ['Code', 'Trae', 'Cursor', 'Code - Insiders']) {
  const historyDir = path.join(process.env.APPDATA, ide, 'User', 'History');
  if (!fs.existsSync(historyDir)) continue;

  const entries = fs.readdirSync(historyDir);
  for (const entry of entries) {
    const entryPath = path.join(historyDir, entry);
    if (fs.statSync(entryPath).isDirectory()) {
      const jsonPath = path.join(entryPath, 'entries.json');
      if (fs.existsSync(jsonPath)) {
        try {
          const data = fs.readFileSync(jsonPath, 'utf8');
          if (data.includes('App.tsx') || data.includes('scholarly-archivist')) {
            console.log(`[${ide}] MATCH:`, jsonPath);
            // console.log(data); // prevent spam, just list the paths
          }
        } catch(err) {}
      }
    }
  }
}
