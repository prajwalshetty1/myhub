// Build script for Vercel - Injects environment variables into HTML
const fs = require('fs');
const path = require('path');

// Read environment variable
const apiUrl = process.env.VITE_API_URL || '/api';

// Read index.html
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace placeholder with actual API URL
html = html.replace(/'{{VITE_API_URL}}'/g, `'${apiUrl}'`);

// Write back
fs.writeFileSync(indexPath, html, 'utf8');

console.log(`✅ Injected API URL: ${apiUrl}`);

