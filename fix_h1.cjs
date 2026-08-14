const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Match <h2 ...> ... </h1> and replace with </h2>
html = html.replace(/(<h2[^>]*>[\s\S]*?)<\/h1>/g, '$1</h2>');

fs.writeFileSync('index.html', html, 'utf8');
