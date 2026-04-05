const fs = require('fs');
const path = require('path');

function isCorrupted(text) {
  // Common corrupted sequences for common English keywords:
  // "import " -> "浩潰瑲 "  (but space is part of next pair)
  // Check if it has an unusually high amount of CJK Unified Ideographs
  // that map to ASCII when decoded as UTF-16LE.
  
  // Actually, we can check if decoding it as UTF-16LE yields valid ASCII/UTF-8.
  let validAscii = 0;
  for(let i=0; i<Math.min(text.length, 100); i++) {
    const code = text.charCodeAt(i);
    const b1 = code & 0xff;
    const b2 = (code >> 8) & 0xff;
    if (b1 < 128) validAscii++;
    if (b2 > 0 && b2 < 128) validAscii++;
  }
  
  // If we decode it as utf8, does it look like code?
  const buf = Buffer.alloc(text.length * 2);
  for(let i=0; i<text.length; i++) buf.writeUInt16LE(text.charCodeAt(i), i*2);
  const decoded = buf.toString('utf8');
  
  if (text.includes('浩潰瑲') || text.includes('硥潰瑲') || text.includes('潣獮') || text.includes('畦据楴湯')) {
      return true;
  }
  
  // Check for common React/Typescript/Node code keywords in the *decoded* string, while the *original* string doesn't have it
  if (!text.includes('import ') && decoded.includes('import ')) return true;
  if (!text.includes('export ') && decoded.includes('export ')) return true;
  if (!text.includes('const ') && decoded.includes('const ')) return true;
  if (!text.includes('function ') && decoded.includes('function ')) return true;
  if (!text.includes('require(') && decoded.includes('require(')) return true;
  if (!text.includes('{"') && decoded.includes('{"')) return true; // package.json etc
  if (!text.includes('interface ') && decoded.includes('interface ')) return true;
  
  return false;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'fix.js') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.html') || file.endsWith('.css')) {
            try {
                const text = fs.readFileSync(fullPath, 'utf8');
                if (isCorrupted(text)) {
                    console.log(`Fixing corrupted file: ${fullPath}`);
                    const buf = Buffer.alloc(text.length * 2);
                    for(let i=0; i<text.length; i++) {
                        buf.writeUInt16LE(text.charCodeAt(i), i*2);
                    }
                    
                    // The buffer might end with a null byte if there's an odd number of bytes originally 
                    // decoded as utf-16, but wait, text.length * 2 is exact.
                    // Wait, what if the last character was a single byte trailing? 
                    // In JS strings, length is utf-16 code units.
                    
                    let decoded = buf.toString('utf8');
                    // some trailing null bytes might be there if not aligned perfectly, just trim nulls at the end
                    decoded = decoded.replace(/\0+$/, '');
                    
                    fs.writeFileSync(fullPath, decoded, 'utf8');
                }
            } catch (e) {
                console.error(`Error processing ${fullPath}`, e);
            }
        }
    }
}

processDirectory('.');
console.log("Done checking files.");
